import { prisma } from "@/lib/prisma"
import { getBusiestCourtInsight } from "@/lib/busiest-court-insight"
import LandingPage from "./_components/LandingPage"

export default async function Page() {
  const courts = await prisma.court.findMany({
    select: { id: true, name: true, player_live: true },
  })
  const busiestCourt =
    courts.length > 0
      ? courts.reduce((best, c) =>
          Number(c.player_live ?? 0) > Number(best.player_live ?? 0) ? c : best
        )
      : null
  const busiestCourtInsight =
    busiestCourt != null
      ? await getBusiestCourtInsight(busiestCourt.name, busiestCourt.player_live)
      : null
  return (
    <LandingPage
      busiestCourt={busiestCourt}
      busiestCourtInsight={busiestCourtInsight}
    />
  )
}
