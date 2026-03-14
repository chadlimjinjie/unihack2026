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
            <Navbar serverSession={serverSession} />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    {children}
                </div>
            </div>
        </div>
    )
}
