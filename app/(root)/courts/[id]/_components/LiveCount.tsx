"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"

const POLL_INTERVAL_MS = 5000

export default function LiveCount({
  count,
  courtId,
}: {
  count: bigint | null | undefined
  courtId: string
}) {
  const [liveCount, setLiveCount] = useState<number>(
    count == null ? 0 : Number(count)
  )

  useEffect(() => {
    setLiveCount(count == null ? 0 : Number(count))
  }, [count])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/courts/${courtId}/live-count`)
        if (res.ok) {
          const data = await res.json()
          setLiveCount(data.player_live ?? 0)
        }
      } catch {
        // keep previous value on network error
      }
    }, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [courtId])

  return (
    <Card className="w-full bg-primary/10 border-primary">
      <CardContent className="flex items-center justify-center h-32 p-8">
        <div className="text-center">
          <Label className="text-4xl md:text-5xl font-black text-primary drop-shadow-lg">
            {liveCount}
          </Label>
          <p className="text-xl text-muted-foreground mt-2">
            People on court right now
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            From Supabase · updates every {POLL_INTERVAL_MS / 1000}s
          </p>
        </div>
      </CardContent>
    </Card>
  )
}