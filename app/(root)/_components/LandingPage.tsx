import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="min-h-svh w-full bg-background">
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md space-y-6 text-center">
                    <h1 className="text-3xl font-bold text-foreground md:text-4xl">Welcome to BamBi</h1>
                    <p className="text-muted-foreground">Find courts, join sessions, and get playing. Your basketball community starts here.</p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                        <Button asChild size="lg">
                            <Link href="/courts">Browse Courts</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/signup">Get Started</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
