import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { searchRestaurants } from '../api/restaurants'
import RestaurantCard from '../components/RestaurantCard'
import { SkeletonList } from '../components/SkeletonCard'
import ErrorMessage from '../components/ErrorMessage'
import { UtensilsCrossed } from 'lucide-react'
import clsx from 'clsx'

const PRICE_OPTIONS = [
  { value: '',  label: 'Any'  },
  { value: '1', label: '$'    },
  { value: '2', label: '$$'   },
  { value: '3', label: '$$$'  },
  { value: '4', label: '$$$$' },
]

export default function RestaurantResults() {
  const [params] = useSearchParams()
  const location = params.get('location') ?? ''
  const term     = params.get('term') ?? undefined

  const [priceTier, setPriceTier]             = useState(params.get('priceTier') ?? '')
  const [radius, setRadius]                   = useState(parseInt(params.get('radius') ?? '5000'))
  const [debouncedRadius, setDebouncedRadius] = useState(radius)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedRadius(radius), 400)
    return () => clearTimeout(t)
  }, [radius])

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['restaurants', location, term, priceTier, debouncedRadius],
    queryFn:  () => searchRestaurants({ location, term, priceTier: priceTier || undefined, radius: debouncedRadius }),
    enabled:  !!location,
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  })

  if (!location) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <UtensilsCrossed className="w-10 h-10 text-slate-200" />
        <p className="text-slate-500 text-sm">Enter a location to find restaurants.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
          {term ? `${term} in ` : 'Restaurants in '}
          <span className="text-brand-700">{location}</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Price</p>
          <div className="flex gap-1.5">
            {PRICE_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setPriceTier(o.value)}
                className={clsx(
                  'px-3 py-1.5 text-sm rounded-md border transition-colors font-medium',
                  priceTier === o.value
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Radius</p>
          <select className="input w-36 text-sm" value={radius} onChange={e => setRadius(parseInt(e.target.value))}>
            <option value="1000">1 km</option>
            <option value="5000">5 km</option>
            <option value="10000">10 km</option>
            <option value="25000">25 km</option>
          </select>
        </div>
      </div>

      {isLoading && <SkeletonList count={6} />}
      {isError   && <ErrorMessage message={(error as Error).message} onRetry={() => refetch()} />}

      {data && data.length === 0 && (
        <div className="text-center py-20">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-slate-200" />
          <p className="text-slate-500 text-sm">No restaurants found. Try widening your search.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-5">
            {data.length} results
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        </>
      )}
    </div>
  )
}
