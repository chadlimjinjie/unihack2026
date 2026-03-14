import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest } from "next/server"

export async function POST(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return Response.json({ error: "You must be logged in." }, { status: 401 })
    }

    const { id } = await params
    const sessionId = Number(id)

    const invite = await prisma.session_invite.findUnique({
        where: { id: sessionId },
    })

    if (!invite) {
        return Response.json({ error: "Session not found." }, { status: 404 })
    }

    // If host — close the session entirely
    if (invite.host_id === session.user.id) {
        await prisma.session_invite.update({
            where: { id: sessionId },
            data: { status: "closed" },
        })
        return Response.json({ success: true })
    }

    // Otherwise remove participant and decrement spots_filled
    const participant = await prisma.session_participant.findUnique({
        where: {
            session_id_user_id: {
                session_id: sessionId,
                user_id: session.user.id,
            },
        },
    })

    if (!participant) {
        return Response.json({ error: "You are not in this session." }, { status: 400 })
    }

    await prisma.$transaction([
        prisma.session_participant.delete({
            where: {
                session_id_user_id: {
                    session_id: sessionId,
                    user_id: session.user.id,
                },
            },
        }),
        prisma.session_invite.update({
            where: { id: sessionId },
            data: {
                spots_filled: { decrement: 1 },
                status: "open",
            },
        }),
    ])

    return Response.json({ success: true })
}