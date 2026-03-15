import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Zap, Radio } from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export default async function LandingPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    return (
        <div className="min-h-svh w-full">

            {/* Hero */}
            <div className="landingBackground relative min-h-svh w-full flex items-center justify-center p-6 md:p-10">
                {/* Logo watermark behind text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <img
                        src="/logo-removeBG.png"
                        alt=""
                        className="w-[420px] md:w-[600px] opacity-10 object-contain"
                    />
                </div>

                <div className="relative z-10 w-full max-w-lg space-y-6 text-center">
                    <h1 className="text-5xl font-extrabold md:text-7xl tracking-tight text-black">
                        Welcome to BamBii
                    </h1>
                    <p className="text-lg text-gray-700">
                        Find courts, join sessions, and get playing. Your basketball community starts here.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Button asChild size="lg">
                            <Link href="/courts">Browse Courts</Link>
                        </Button>
                        {!session && (
                            <Button asChild variant="outline" size="lg">
                                <Link href="/signup">Get Started</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* About section */}
            <div className="w-full bg-background border-t px-6 py-20 md:px-10">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Intro */}
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold">What's BamBii?</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                            BamBii is your go-to app for finding pickup basketball games in your area.
                            We use Bluetooth sensors to track how busy each court is in real time —
                            so you always know where the runs are happening before you even lace up.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl border bg-card p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Radio className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">Live Court Activity</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Our Bluetooth sensors scan nearby devices and push player counts to the app every 30 minutes.
                                See exactly how packed a court is before you head out.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">Court Map</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Browse courts on an interactive map with colour-coded activity levels.
                                Tap any court to see details, reviews, and who's playing right now.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">Player Invites</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Need more players? Post an open invite and let other ballers in the area
                                know you're running a game. Fill your squad in minutes.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-card p-6 space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">Always Up to Date</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                The app refreshes every 30–60 seconds so the activity you see is always fresh.
                                No stale data, no wasted trips to an empty court.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center space-y-4">
                        <p className="text-muted-foreground">Ready to find your next game?</p>
                        <Button asChild size="lg">
                            <Link href="/courts">Find a Court</Link>
                        </Button>
                    </div>

                </div>
            </div>

        </div>
    )
}