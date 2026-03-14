import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest } from "next/server"

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return Response.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { id } = await params
    const sessionId = Number(id)
    const now = new Date()

    // Get the session first so we have its time range
    const invite = await prisma.session_invite.findUnique({
        where: { id: sessionId },
    })

    if (!invite) {
        return Response.json({ error: "Session not found." }, { status: 404 })
    }
    if (invite.ends_at < now) {
        return Response.json({ error: "This session has ended." }, { status: 400 })
    }

    const spotsFilled = invite.spots_filled ?? 0
    if (invite.status === "full" || spotsFilled >= invite.spots_total) {
        return Response.json({ error: "This session is full." }, { status: 400 })
    }
    if (invite.host_id === session.user.id) {
        return Response.json({ error: "You are the host of this session." }, { status: 400 })
    }

    // Check for overlapping sessions as participant
    const overlappingAsParticipant = await prisma.session_participant.findFirst({
        where: {
            user_id: session.user.id,
            session_invite: {
                status: { in: ["open", "full"] },
                starts_at: { lt: invite.ends_at },
                ends_at: { gt: invite.starts_at },
            },
        },
    })

    if (overlappingAsParticipant) {
        return Response.json({ error: "You already have an overlapping session." }, { status: 400 })
    }

    // Check for overlapping sessions as host
    const overlappingAsHost = await prisma.session_invite.findFirst({
        where: {
            host_id: session.user.id,
            status: { in: ["open", "full"] },
            starts_at: { lt: invite.ends_at },
            ends_at: { gt: invite.starts_at },
        },
    })

    if (overlappingAsHost) {
        return Response.json({ error: "You already have an overlapping session." }, { status: 400 })
    }

    try {
        await prisma.$transaction([
            prisma.session_participant.create({
                data: {
                    session_id: sessionId,
                    user_id: session.user.id,
                },
            }),
            prisma.session_invite.update({
                where: { id: sessionId },
                data: {
                    spots_filled: { increment: 1 },
                    status: spotsFilled + 1 >= invite.spots_total ? "full" : "open",
                },
            }),
        ])
        return Response.json({ success: true })
    } catch (error) {
        console.error(error)
        return Response.json({ error: "Failed to join session." }, { status: 500 })
    }
}