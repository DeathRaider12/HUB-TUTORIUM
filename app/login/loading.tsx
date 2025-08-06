import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-10 w-3/4 mx-auto" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/4 mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-1/3 mx-auto" />
      </div>
    </div>
  )
}
