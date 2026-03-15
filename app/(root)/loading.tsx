import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full max-w-2xl" />
      <Skeleton className="h-32 w-full max-w-2xl" />
    </div>
  )
}
