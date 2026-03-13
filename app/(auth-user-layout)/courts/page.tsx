import { prisma } from "@/lib/prisma"

export default function Page() {

    prisma.court.findMany().then(courts => {
        console.log(courts)
    }).catch(error => {
        console.error("Error fetching courts:", error)
    })

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold">Courts List</h1>
                <p className="mt-4 text-gray-600">This page will display a list of courts.</p>
            </div>
        </div>
    )
}
