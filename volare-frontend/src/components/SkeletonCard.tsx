export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3 animate-pulse">
      <div className="h-40 bg-slate-200 rounded-lg" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="flex gap-2">
        <div className="h-5 bg-slate-200 rounded w-12" />
        <div className="h-5 bg-slate-200 rounded w-16" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonFlightCard() {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="space-y-2 min-w-[56px]">
            <div className="h-6 w-12 bg-slate-100 rounded" />
            <div className="h-3 w-10 bg-slate-100 rounded" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-slate-100 rounded mx-auto" />
            <div className="h-px w-full bg-slate-100" />
            <div className="h-3 w-12 bg-slate-100 rounded mx-auto" />
          </div>
          <div className="space-y-2 min-w-[56px]">
            <div className="h-6 w-12 bg-slate-100 rounded" />
            <div className="h-3 w-10 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="space-y-2 pl-2 border-l border-slate-100">
          <div className="h-7 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-16 bg-slate-100 rounded ml-auto" />
        </div>
      </div>
      <div className="animate-pulse absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full" />
    </div>
  )
}

export function SkeletonFlightList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonFlightCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonDetailPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
      <div className="h-64 bg-slate-200 rounded-xl" />
      <div className="h-8 bg-slate-200 rounded w-1/2" />
      <div className="h-4 bg-slate-200 rounded w-1/4" />
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-2/3" />
    </div>
  )
}
