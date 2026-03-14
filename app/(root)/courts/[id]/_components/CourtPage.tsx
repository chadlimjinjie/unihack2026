"use client";

import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
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
import { PenLine, Star } from "lucide-react"
import LiveCount from "./LiveCount";
import { MqttProvider } from "@/components/mqtt/MqttProvider";

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
    player_live: bigint | null
}

type ChartEntry = {
    time: string
    people: number
}

type Session = {
    user: {
        id: string
        name: string
        email: string
    }
} | null

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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState(0)
    return (
        <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`w-8 h-8 cursor-pointer transition-colors ${i < (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                        }`}
                    onMouseEnter={() => setHovered(i + 1)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(i + 1)}
                />
            ))}
        </div>
    )
}

function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function CourtPage({
    court,
    chartData,
    session,
    existingReview,
}: {
    court: Court | null
    chartData: ChartEntry[]
    session: Session
    existingReview: { stars: number | null; thoughts: string | null } | null
}) {
    const reviews = court?.review ?? []
    const lastWeekDate = new Date()
    lastWeekDate.setUTCDate(lastWeekDate.getUTCDate() - 7)
    const dayLabel = lastWeekDate.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" })
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.stars ?? 0), 0) / reviews.length
        : 0

    const hasReviewed = !!existingReview

    const [dialogOpen, setDialogOpen] = useState(false)
    const [stars, setStars] = useState(existingReview?.stars ?? 0)
    const [thoughts, setThoughts] = useState(existingReview?.thoughts ?? "")
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmitReview() {
        if (!session || !stars) return
        setSubmitting(true)
        setError("")
        try {
            const res = await fetch(`/api/courts/${court?.id}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stars, thoughts }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? "Something went wrong.")
                return
            }
            setSubmitted(true)
            setTimeout(() => {
                setDialogOpen(false)
                setSubmitted(false)
                setStars(0)
                setThoughts("")
                setError("")
            }, 1500)
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <MqttProvider url="wss://broker.emqx.io/mqtt" options={{ clientId: "court-live-count-client", port: 8084 }}>
            <div className="container mx-auto p-8 max-w-4xl">

                {/* Court Name */}
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                    {court?.name ?? "Court Name"}
                </h1>

                {/* Court Image */}
                <div className="flex justify-center mb-8">
                    <div className="w-full h-64 md:h-120 rounded-2xl overflow-hidden shadow-xl border border-border">
                        <img
                            src={court?.image ?? "https://avatar.vercel.sh/shadcn1"}
                            alt={court?.name ?? "Court"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Location and Live Count */}
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
                    <LiveCount count={court?.player_live} location_id={court?.id.toString() ?? ""} />
                </div>

                {/* Line Chart */}
                <Card className="mb-12">
                    <CardHeader>
                        <CardTitle className="text-2xl">Court Usage Over Time</CardTitle>
                        <CardDescription>
                            {chartData.length > 0
                                ? `Player count throughout last ${dayLabel}`
                                : "No data available for last week's equivalent day"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] p-2">
                        {chartData.length > 0 ? (
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
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                No occupancy data recorded yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reviews */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <CardTitle className="text-2xl">Reviews & Rating</CardTitle>
                            {session ? (
                                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                                    <PenLine className="w-4 h-4" /> {hasReviewed ? "Edit Your Review" : "Write a Review"}
                                </Button>
                            ) : (
                                <Button variant="outline" disabled className="gap-2">
                                    <PenLine className="w-4 h-4" /> Sign in to Review
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {reviews.length > 0 ? (
                            <div className="flex items-center gap-3">
                                <StarDisplay rating={avgRating} />
                                <span className="text-2xl font-bold text-primary">
                                    {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                                </span>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No reviews yet. Be the first!</p>
                        )}

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

                {/* Review Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{hasReviewed ? "Edit Your Review" : `Rate ${court?.name ?? "this court"}`}</DialogTitle>
                            <DialogDescription>
                                {hasReviewed ? "Update your rating or thoughts." : "Share your experience to help other ballers."}
                            </DialogDescription>
                        </DialogHeader>

                        {/* Not logged in */}
                        {!session ? (
                            <div className="py-8 flex flex-col items-center gap-4 text-center">
                                <p className="text-4xl">🔒</p>
                                <p className="font-semibold text-base">Sign in to leave a review</p>
                                <p className="text-sm text-muted-foreground">You need to be logged in to rate this court.</p>
                                <DialogFooter className="w-full">
                                    <Button className="w-full" onClick={() => setDialogOpen(false)}>Close</Button>
                                </DialogFooter>
                            </div>

                        ) : submitted ? (
                            <div className="py-10 flex flex-col items-center gap-3 text-center">
                                <p className="text-4xl">🏀</p>
                                <p className="font-semibold text-base">{hasReviewed ? "Review updated!" : "Review submitted!"}</p>
                                <p className="text-sm text-muted-foreground">Thanks for rating the court.</p>
                            </div>

                        ) : (
                            <>
                                <div className="space-y-5 py-2">
                                    <div className="space-y-2">
                                        <Label>Your rating</Label>
                                        <StarPicker value={stars} onChange={setStars} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="thoughts">Your thoughts <span className="text-muted-foreground">(optional)</span></Label>
                                        <Textarea
                                            id="thoughts"
                                            placeholder="How's the surface? The hoops? The vibe?"
                                            rows={4}
                                            value={thoughts}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setThoughts(e.target.value)}
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-sm text-red-500">{error}</p>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={handleSubmitReview}
                                        disabled={!stars || submitting}
                                    >
                                        {submitting ? "Submitting..." : "Submit Review"}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </MqttProvider>

    )
}



