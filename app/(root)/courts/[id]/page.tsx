
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
import CourtPage from "./_components/CourtPage"
import { prisma } from "@/lib/prisma"

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

export default async function Page({ params }: { params: { id: string } }) {

    const { id } = await params

    const court = await prisma.court.findUnique({
        where: {
            id: Number(id),
        },
    })

    return <CourtPage court={court} />
}
