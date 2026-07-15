import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plane, UtensilsCrossed, Sparkles } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero ― deep teal ground, white type, search card floats below */}
      <div className="bg-brand-900 px-6 pt-20 pb-0">
        <div className="max-w-3xl mx-auto">
          <div className="text-center pb-12">
            <p className="text-brand-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              AI-powered travel planning
            </p>
            <h1 className="font-display font-bold text-white leading-[1.05] tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 3.75rem)' }}>
              Plan your perfect trip.<br />AI handles the details.
            </h1>
            <p className="text-brand-300 text-lg leading-relaxed max-w-xl mx-auto">
              Personalized day-by-day itineraries, real-time flights, and the best local restaurants — all in one place.
            </p>
          </div>

          {/* Search card — sits at the bottom of the hero, bridging into the content */}
          <div className="bg-white rounded-t-2xl shadow-2xl shadow-brand-950/40 overflow-hidden">
            <div className="flex items-center gap-2 px-6 pt-5 text-brand-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">AI Trip Planner</span>
            </div>
            <div className="p-6">
              <ItinerarySearchForm onSearch={p => navigate(`/itinerary?${p}`)} />
            </div>
          </div>
        </div>
      </div>

      {/* Features ― white section, visual pause between dark hero and stone body */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: <Plane className="w-4 h-4" />,
              title: 'Real-time flights',
              desc:  'Search hundreds of airlines instantly. Live availability, no cached results.',
            },
            {
              icon: <UtensilsCrossed className="w-4 h-4" />,
              title: 'Local restaurants',
              desc:  'Discover where to eat powered by Foursquare, enriched with AI-generated tags.',
            },
            {
              icon: <Sparkles className="w-4 h-4" />,
              title: 'AI itineraries',
              desc:  'A full day-by-day trip plan in seconds, built around your interests and budget.',
            },
          ].map(f => (
            <div key={f.title} className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-brand-900 flex items-center justify-center text-brand-300 flex-shrink-0 mt-0.5">
                {f.icon}
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)) }
    catch { /* ignore quota / private-mode errors */ }
  }, [key, state])

  // Clears state and localStorage synchronously — needed because navigating
  // away in the same handler can unmount this component before the effect
  // above ever fires, leaving the old value persisted.
  const clear = () => {
    setState(initial)
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  }

  return [state, setState, clear] as const
}

function ItinerarySearchForm({ onSearch }: { onSearch: (params: string) => void }) {
  const EMPTY = { destination: '', durationDays: '', interests: '', budget: 'moderate' }
  const [form, setForm, clearForm] = usePersistentState('volare:itinerarySearch', EMPTY)
  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams(Object.fromEntries(Object.entries(form).filter(([, v]) => v)))
    onSearch(p.toString())
    clearForm()
  }

  return (
    <form onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <input className="input" placeholder="Destination (e.g. Tokyo)" value={form.destination} onChange={update('destination')} required />
        <input className="input" type="number" min={1} max={30} placeholder="Days (e.g. 3)" value={form.durationDays} onChange={update('durationDays')} required />
        <input className="input col-span-2" placeholder="Interests (e.g. food, history, hiking)" value={form.interests} onChange={update('interests')} required />
        <select className="input col-span-2" value={form.budget} onChange={update('budget')}>
          <option value="budget">Budget</option>
          <option value="moderate">Moderate</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
      <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" /> Generate Itinerary
      </button>
    </form>
  )
}
