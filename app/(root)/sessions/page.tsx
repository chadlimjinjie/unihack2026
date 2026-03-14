import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import SessionsClient from "./_components/SessionsClient"

export default async function Page() {

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    const now = new Date()

    // Fetch all open/active sessions with court and participant info
    const sessions = await prisma.session_invite.findMany({
        where: {
            status: { in: ["open", "full"] },
            ends_at: { gte: now },
        },
        include: {
            court: true,
            user: true,
            session_participant: {
                include: { user: true },
            },
        },
        orderBy: { starts_at: "asc" },
    })

    // Fetch all courts for the "start session" form
    const courts = await prisma.court.findMany({
        orderBy: { name: "asc" },
    })

    // Check if current user is already hosting or in a session
    const userActiveSession = session
        ? await prisma.session_invite.findFirst({
            where: {
                status: { in: ["open", "full"] },
                ends_at: { gte: now },
                OR: [
                    { host_id: session.user.id },
                    { session_participant: { some: { user_id: session.user.id } } },
                ],
            },
        })
        : null

    return (
        <SessionsClient
            sessions={JSON.parse(JSON.stringify(sessions, (_, v) =>
                typeof v === "bigint" ? Number(v) : v
            ))}
            courts={JSON.parse(JSON.stringify(courts, (_, v) =>
                typeof v === "bigint" ? Number(v) : v
            ))}
            currentSession={session}
            userActiveSessionId={userActiveSession ? Number(userActiveSession.id) : null}
        />
    )
}