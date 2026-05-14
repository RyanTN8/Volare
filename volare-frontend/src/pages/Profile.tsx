import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upsertPreferences } from '../api/users'
import { User, CheckCircle } from 'lucide-react'

const CUISINE_OPTIONS = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Thai', 'American', 'French', 'Mediterranean']
const STYLE_OPTIONS = ['Adventure', 'Relaxation', 'Cultural', 'Family', 'Romantic', 'Business', 'Budget', 'Luxury']

export default function Profile() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [budget, setBudget] = useState('moderate')
  const [saved, setSaved] = useState(false)
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => upsertPreferences({
      email,
      displayName,
      preferences: {
        cuisines: selectedCuisines,
        travelStyles: selectedStyles,
        budgetTier: budget,
      },
    }),
    onSuccess: data => {
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['user', data.id] })
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) => {
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val])
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
          <User className="w-6 h-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Travel Profile</h1>
          <p className="text-slate-500 text-sm">Your preferences shape your AI-generated itineraries</p>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); mutation.mutate() }} className="space-y-6">
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700">Account</h2>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Email *</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Display Name</label>
            <input className="input" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700">Cuisine Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => toggle(selectedCuisines, setSelectedCuisines, c)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedCuisines.includes(c)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700">Travel Style</h2>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => toggle(selectedStyles, setSelectedStyles, s)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedStyles.includes(s)
                    ? 'bg-accent-500 text-white border-accent-500'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-700">Budget</h2>
          <div className="grid grid-cols-3 gap-3">
            {['budget', 'moderate', 'luxury'].map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setBudget(b)}
                className={`py-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                  budget === b
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {b === 'budget' ? '$ Budget' : b === 'moderate' ? '$$ Moderate' : '$$$ Luxury'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? 'Saving…' : 'Save Preferences'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Saved!
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
