import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Navbar } from "./_components/nav-bar"

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })
    const serverSession = session
        ? { user: { id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image } }
        : null

    return (
        <div>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
            >
                Skip to main content
            </a>
            <Navbar serverSession={serverSession} />
            <main id="main-content" className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    {children}
                </div>
            </main>
        </div>
    )
}
