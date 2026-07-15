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
      className="card group block hover:border-slate-300 hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {r.imageUrl ? (
          <img
            src={r.imageUrl}
            alt={r.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200">
            <Utensils className="w-10 h-10" />
          </div>
        )}
        {r.isClosed && (
          <span className="absolute top-2.5 right-2.5 bg-red-500/90 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
            Closed
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-slate-900 group-hover:text-brand-700 transition-colors truncate leading-snug">
          {r.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold tabular-nums">
            <Star className="w-3.5 h-3.5 fill-current" />
            {r.rating.toFixed(1)}
            <span className="text-slate-400 font-normal text-xs ml-0.5">({r.reviewCount.toLocaleString()})</span>
          </span>
          {r.priceRange && (
            <span className="text-slate-400 text-xs font-semibold tracking-wide">{r.priceRange}</span>
          )}
        </div>
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
