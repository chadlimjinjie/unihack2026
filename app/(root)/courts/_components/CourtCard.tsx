import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveOccupancyIndicator } from "@/components/LiveOccupancyIndicator";
import Link from "next/link";

export default function CourtCard({
    id,
    image,
    name,
    location,
    playerLive,
}: {
    id: bigint
    image: string | null
    name: string | null
    location: string | null
    playerLive?: bigint | number | null
}) {
    return (
        <Card className="relative w-full max-w-sm pt-0 border border-border shadow-md transition-shadow duration-200 hover:shadow-lg">
            {image ? (
              <img
                src={image}
                alt="Court cover"
                className="relative z-20 aspect-video w-full object-cover rounded-t-lg"
              />
            ) : (
              <div
                className="relative z-20 aspect-video w-full rounded-t-lg bg-primary/10 flex items-center justify-center text-primary/40"
                aria-hidden
              >
                <span className="text-4xl">🏀</span>
              </div>
            )}
            <CardHeader>
                <CardAction className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Featured</Badge>
                    <LiveOccupancyIndicator count={playerLive} showLabel size="sm" />
                </CardAction>
                <CardTitle>{name}</CardTitle>
                <CardDescription>
                    {location}
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link href={`/courts/${id}`}>
                        View Court
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
