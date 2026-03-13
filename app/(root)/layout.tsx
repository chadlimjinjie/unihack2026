import { Navbar } from "./_components/nav-bar"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <Navbar />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    {children}
                </div>
            </div>
        </div>
    )
}
