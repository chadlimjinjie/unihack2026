
export default async function Page({ params }: { params: { id: string } }) {

    const { id } = await params

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <h1 className="text-2xl font-bold">Court Details</h1>
                <p className="mt-4 text-gray-600">This page will display details for court with ID: {id}</p>
            </div>
        </div>
    )
}
