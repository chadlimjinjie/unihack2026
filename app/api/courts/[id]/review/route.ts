import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextRequest } from "next/server"

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {

     const { id } = await context.params
    const courtId = Number(id)

    
    // Check session server-side — non-logged in users cannot get through
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        return Response.json({ error: "You must be logged in to leave a review." }, { status: 401 })
    }

    
    const { stars, thoughts } = await req.json()

    if (!stars || stars < 1 || stars > 5) {
        return Response.json({ error: "A star rating between 1 and 5 is required." }, { status: 400 })
    }

    try {
        await prisma.review.upsert({
    where: {
        user_id_court_id: {
            user_id: session.user.id,
            court_id: courtId,
        },
    },
    update: {
        stars,
        thoughts: thoughts || null,
        updated_at: new Date(),
    },
    create: {
        user_id: session.user.id,
        court_id: courtId,
        stars,
        thoughts: thoughts || null,
    },
})

        return Response.json({ success: true })
    } catch (error) {
        console.error("Review upsert error:", error)
        return Response.json({ error: "Failed to save review." }, { status: 500 })
    }
}