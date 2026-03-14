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
import { MapPin, Clock, Users, Plus, LogIn, Crown } from "lucide-react"
import { useRouter } from "next/navigation"

type Court = {
    id: number
    name: string | null
    location: string | null
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
    const [submitting, setSubmitting] = useState(false)
    const [joining, setJoining] = useState<number | null>(null)
    const [error, setError] = useState("")

    // Create session form state
    const [courtId, setCourtId] = useState("")
    const [title, setTitle] = useState("")
    const [skillLevel, setSkillLevel] = useState("Any")
    const [playersHave, setPlayersHave] = useState("1")
    const [spotsTotal, setSpotsTotal] = useState("10")
    const [startsAt, setStartsAt] = useState("")
    const [endsAt, setEndsAt] = useState("")

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
        setStartsAt(""); setEndsAt(""); setError("")
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
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Start a Session</DialogTitle>
                        <DialogDescription>Set up your game and invite others to join.</DialogDescription>
                    </DialogHeader>

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

                        {/* Court */}
                        <div className="space-y-1.5">
                            <Label>Court <span className="text-red-500">*</span></Label>
                            <Select value={courtId} onValueChange={setCourtId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a court" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courts.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name} {c.location ? `· ${c.location}` : ""}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <div className="space-y-1.5">
                                <Label htmlFor="starts-at">Starts at <span className="text-red-500">*</span></Label>
                                <Input
                                    id="starts-at"
                                    type="datetime-local"
                                    value={startsAt}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartsAt(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="ends-at">Ends at <span className="text-red-500">*</span></Label>
                                <Input
                                    id="ends-at"
                                    type="datetime-local"
                                    value={endsAt}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndsAt(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => { setCreateOpen(false); resetForm() }}>Cancel</Button>
                        <Button onClick={handleCreateSession} disabled={submitting}>
                            {submitting ? "Creating..." : "Create Session"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}