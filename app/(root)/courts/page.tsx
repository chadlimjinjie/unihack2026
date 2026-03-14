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

    const courts = await prisma.court.findMany()

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <Tabs defaultValue="list" className="px-4 lg:px-6">
                <TabsList>
                    <TabsTrigger value="list">List</TabsTrigger>
                    <TabsTrigger value="map">Map</TabsTrigger>
                </TabsList>
                <TabsContent value="list">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
                            {courts.map(court => <CourtCard key={court.id} id={court.id} image={court.image} name={court.name} location={court.location} />)}
                        </div>
                    </div>

                </TabsContent>
                <TabsContent value="map">
                    <Card>
                        <CardHeader>
                            <CardTitle>Courts map</CardTitle>
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
