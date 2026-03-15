import { Skeleton } from "@/components/ui/skeleton"

export default function SessionsLoading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-48 w-full max-w-2xl" />
      <Skeleton className="h-48 w-full max-w-2xl" />
    </div>
  )
}
