import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-5">
        <div className="col-span-3">
          <Skeleton className="aspect-video mb-4 rounded-lg" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-5 w-full mb-6" />
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="col-span-2">
          <div className="border rounded-lg p-6">
            <Skeleton className="h-10 w-32 mb-6" />
            <Skeleton className="h-10 w-full mb-6" />
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-5 w-5 shrink-0 mt-0.5 rounded-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

