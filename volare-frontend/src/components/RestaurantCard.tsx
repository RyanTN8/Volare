import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Star, DollarSign, MapPin } from 'lucide-react'
import type { Restaurant } from '../types'

interface Props {
  restaurant: Restaurant
}

export default memo(function RestaurantCard({ restaurant: r }: Props) {
  return (
    <Link to={`/restaurants/${r.id}`} className="card hover:shadow-md transition-shadow group block">
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {r.imageUrl ? (
          <img
            src={r.imageUrl}
            alt={r.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">🍽</div>
        )}
        {r.isClosed && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            Closed
          </span>
        )}
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
          {r.name}
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <Star className="w-3.5 h-3.5 fill-current" />
            {r.rating.toFixed(1)}
            <span className="text-slate-400 font-normal">({r.reviewCount.toLocaleString()})</span>
          </span>
          {r.priceRange && (
            <span className="text-slate-500 flex items-center">
              <DollarSign className="w-3 h-3" />
              {r.priceRange}
            </span>
          )}
        </div>
        {r.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {r.categories.slice(0, 3).map(cat => (
              <span key={cat} className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                {cat}
              </span>
            ))}
          </div>
        )}
        {r.location && (
          <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {r.location.city}, {r.location.state}
          </p>
        )}
      </div>
    </Link>
  )
})
