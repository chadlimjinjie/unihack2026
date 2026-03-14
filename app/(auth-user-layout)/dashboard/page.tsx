import { ChartAreaInteractive } from "@/app/(auth-user-layout)/dashboard/_components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/app/(auth-user-layout)/dashboard/_components/section-cards"
import { prisma } from "@/lib/prisma"
import EmbeddedMap from "@/components/embedded-map"
  
import data from "./data.json"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export default async function Page() {

  const courts = await prisma.court.findMany()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <Tabs defaultValue="list" className="px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="analytics">Map</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="px-4 lg:px-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="w-full">
                <div className="h-80 w-full rounded-md overflow-hidden bg-muted">
                  <EmbeddedMap />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
