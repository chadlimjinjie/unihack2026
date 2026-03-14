import CourtPage from "./_components/CourtPage"
import { prisma } from "@/lib/prisma"

export default async function Page({ params }: { params: { id: string } }) {

    const { id } = await params

    const court = await prisma.court.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            review: {
                include: {
                    user: true,
                },
            },
        },
    })

    return <CourtPage court={court} />
}