"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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

type Review = {
    id: bigint
    thoughts: string | null
    stars: number | null
    created_at: Date
    user: {
        name: string
        image: string | null
    } | null
}

type Court = {
    id: bigint
    name: string | null
    location: string | null
    image: string | null
    review: Review[]
}

function StarDisplay({ rating }: { rating: number }) {
    const rounded = Math.round(rating)
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-2xl ${i < rounded ? "text-yellow-400" : "text-muted-foreground/30"}`}>
                    ★
                </span>
            ))}
        </div>
    )
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function CourtPage({ court }: { court: Court | null }) {

    const reviews = court?.review ?? []

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.stars ?? 0), 0) / reviews.length
        : 0

    return (
        <div className="container mx-auto p-8 max-w-4xl">

            {/* Court Name */}
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                {court?.name ?? "Court Name"}
            </h1>

            {/* Court Image */}
            <div className="flex justify-center mb-8">
                <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-xl border border-border">
                    <img
                        src={court?.image ?? "https://avatar.vercel.sh/shadcn1"}
                        alt={court?.name ?? "Court"}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Location and People Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-xl">Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label className="text-lg">
                            {court?.location ?? "Location not set"}
                        </Label>
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

            {/* Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Reviews & Rating</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Average rating */}
                    {reviews.length > 0 ? (
                        <div className="flex items-center gap-3">
                            <StarDisplay rating={avgRating} />
                            <span className="text-2xl font-bold text-primary">
                                {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                            </span>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No reviews yet.</p>
                    )}

                    {/* Individual reviews */}
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={String(review.id)} className="flex gap-3 p-4 bg-muted/50 rounded-xl">
                                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center font-semibold text-primary shrink-0">
                                    {review.user?.name ? getInitials(review.user.name) : "?"}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <p className="font-semibold">{review.user?.name ?? "Anonymous"}</p>
                                        {review.stars != null && <StarDisplay rating={review.stars} />}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {review.thoughts ?? "No comment left."}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}