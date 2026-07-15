import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRestaurantDetail } from '../api/restaurants'
import { SkeletonDetailPage } from '../components/SkeletonCard'
import ErrorMessage from '../components/ErrorMessage'
import { Star, MapPin, Phone, ExternalLink, ArrowLeft } from 'lucide-react'

export default function RestaurantDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: r, isLoading, isError, error } = useQuery({
    queryKey: ['restaurant', id],
    queryFn:  () => getRestaurantDetail(id!),
    enabled:  !!id,
  })

  if (isLoading) return <SkeletonDetailPage />
  if (isError)   return <ErrorMessage message={(error as Error).message} />
  if (!r)        return null

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link
        to="/restaurants"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to results
      </Link>

      {r.imageUrl && (
        <img
          src={r.imageUrl}
          alt={r.name}
          className="w-full h-72 object-cover rounded-xl mb-6"
        />
      )}

      <div className="space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-tight">
              {r.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-amber-500 font-semibold text-sm tabular-nums">
                <Star className="w-4 h-4 fill-current" />
                {r.rating.toFixed(1)}
              </span>
              <span className="text-slate-400 text-sm">{r.reviewCount.toLocaleString()} reviews</span>
              {r.priceRange && (
                <span className="text-slate-500 text-sm font-semibold">{r.priceRange}</span>
              )}
              {r.isClosed && (
                <span className="text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded-md">
                  Closed
                </span>
              )}
            </div>
          </div>
          {r.url && (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-1.5 text-sm flex-shrink-0"
            >
              Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Tags */}
        {(r.categories.length > 0 || (r.tags && r.tags.length > 0)) && (
          <div className="flex flex-wrap gap-1.5">
            {r.categories.map(c => <span key={c} className="tag">{c}</span>)}
            {r.tags?.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}

        {/* Info card */}
        <div className="card p-5 space-y-3.5">
          {r.location && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span className="text-slate-700">
                {r.location.address}, {r.location.city}, {r.location.state}
              </span>
            </div>
          )}
          {r.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a href={`tel:${r.phone}`} className="text-slate-700 hover:text-brand-700 transition-colors">
                {r.phone}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
