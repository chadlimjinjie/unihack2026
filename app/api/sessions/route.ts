import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return Response.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { courtId, title, skillLevel, playersHave, spotsTotal, startsAt, endsAt } = await req.json()

    if (!courtId || !startsAt || !endsAt) {
        return Response.json({ error: "Missing required fields." }, { status: 400 })
    }

    const startDate = new Date(startsAt)
    const endDate = new Date(endsAt)

    if (endDate <= startDate) {
        return Response.json({ error: "End time must be after start time." }, { status: 400 })
    }

    // Check for overlapping sessions as host
    const overlappingAsHost = await prisma.session_invite.findFirst({
        where: {
            host_id: session.user.id,
            status: { in: ["open", "full"] },
            starts_at: { lt: endDate },
            ends_at: { gt: startDate },
        },
    })

    if (overlappingAsHost) {
        return Response.json({ error: "You already have an overlapping session." }, { status: 400 })
    }

    // Check for overlapping sessions as participant
    const overlappingAsParticipant = await prisma.session_participant.findFirst({
        where: {
            user_id: session.user.id,
            session_invite: {
                status: { in: ["open", "full"] },
                starts_at: { lt: endDate },
                ends_at: { gt: startDate },
            },
        },
    })

    if (overlappingAsParticipant) {
        return Response.json({ error: "You are already part of an overlapping session." }, { status: 400 })
    }

    try {
        const newSession = await prisma.session_invite.create({
            data: {
                court_id: courtId,
                host_id: session.user.id,
                title: title || null,
                skill_level: skillLevel ?? "Any",
                players_have: playersHave ?? 1,
                spots_total: spotsTotal ?? 10,
                spots_filled: 0,
                starts_at: startDate,
                ends_at: endDate,
                status: "open",
            },
        })
        return Response.json({ success: true, id: Number(newSession.id) })
    } catch (error) {
        console.error(error)
        return Response.json({ error: "Failed to create session." }, { status: 500 })
    }
}