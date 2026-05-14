import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchFlights } from '../api/flights'
import FlightCard from '../components/FlightCard'
import ErrorMessage from '../components/ErrorMessage'
import { Plane } from 'lucide-react'

export default function FlightResults() {
  const [params] = useSearchParams()
  const origin = params.get('origin') ?? ''
  const destination = params.get('destination') ?? ''
  const departureDate = params.get('departureDate') ?? ''
  const returnDate = params.get('returnDate') ?? undefined
  const passengers = parseInt(params.get('passengers') ?? '1')

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['flights', origin, destination, departureDate, returnDate, passengers],
    queryFn: () => searchFlights({ origin, destination, departureDate, returnDate, passengers }),
    enabled: !!(origin && destination && departureDate),
  })

  if (!origin || !destination || !departureDate) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <Plane className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500">Enter an origin, destination, and date to search flights.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">
        {origin.toUpperCase()} → {destination.toUpperCase()}
      </h1>
      <p className="text-slate-500 mb-6 text-sm">
        {departureDate}{returnDate ? ` · Return ${returnDate}` : ''} · {passengers} passenger{passengers !== 1 ? 's' : ''}
      </p>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse h-28" />
          ))}
        </div>
      )}

      {isError && <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Plane className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          No flights found for this route. Try different dates.
        </div>
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{data.length} flights found</p>
          {data.map(f => (
            <FlightCard key={f.id} flight={f} />
          ))}
        </div>
      )}
    </div>
  )
}
