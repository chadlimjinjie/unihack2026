"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, Clock, Users, Plus, LogIn, Crown, CalendarIcon, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

type Court = {
    id: number
    name: string | null
    location: string | null
    image: string | null
}

type Participant = {
    id: number
    user: { id: string; name: string }
}

type SessionInvite = {
    id: number
    title: string | null
    skill_level: string
    players_have: number
    spots_total: number
    spots_filled: number | null
    starts_at: string
    ends_at: string
    status: string | null
    court: Court
    user: { id: string; name: string }
    session_participant: Participant[]
}

type CurrentSession = {
    user: { id: string; name: string; email: string }
} | null

const SKILL_LEVELS = ["Any", "Beginner", "Intermediate", "Advanced"]

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-AU", {
        hour: "numeric", minute: "2-digit", hour12: true,
    })
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-AU", {
        weekday: "short", day: "numeric", month: "short",
    })
}

function SpotsBar({ filled, total }: { filled: number; total: number }) {
    const pct = Math.min((filled / total) * 100, 100)
    const color = pct >= 100 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500"
    return (
        <div className="w-full bg-muted rounded-full h-1.5">
            <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
    )
}

export default function SessionsClient({
    sessions,
    courts,
    currentSession,
    userActiveSessionId,
}: {
    sessions: SessionInvite[]
    courts: Court[]
    currentSession: CurrentSession
    userActiveSessionId: number | null
}) {
    const router = useRouter()
    const [createOpen, setCreateOpen] = useState(false)
    const [step, setStep] = useState<"details" | "court">("details")
    const [submitting, setSubmitting] = useState(false)
    const [joining, setJoining] = useState<number | null>(null)
    const [error, setError] = useState("")

    // Create session form state
    const [courtId, setCourtId] = useState("")
    const [title, setTitle] = useState("")
    const [skillLevel, setSkillLevel] = useState("Any")
    const [playersHave, setPlayersHave] = useState("1")
    const [spotsTotal, setSpotsTotal] = useState("10")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [startHour, setStartHour] = useState("18")
    const [startMin, setStartMin] = useState("00")
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [endHour, setEndHour] = useState("20")
    const [endMin, setEndMin] = useState("00")
    const [startCalOpen, setStartCalOpen] = useState(false)
    const [endCalOpen, setEndCalOpen] = useState(false)

    function buildDateTime(date: Date | undefined, hour: string, min: string): string {
        if (!date) return ""
        const d = new Date(date)
        d.setHours(Number(hour), Number(min), 0, 0)
        return d.toISOString()
    }

    const startsAt = buildDateTime(startDate, startHour, startMin)
    const endsAt = buildDateTime(endDate, endHour, endMin)

    async function handleCreateSession() {
        if (!courtId || !startsAt || !endsAt) {
            setError("Please fill in all required fields.")
            return
        }
        if (new Date(endsAt) <= new Date(startsAt)) {
            setError("End time must be after start time.")
            return
        }
        setSubmitting(true)
        setError("")
        try {
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courtId: Number(courtId),
                    title: title || null,
                    skillLevel,
                    playersHave: Number(playersHave),
                    spotsTotal: Number(spotsTotal),
                    startsAt,
                    endsAt,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? "Failed to create session.")
                return
            }
            setCreateOpen(false)
            resetForm()
            router.refresh()
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleJoinSession(sessionId: number) {
        setJoining(sessionId)
        try {
            const res = await fetch(`/api/sessions/${sessionId}/join`, {
                method: "POST",
            })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error ?? "Failed to join session.")
                return
            }
            router.refresh()
        } finally {
            setJoining(null)
        }
    }

    async function handleLeaveSession(sessionId: number) {
        try {
            const res = await fetch(`/api/sessions/${sessionId}/leave`, {
                method: "POST",
            })
            if (!res.ok) {
                const data = await res.json()
                alert(data.error ?? "Failed to leave session.")
                return
            }
            router.refresh()
        } catch {
            alert("Network error.")
        }
    }

    function resetForm() {
        setCourtId(""); setTitle(""); setSkillLevel("Any")
        setPlayersHave("1"); setSpotsTotal("10")
        setStartDate(undefined); setStartHour("18"); setStartMin("00")
        setEndDate(undefined); setEndHour("20"); setEndMin("00")
        setError(""); setStep("details")
    }

    const isInSession = (s: SessionInvite) =>
        s.user.id === currentSession?.user.id ||
        s.session_participant.some((p) => p.user.id === currentSession?.user.id)

    const spotsLeft = (s: SessionInvite) => s.spots_total - (s.spots_filled ?? 0)

    return (
        <div className="container mx-auto p-6 max-w-5xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Open Sessions</h1>
                    <p className="text-muted-foreground mt-1">Find a game or start your own</p>
                </div>
                {currentSession ? (
                    <Button
                        onClick={() => setCreateOpen(true)}
                        disabled={!!userActiveSessionId}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {userActiveSessionId ? "Already in a Session" : "Start a Session"}
                    </Button>
                ) : (
                    <Button variant="outline" disabled className="gap-2">
                        <Plus className="w-4 h-4" /> Sign in to Start
                    </Button>
                )}
            </div>

            {/* Sessions list */}
            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                    <p className="text-5xl">🏀</p>
                    <p className="text-xl font-semibold">No active sessions</p>
                    <p className="text-muted-foreground">Be the first to start a game!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((s) => {
                        const userInThis = isInSession(s)
                        const isHost = s.user.id === currentSession?.user.id
                        const full = s.status === "full" || spotsLeft(s) <= 0

                        return (
                            <Card key={s.id} className={`border ${userInThis ? "border-primary/50 bg-primary/5" : "border-border"}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-lg leading-snug">
                                                {s.title || `${s.user.name}'s Run`}
                                            </CardTitle>
                                            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{s.court.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <Badge variant={full ? "destructive" : "secondary"}>
                                                {full ? "Full" : `${spotsLeft(s)} spot${spotsLeft(s) !== 1 ? "s" : ""} left`}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">{s.skill_level}</Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Time */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        <span>{formatDate(s.starts_at)} · {formatTime(s.starts_at)} – {formatTime(s.ends_at)}</span>
                                    </div>

                                    {/* Players */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <Users className="w-3.5 h-3.5" />
                                                Players
                                            </span>
                                            <span className="font-medium">
                                                {s.players_have + (s.spots_filled ?? 0)} / {s.players_have + s.spots_total}
                                            </span>
                                        </div>
                                        <SpotsBar filled={s.players_have + (s.spots_filled ?? 0)} total={s.players_have + s.spots_total} />
                                    </div>

                                    {/* Host */}
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Crown className="w-3 h-3 text-amber-500" />
                                        Hosted by {isHost ? "you" : s.user.name}
                                    </div>

                                    {/* Action button */}
                                    {currentSession && (
                                        <div className="pt-1">
                                            {isHost ? (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleLeaveSession(s.id)}
                                                >
                                                    Cancel Session
                                                </Button>
                                            ) : userInThis ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleLeaveSession(s.id)}
                                                >
                                                    Leave Session
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="w-full gap-2"
                                                    disabled={full || !!userActiveSessionId || joining === s.id}
                                                    onClick={() => handleJoinSession(s.id)}
                                                >
                                                    <LogIn className="w-3.5 h-3.5" />
                                                    {joining === s.id ? "Joining..." : full ? "Full" : "Join Session"}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Create Session Dialog */}
            <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetForm() }}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {step === "details" ? "Start a Session" : "Pick a Court"}
                        </DialogTitle>
                        <DialogDescription>
                            {step === "details"
                                ? "Set up your game details, then choose a court."
                                : "Select the court where your session will take place."}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Step 1 — Details */}
                    {step === "details" && (
                        <div className="space-y-4 py-2">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <Label htmlFor="session-title">Title <span className="text-muted-foreground">(optional)</span></Label>
                                <Input
                                    id="session-title"
                                    placeholder="e.g. Friday evening 5v5"
                                    value={title}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Skill level */}
                            <div className="space-y-1.5">
                                <Label>Skill Level</Label>
                                <Select value={skillLevel} onValueChange={setSkillLevel}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SKILL_LEVELS.map((l) => (
                                            <SelectItem key={l} value={l}>{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Players row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="players-have">Players you have</Label>
                                    <Input
                                        id="players-have"
                                        type="number" min="1" max="20"
                                        value={playersHave}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayersHave(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="spots-total">Spots to fill</Label>
                                    <Input
                                        id="spots-total"
                                        type="number" min="1" max="20"
                                        value={spotsTotal}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSpotsTotal(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Time row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Start */}
                                <div className="space-y-1.5">
                                    <Label>Starts at <span className="text-red-500">*</span></Label>
                                    <Popover open={startCalOpen} onOpenChange={setStartCalOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {startDate ? format(startDate, "EEE d MMM") : "Pick a date"}
                                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={(d) => { setStartDate(d); setStartCalOpen(false) }}
                                                disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        className="mt-1"
                                        value={`${startHour}:${startMin}`}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const [h, m] = e.target.value.split(":")
                                            setStartHour(h); setStartMin(m)
                                        }}
                                    />
                                </div>
                                {/* End */}
                                <div className="space-y-1.5">
                                    <Label>Ends at <span className="text-red-500">*</span></Label>
                                    <Popover open={endCalOpen} onOpenChange={setEndCalOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between font-normal">
                                                {endDate ? format(endDate, "EEE d MMM") : "Pick a date"}
                                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={(d) => { setEndDate(d); setEndCalOpen(false) }}
                                                disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        type="time"
                                        className="mt-1"
                                        value={`${endHour}:${endMin}`}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const [h, m] = e.target.value.split(":")
                                            setEndHour(h); setEndMin(m)
                                        }}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-500">{error}</p>}

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => { setCreateOpen(false); resetForm() }}>Cancel</Button>
                                <Button
                                    onClick={() => {
                                        if (!startsAt || !endsAt) { setError("Please fill in start and end times."); return }
                                        if (new Date(endsAt) <= new Date(startsAt)) { setError("End time must be after start time."); return }
                                        setError("")
                                        setStep("court")
                                    }}
                                >
                                    Next: Pick a Court
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {/* Step 2 — Court picker */}
                    {step === "court" && (
                        <div className="py-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[520px] overflow-y-auto pr-1">
                                {courts.map((c) => (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => setCourtId(String(c.id))}
                                        className={`text-left rounded-xl border p-0 transition-all hover:border-primary hover:shadow-md focus:outline-none overflow-hidden ${
                                            courtId === String(c.id)
                                                ? "border-primary ring-2 ring-primary shadow-md"
                                                : "border-border"
                                        }`}
                                    >
                                        <div className="w-full h-44 overflow-hidden bg-muted">
                                            <img
                                                src={c.image ?? "https://avatar.vercel.sh/shadcn1"}
                                                alt={c.name ?? "Court"}
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="font-semibold text-base leading-tight">{c.name ?? "Unnamed Court"}</p>
                                            {c.location && (
                                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0" />{c.location}
                                                </p>
                                            )}
                                            {courtId === String(c.id) && (
                                                <p className="text-xs text-primary font-semibold mt-2">✓ Selected</p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

                            <DialogFooter className="mt-4">
                                <Button variant="ghost" onClick={() => setStep("details")}>Back</Button>
                                <Button
                                    onClick={handleCreateSession}
                                    disabled={!courtId || submitting}
                                >
                                    {submitting ? "Creating..." : "Create Session"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}