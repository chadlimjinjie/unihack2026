import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const courtId = Number(id)
  if (Number.isNaN(courtId)) {
    return NextResponse.json({ error: "Invalid court id" }, { status: 400 })
  }
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    select: { player_live: true },
  })
  if (!court) {
    return NextResponse.json({ error: "Court not found" }, { status: 404 })
  }
  const playerLive = court.player_live == null ? 0 : Number(court.player_live)
  return NextResponse.json({ player_live: playerLive })
}
