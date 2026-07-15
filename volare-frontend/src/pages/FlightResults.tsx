import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchFlights } from '../api/flights'
import FlightCard from '../components/FlightCard'
import ErrorMessage from '../components/ErrorMessage'
import { Plane } from 'lucide-react'

export default function FlightResults() {
  const [params]      = useSearchParams()
  const origin        = params.get('origin') ?? ''
  const destination   = params.get('destination') ?? ''
  const departureDate = params.get('departureDate') ?? ''
  const returnDate    = params.get('returnDate') ?? undefined
  const passengers    = parseInt(params.get('passengers') ?? '1')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['flights', origin, destination, departureDate, returnDate, passengers],
    queryFn:  () => searchFlights({ origin, destination, departureDate, returnDate, passengers }),
    enabled:  !!(origin && destination && departureDate),
  })

  if (!origin || !destination || !departureDate) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Plane className="w-10 h-10 text-slate-200" />
        <p className="text-slate-500 text-sm">Enter an origin, destination, and date to search flights.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
          <span className="text-brand-700">{origin.toUpperCase()}</span>
          <span className="text-slate-400 mx-2">→</span>
          <span className="text-brand-700">{destination.toUpperCase()}</span>
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {departureDate}{returnDate ? ` · Return ${returnDate}` : ''} · {passengers} passenger{passengers !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <FlightSkeletonCard key={i} />)}
        </div>
      )}

      {isError && <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <div className="text-center py-16">
          <Plane className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500 text-sm">No flights found for this route. Try different dates.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
            {data.length} flights found
          </p>
          <div className="space-y-3">
            {data.map(f => <FlightCard key={f.id} flight={f} />)}
          </div>
        </>
      )}
    </div>
  )
}

function FlightSkeletonCard() {
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
