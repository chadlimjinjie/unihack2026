import { Skeleton } from "@/components/ui/skeleton"

export default function CourtsLoading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
