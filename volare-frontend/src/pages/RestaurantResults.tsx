import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { searchRestaurants } from '../api/restaurants'
import RestaurantCard from '../components/RestaurantCard'
import { SkeletonList } from '../components/SkeletonCard'
import ErrorMessage from '../components/ErrorMessage'
import { UtensilsCrossed } from 'lucide-react'

const PRICE_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: '$' },
  { value: '2', label: '$$' },
  { value: '3', label: '$$$' },
  { value: '4', label: '$$$$' },
]

export default function RestaurantResults() {
  const [params] = useSearchParams()
  const location = params.get('location') ?? ''
  const term = params.get('term') ?? undefined
  const [priceTier, setPriceTier] = useState(params.get('priceTier') ?? '')
  const [radius, setRadius] = useState(parseInt(params.get('radius') ?? '5000'))
  const [debouncedRadius, setDebouncedRadius] = useState(radius)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRadius(radius), 400)
    return () => clearTimeout(timer)
  }, [radius])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['restaurants', location, term, priceTier, debouncedRadius],
    queryFn: () => searchRestaurants({ location, term, priceTier: priceTier || undefined, radius: debouncedRadius }),
    enabled: !!location,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  if (!location) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <UtensilsCrossed className="w-12 h-12 text-slate-300" />
        <p className="text-slate-500">Enter a location to find restaurants.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">
        {term ? `${term} in ` : 'Restaurants in '}{location}
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 mt-4 items-center">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Price</label>
          <div className="flex gap-1">
            {PRICE_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setPriceTier(o.value)}
                className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                  priceTier === o.value
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Radius</label>
          <select
            className="input w-36 text-sm"
            value={radius}
            onChange={e => setRadius(parseInt(e.target.value))}
          >
            <option value="1000">1 km</option>
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
            <option value="25000">25 km</option>
          </select>
        </div>
      </div>

      {isLoading && <SkeletonList count={6} />}
      {isError && <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-slate-200" />
          No restaurants found. Try widening your search.
        </div>
      )}

      {data && data.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">{data.length} results</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </>
      )}
    </div>
  )
}
