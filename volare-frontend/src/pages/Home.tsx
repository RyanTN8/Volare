import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, MapPin, Plane, Sparkles, UtensilsCrossed } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-[720px] flex items-end px-5 sm:px-8 pb-8 sm:pb-12">
        <div className="absolute inset-0 bg-[url('/coastal-journey-hero.png')] bg-cover bg-[center]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#132720]/90 via-[#132720]/25 to-[#132720]/35" />
        <div className="relative max-w-7xl w-full mx-auto">
          <div className="max-w-3xl mb-8 sm:mb-10">
            <h1 className="font-display font-extrabold text-[#fffaf0] leading-[.91] tracking-[-0.075em] uppercase"
                style={{ fontSize: 'clamp(3.35rem, 9vw, 7.4rem)' }}>
              Go where<br />the map ends.
            </h1>
            <p className="text-stone-100 text-base sm:text-lg leading-relaxed max-w-lg mt-6">
              The road is yours. Let AI plan the route, uncover the hidden gems, and shape every stop worth making.
            </p>
          </div>
          <div className="rounded-2xl bg-[#fffdf8] shadow-[0_24px_60px_rgba(5,24,18,.35)] p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 px-3 pt-2 pb-3 sm:px-4">
              <div className="flex items-center gap-3 text-[#173c35]">
                <div className="w-9 h-9 rounded-full bg-[#e7efe4] flex items-center justify-center"><Sparkles className="w-4 h-4" /></div>
                <div><p className="text-sm font-bold">Build your escape</p><p className="text-xs text-stone-500">Tell us where you’re headed. We’ll help with the rest.</p></div>
              </div>
              <span className="hidden lg:block ml-auto text-xs uppercase tracking-[.16em] font-semibold text-stone-400">Volare trip planner</span>
            </div>
            <ItinerarySearchForm onSearch={p => navigate(`/itinerary?${p}`)} />
          </div>
        </div>
      </section>

      <section className="bg-[#f6f1e8] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div><p className="text-[#c95d35] text-xs font-bold uppercase tracking-[.2em] mb-3">For the way you travel</p><h2 className="font-display font-extrabold text-[#173c35] text-3xl sm:text-4xl tracking-[-.05em]">More out there.<br />Less to figure out.</h2></div>
            <p className="max-w-sm text-stone-600 leading-relaxed">A good flight, a great meal, and a plan that still leaves room to wander.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <Plane className="w-4 h-4" />,
              title: 'Real-time flights',
              desc:  'Search live flight options through Duffel, with availability direct from the airlines.',
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
            <div key={f.title} className="bg-[#fffdf8] border border-stone-200 rounded-xl p-6">
              <div className="w-10 h-10 rounded-full bg-[#e7efe4] flex items-center justify-center text-[#173c35] mb-7">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-[#173c35] mb-2 text-lg">{f.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        </div>
      </section>
    </div>
  )
}

function usePersistentState<T>(key: string, initial: T, hydrate?: (stored: T) => T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      const parsed = stored ? (JSON.parse(stored) as T) : null
      return parsed ? (hydrate ? hydrate(parsed) : parsed) : initial
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
  const EMPTY = { destination: '', durationDays: '', interests: '', budget: '' }
  const [form, setForm, clearForm] = usePersistentState(
    'volare:itinerarySearch',
    EMPTY,
    // Budget is intentionally a fresh choice each time the landing page loads.
    saved => ({ ...saved, budget: '' })
  )
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.25fr_.6fr_1.5fr_.8fr_auto] gap-2">
        <label className="relative"><MapPin className="absolute left-3 top-3.5 w-4 h-4 text-[#c95d35]" /><input className="input pl-9 h-full" placeholder="Where do you want to go?" value={form.destination} onChange={update('destination')} required /></label>
        <input className="input" type="number" min={1} max={30} placeholder="How many days?" value={form.durationDays} onChange={update('durationDays')} required />
        <input className="input" placeholder="What are you into?" value={form.interests} onChange={update('interests')} required />
        <select
          className={`input ${form.budget ? 'text-slate-900' : 'text-stone-400'}`}
          value={form.budget}
          onChange={update('budget')}
          required
        >
          <option value="" disabled>Select budget</option>
          <option value="budget">Budget</option>
          <option value="moderate">Moderate</option>
          <option value="luxury">Luxury</option>
        </select>
        <button type="submit" className="bg-[#c95d35] hover:bg-[#ae4b29] text-white min-h-[42px] px-5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
          Create trip <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}
