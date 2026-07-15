import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Utensils } from 'lucide-react'
import type { Restaurant } from '../types'

interface Props {
  restaurant: Restaurant
}

export default memo(function RestaurantCard({ restaurant: r }: Props) {
  return (
    <Link
      to={`/restaurants/${r.id}`}
      className="card group block p-4 space-y-2 hover:border-slate-300 hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
          <Utensils className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-slate-900 group-hover:text-brand-700 transition-colors truncate leading-snug">
              {r.name}
            </h3>
            {r.isClosed && (
              <span className="flex-shrink-0 bg-red-50 text-red-600 text-[11px] px-2 py-0.5 rounded-md font-semibold">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 pl-12">
        {(r.rating > 0 || r.priceRange) && (
          <div className="flex items-center gap-3">
            {r.rating > 0 && (
              <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-current" />
                {r.rating.toFixed(1)}
                {r.reviewCount > 0 && (
                  <span className="text-slate-400 font-normal text-xs ml-0.5">({r.reviewCount.toLocaleString()})</span>
                )}
              </span>
            )}
            {r.priceRange && (
              <span className="text-slate-400 text-xs font-semibold tracking-wide">{r.priceRange}</span>
            )}
          </div>
        )}
        {r.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {r.categories.slice(0, 3).map(cat => (
              <span key={cat} className="tag">{cat}</span>
            ))}
          </div>
        )}
        {r.location && (
          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate pt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {r.location.city}, {r.location.state}
          </p>
        )}
      </div>
    </Link>
  )
})
