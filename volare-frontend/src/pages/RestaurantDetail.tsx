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
    queryFn: () => getRestaurantDetail(id!),
    enabled: !!id,
  })

  if (isLoading) return <SkeletonDetailPage />
  if (isError) return <ErrorMessage message={(error as Error).message} />

  if (!r) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/restaurants" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to results
      </Link>

      {r.imageUrl && (
        <img src={r.imageUrl} alt={r.name} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{r.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-current" />
                {r.rating.toFixed(1)}
              </span>
              <span className="text-slate-400">{r.reviewCount.toLocaleString()} reviews</span>
              {r.priceRange && <span className="text-slate-600 font-medium">{r.priceRange}</span>}
              {r.isClosed && <span className="text-red-500 text-xs font-medium">Currently Closed</span>}
            </div>
          </div>
          {r.url && (
            <a href={r.url} target="_blank" rel="noopener noreferrer"
               className="btn-secondary flex items-center gap-1.5 text-sm flex-shrink-0">
              Website <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {r.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {r.categories.map(c => (
              <span key={c} className="bg-brand-50 text-brand-700 text-sm px-3 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}

        {r.tags && r.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {r.tags.map(t => (
              <span key={t} className="bg-accent-400/10 text-accent-600 text-xs px-2.5 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="card p-4 space-y-3">
          {r.location && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span>{r.location.address}, {r.location.city}, {r.location.state}</span>
            </div>
          )}
          {r.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <a href={`tel:${r.phone}`} className="hover:text-brand-600">{r.phone}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
