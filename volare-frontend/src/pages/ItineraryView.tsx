import { Link, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { generateItinerary } from '../api/itinerary'
import type { ItineraryPlan, Activity } from '../types'
import { Map, Loader2, UtensilsCrossed, Camera, Zap } from 'lucide-react'
import clsx from 'clsx'

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  RESTAURANT: <UtensilsCrossed className="w-4 h-4" />,
  ATTRACTION: <Camera className="w-4 h-4" />,
  ACTIVITY: <Zap className="w-4 h-4" />,
}

export default function ItineraryView() {
  const [params] = useSearchParams()
  const [plan, setPlan] = useState<ItineraryPlan | null>(null)
  const [activeDay, setActiveDay] = useState(1)

  const mutation = useMutation({
    mutationFn: generateItinerary,
    onSuccess: data => {
      setPlan(data)
      setActiveDay(1)
    },
  })

  const handleGenerate = () => {
    mutation.mutate({
      destination: params.get('destination') ?? '',
      durationDays: parseInt(params.get('durationDays') ?? '2'),
      interests: params.get('interests') ?? 'food, culture, sightseeing',
      budget: params.get('budget') ?? 'moderate',
    })
  }

  const destination = params.get('destination')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!plan && !mutation.isPending && (
        <div className="text-center py-16">
          <Map className="w-16 h-16 text-brand-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {destination ? `Plan your trip to ${destination}` : 'Plan a Trip'}
          </h1>
          <p className="text-slate-500 mb-6">
            Our AI will generate a personalized day-by-day itinerary with restaurants, attractions, and activities.
          </p>
          {destination ? (
            <button onClick={handleGenerate} className="btn-primary text-base px-8 py-3">
              Generate My Itinerary
            </button>
          ) : (
            <p className="text-slate-400 text-sm">Go to Home and use the "Plan a Trip" form to get started.</p>
          )}
        </div>
      )}

      {mutation.isPending && (
        <div className="flex flex-col items-center gap-4 py-24">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
          <p className="text-slate-600 font-medium">Crafting your personalized itinerary…</p>
          <p className="text-slate-400 text-sm">This takes about 10-20 seconds</p>
        </div>
      )}

      {mutation.isError && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{(mutation.error as Error).message}</p>
          <button onClick={handleGenerate} className="btn-secondary">Retry</button>
        </div>
      )}

      {plan && (
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{plan.destination}</h1>
            <p className="text-slate-500 mt-1">
              {plan.durationDays}-day trip · {plan.budgetEstimate}
            </p>
            <Link
              to={`/restaurants?${new URLSearchParams({ location: plan.destination })}`}
              className="btn-secondary inline-flex items-center gap-2 mt-3 text-sm"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Find restaurants in {plan.destination}
            </Link>
            {plan.generalTips.length > 0 && (
              <div className="mt-4 bg-brand-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-brand-700 mb-2">Travel Tips</p>
                <ul className="space-y-1">
                  {plan.generalTips.map((tip, i) => (
                    <li key={i} className="text-sm text-brand-800 flex items-start gap-2">
                      <span className="text-brand-400 mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {plan.days.map(day => (
              <button
                key={day.day}
                onClick={() => setActiveDay(day.day)}
                className={clsx(
                  'flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeDay === day.day
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                Day {day.day}
              </button>
            ))}
          </div>

          {plan.days.filter(d => d.day === activeDay).map(day => (
            <div key={day.day} className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-800">{day.theme}</h2>
              {(['morning', 'afternoon', 'evening'] as const).map(slot => {
                const activities = day[slot]
                if (!activities?.length) return null
                return (
                  <div key={slot}>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 capitalize">
                      {slot}
                    </h3>
                    <div className="space-y-3">
                      {activities.map((act, i) => (
                        <ActivityCard key={i} activity={act} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          <div className="mt-8 text-center">
            <button onClick={handleGenerate} className="btn-secondary text-sm">
              Generate a different plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ActivityCard({ activity: a }: { activity: Activity }) {
  return (
    <div className="card p-4 flex items-start gap-4">
      <div className={clsx(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        a.type === 'RESTAURANT' ? 'bg-fuchsia-100 text-fuchsia-700' :
        a.type === 'ATTRACTION' ? 'bg-brand-100 text-brand-600' :
        'bg-violet-100 text-violet-700'
      )}>
        {ACTIVITY_ICONS[a.type] ?? <Map className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-slate-900">{a.name}</h4>
          {a.priceRange && <span className="text-xs text-slate-400 flex-shrink-0">{a.priceRange}</span>}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">{a.description}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          {a.location && <span>📍 {a.location}</span>}
          {a.estimatedDuration && <span>⏱ {a.estimatedDuration}</span>}
          {a.rating && <span>⭐ {a.rating.toFixed(1)}</span>}
        </div>
      </div>
    </div>
  )
}
