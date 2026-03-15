# 🏀 BamBii

> Find courts. Join runs. Get playing.

**Live demo:** [unihack2026.vercel.app](https://bambii.midtone.tech/)

BamBii is a basketball community app built for UniHack 2026. We use Bluetooth sensors to track live court activity so you always know where the game is at before you even leave the house.

---

## Features

### 🔴 Live Court Activity
IoT devices are used at the courts to scan nearby phones and wearables to **estimate** how many players are present. The IoT device for a court is trigger at when users click "View Court" on the corresponding court. This number is sent a MQTT broker as a message and the site subcribes to that broker to recieve said message and display it accordingly. 

![Example](/Example.png)

### 📈 Activity Graph
On top of the live count we also have the IoT devices do scan every 30 minutes from 6 am - 11 pm this data is then used to generate our line charts showing the activity level of the court at different times of the day. The line chart will display the data is recorded from the previous week for that specific day. No more showing up to an empty court.
E.g. if its Sunday, the line chart will display data recorded from last Sunday.


### 🗺️ Court Map & Detail Pages
Browse courts on an interactive map with colour-coded activity levels. Click any court to see its photo, location, live player count, hourly usage chart (pulled from last week's same day), and community reviews.

### ⭐ Reviews & Ratings
Signed-in users can rate courts out of 5 stars and leave optional written reviews. One review per user per court, editable at any time.

### 🏃 Open Sessions
Post open game invites at a specific court — set the skill level, how many players you already have, spots needed, and a start/end time. Other users can browse active sessions and join with one tap. Users can only be in one session at a time (overlap enforced server-side).

---

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (99.4%) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Auth | better-auth |
| Charts | Recharts |
| Deployment | Vercel |

---

## Getting started

### Prerequisites
- Node.js 18+
- A Supabase project with a PostgreSQL connection string

### Installation

```bash
git clone https://github.com/chadlimjinjie/unihack2026.git
cd unihack2026
npm install
```

### Environment variables

Create a `.env` file in the root (see `.env` in the repo for reference):

```env
DATABASE_URL=your_supabase_connection_string
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

### Database setup

```bash
npx prisma db push
npx prisma generate
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
app/
├── (root)/                   # Public pages with navbar layout
│   ├── page.tsx              # Landing page
│   ├── courts/               # Court listing + map
│   ├── courts/[id]/          # Court detail, reviews, occupancy chart
│   ├── sessions/             # Open sessions feed
│   └── _components/          # Navbar
│
├── api/
│   ├── auth/                 # better-auth handler
│   ├── courts/[id]/review/   # POST submit/update review
│   └── sessions/             # POST create session
│       └── [id]/
│           ├── join/         # POST join session
│           └── leave/        # POST leave or cancel session
│
├── (auth-user-layout)/       # Protected pages with sidebar layout
│   └── dashboard/
│
components/                   # shadcn/ui components
lib/                          # auth, prisma client, utils
prisma/                       # schema.prisma
generated/prisma/             # Prisma generated client
public/                       # Static assets including court images
```

---

## Database schema

```
court               — name, location, image, live player count
occupancy_log       — hourly player count snapshots per court
review              — star rating + thoughts, unique per user per court
session_invite      — open game invite with skill level, spots, time range
session_participant — join table linking users to sessions
user                — managed by better-auth
session             — auth sessions managed by better-auth
account             — OAuth accounts managed by better-auth
```

---

## How the occupancy chart works

The court detail page shows a line chart of player activity throughout the day. It queries `occupancy_log` for the same weekday from last week (e.g. if today is Monday, it shows last Monday's hourly data) so the pattern reflects realistic usage for that day of the week.

## How session overlap works

When a user tries to join or create a session, the API checks for time overlap against both their hosted and participated sessions using:

```
existing.starts_at < new.ends_at AND existing.ends_at > new.starts_at
```

A user cannot be in two sessions that overlap in time, enforced on both join and create endpoints.

---

## Built at UniHack 2026 🏀
