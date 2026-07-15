import { AlertCircle } from 'lucide-react'

interface Props {
  message: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertCircle className="w-10 h-10 text-slate-300" />
      <p className="text-slate-600 text-sm max-w-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1 text-sm">Try again</button>
      )}
    </div>
  )
}
