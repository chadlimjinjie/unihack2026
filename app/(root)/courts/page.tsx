import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"
import CourtCard from "./_components/CourtCard"
import EmbeddedMap from '@/components/embedded-map'

export default async function Page() {

    const courts = await prisma.court.findMany({
        select: { id: true, name: true, location: true, image: true, player_live: true },
    })

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <h1 className="text-title font-bold px-4 lg:px-6">Courts</h1>
            <Tabs defaultValue="list" className="px-4 lg:px-6">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {courts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card/50 px-4 py-12 text-center">
                            <p className="text-muted-foreground font-medium">No courts yet</p>
                            <p className="text-sm text-muted-foreground mt-1">Check back later or explore the map.</p>
                          </div>
                        ) : (
                        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/10 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-md *:data-[slot=card]:border *:data-[slot=card]:border-border lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                            {courts.map(court => <CourtCard key={court.id} id={court.id} image={court.image} name={court.name} location={court.location} playerLive={court.player_live} />)}
                        </div>
                        )}
                    </div>

                </TabsContent>
                <TabsContent value="map">
                    <Card className="border border-border shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Courts map</CardTitle>
                            <CardDescription>
                                View saved courts locations on an interactive map.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="h-[60vh] w-full">
                                <EmbeddedMap />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>




        </div>

    )
}
