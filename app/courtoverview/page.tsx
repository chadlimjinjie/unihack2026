"use client";


import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

const chartData = [
  { time: "8AM", people: 1 },
  { time: "10AM", people: 3 },
  { time: "12PM", people: 8 },
  { time: "2PM", people: 12 },
  { time: "4PM", people: 15 },
  { time: "6PM", people: 10 },
  { time: "8PM", people: 5 },
]

const chartConfig: ChartConfig = {
  people: {
    label: "People on Court",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function Page() { return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Court Name */}
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
        Court #1
      </h1>

      {/* Photo Box */}
      <div className="flex justify-center mb-8">
        <Card className="w-[90vw] md:w-[70vw] h-64 md:h-80 flex items-center justify-center border-2 border-dashed border-border bg-muted rounded-2xl shadow-xl">
          <Skeleton className="w-[90%] h-[90%] rounded-xl" />
          <p className="absolute text-muted-foreground text-lg font-medium">Court Photo</p>
        </Card>
      </div>

      {/* Location and People Count */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="text-lg">Court Street, Local Park</Label>
          </CardContent>
        </Card>
        <Card className="w-full bg-primary/10 border-primary">
          <CardContent className="flex items-center justify-center h-32 p-8">
            <div className="text-center">
              <Label className="text-4xl md:text-5xl font-black text-primary drop-shadow-lg">
                12
              </Label>
              <p className="text-xl text-muted-foreground mt-2">People on court right now</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Court Usage Over Time</CardTitle>
          <CardDescription>Time vs number of people (peaks during afternoon)</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] p-2">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="people" 
                  stroke="var(--color-people)" 
                  strokeWidth={3}
                  dot={{ fill: "var(--color-people)", strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Reviews and Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reviews & Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex text-2xl">⭐⭐⭐⭐⭐</div>
            <span className="text-2xl font-bold text-primary">4.8 (127 reviews)</span>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-semibold text-primary">JD</div>
              <div className="flex-1">
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-muted-foreground">Great court, always busy in evenings!</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center font-semibold text-secondary">SJ</div>
              <div className="flex-1">
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Perfect lighting and surface condition.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
