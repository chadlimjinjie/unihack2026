import { Navbar } from "./nav-bar"

export default function LandingPage() {
    return (
        <div>
            <Navbar />
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold">Welcome to the Landing Page!</h1>
                    <p className="mt-4 text-gray-600">This is where you can introduce your app and its features.</p>
                </div>
            </div>
        </div>

    )
}
