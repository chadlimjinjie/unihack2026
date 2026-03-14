import CourtPage from "./_components/CourtPage"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function Page({ params }: { params: { id: string } }) {

    const { id } = await params

    const session = await auth.api.getSession({
        headers: await headers(),
    })

    // Get the date string 7 days ago in UTC e.g. "2026-03-07"
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
    const dateStr = sevenDaysAgo.toISOString().slice(0, 10) // "2026-03-07"

    // Build start/end using explicit UTC midnight strings
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`)
    const endOfDay   = new Date(`${dateStr}T23:59:59.999Z`)

    const court = await prisma.court.findUnique({
        where: { id: Number(id) },
        include: {
            review: {
                include: { user: true },
            },
            occupancy_log: {
                where: {
                    court_id: Number(id),
                    created_at: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                orderBy: { created_at: "asc" },
            },
        },
    })

    const chartData = (court?.occupancy_log ?? []).map((entry) => ({
        time: entry.created_at.toISOString().slice(11, 16), // "06:00", "07:00" etc
        people: Number(entry.player_ct),
    }))

    return <CourtPage court={court} chartData={chartData} session={session} />
}