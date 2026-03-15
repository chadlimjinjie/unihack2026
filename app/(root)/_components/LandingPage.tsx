import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Circle } from "lucide-react"

type BusiestCourt = { id: bigint; name: string | null; player_live: bigint | null } | null

export default function LandingPage({
  busiestCourt = null,
  busiestCourtInsight = null,
}: {
  busiestCourt?: BusiestCourt
  busiestCourtInsight?: string | null
}) {
  return (
    <div className="landingBackground min-h-svh w-full">
      <div className="relative z-10 flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-display font-bold text-foreground">
            Find courts that match your vibe
          </h1>
          <p className="text-caption text-muted-foreground/90">
            Find courts · Join sessions · Get playing
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild size="lg">
              <Link href="/courts">Browse Courts</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {busiestCourt && (
            <section className="pt-8 text-center" aria-label="Busiest court">
              <Link
                href={`/courts/${busiestCourt.id}`}
                className="inline-flex items-center gap-2 text-base font-semibold text-primary hover:underline"
              >
                <Image
                  src="/icons/basketball-15.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="shrink-0"
                />
                <span>{busiestCourt.name ?? "Unnamed court"}</span>
                {Number(busiestCourt.player_live ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400" title="Court is busy">
                    <Circle className="h-2 w-2 fill-amber-500 text-amber-500" />
                    Busy
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400" title="Court is free">
                    <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500" />
                    Free
                  </span>
                )}
              </Link>
              {busiestCourtInsight && (
                <p className="text-sm text-muted-foreground mt-1.5">
                  {busiestCourtInsight}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
  
