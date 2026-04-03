'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function BarbersList() {
  const [barbers, setBarbers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('barbers')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setBarbers(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="col-span-full flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (barbers.length === 0) {
    return <p className="col-span-full text-center text-slate-500 py-8">No barbers available yet.</p>
  }

  return (
    <div className={`grid gap-6 ${barbers.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : barbers.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'}`}>
      {barbers.map((barber) => (
        <div key={barber.id} className="group text-center">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-slate-800 group-hover:border-primary/40 transition-all">
            <img 
              src={barber.image || '/barbers/default.png'} 
              alt={barber.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="font-bold text-sm">{barber.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{barber.specialty}</p>
        </div>
      ))}
    </div>
  )
}
