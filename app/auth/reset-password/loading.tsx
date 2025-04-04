export default function Loading() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="w-full max-w-md animate-pulse">
        <div className="h-8 w-48 bg-muted rounded mb-4"></div>
        <div className="h-4 w-full bg-muted rounded mb-8"></div>
        <div className="space-y-4">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted rounded"></div>
          <div className="h-4 w-24 bg-muted rounded mt-4"></div>
          <div className="h-10 w-full bg-muted rounded"></div>
          <div className="h-10 w-full bg-muted rounded mt-8"></div>
        </div>
      </div>
    </div>
  )
}
