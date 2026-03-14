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
                            {courts.map(court => {
                                return (
                                    <Card key={court.id} className="relative w-full max-w-sm pt-0">
                                        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                                        <img
                                            src={court.image ?? "https://avatar.vercel.sh/shadcn1"}

                                            alt="Court cover"
                                            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
                                        />
                                        <CardHeader>
                                            <CardAction>
                                                <Badge variant="secondary">Featured</Badge>
                                            </CardAction>
                                            <CardTitle>{court.name}</CardTitle>
                                            <CardDescription>
                                                {court.location}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardFooter>
                                            <Button className="w-full" asChild>
                                                <Link href={`/courts/${court.id}`}>
                                                    View Court
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>

                </TabsContent>
                <TabsContent value="map">
                    <Card>
                        <CardHeader>
                            <CardTitle>Map goes here</CardTitle>
                            <CardDescription>
                                Track performance and user engagement metrics. Monitor trends and
                                identify growth opportunities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Page views are up 25% compared to last month.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>




        </div>

    )
}
