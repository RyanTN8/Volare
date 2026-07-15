import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upsertPreferences } from '../api/users'
import { User, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Thai', 'American', 'French', 'Mediterranean']
const STYLE_OPTIONS   = ['Adventure', 'Relaxation', 'Cultural', 'Family', 'Romantic', 'Business', 'Budget', 'Luxury']

export default function Profile() {
  const [email,             setEmail]             = useState('')
  const [displayName,       setDisplayName]       = useState('')
  const [selectedCuisines,  setSelectedCuisines]  = useState<string[]>([])
  const [selectedStyles,    setSelectedStyles]    = useState<string[]>([])
  const [budget,            setBudget]            = useState('moderate')
  const [saved,             setSaved]             = useState(false)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => upsertPreferences({
      email,
      displayName,
      preferences: { cuisines: selectedCuisines, travelStyles: selectedStyles, budgetTier: budget },
    }),
    onSuccess: data => {
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['user', data.id] })
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center flex-shrink-0">
          <User className="w-4.5 h-4.5 text-brand-300" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">Travel Profile</h1>
          <p className="text-slate-500 text-sm">Your preferences shape your AI-generated itineraries</p>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); mutation.mutate() }} className="space-y-4">
        <div className="card p-5 space-y-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Display Name</label>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cuisine Preferences</p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => toggle(selectedCuisines, setSelectedCuisines, c)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm border transition-colors font-medium',
                  selectedCuisines.includes(c)
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Travel Style</p>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggle(selectedStyles, setSelectedStyles, s)}
                className={clsx(
                  'px-3 py-1.5 rounded-md text-sm border transition-colors font-medium',
                  selectedStyles.includes(s)
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Budget</p>
          <div className="grid grid-cols-3 gap-2">
            {(['budget', 'moderate', 'luxury'] as const).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={clsx(
                  'py-2.5 rounded-md border text-sm font-medium transition-colors',
                  budget === b
                    ? 'bg-brand-700 text-white border-brand-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {b === 'budget' ? '$ Budget' : b === 'moderate' ? '$$ Moderate' : '$$$ Luxury'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? 'Saving…' : 'Save Preferences'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          )}
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-sm">{(mutation.error as Error).message}</p>
        )}
      </form>
    </div>
  )
}
