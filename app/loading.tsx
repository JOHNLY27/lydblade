import { Scissors } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Scissors className="w-12 h-12 text-primary animate-pulse" />
          <div className="absolute inset-0 blur-lg bg-primary/50 animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden relative">
            <div className="h-full bg-primary absolute animate-loading-bar" 
                 style={{ width: '30%' }} />
          </div>
          <p className="text-sm text-slate-500 animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  )
}
