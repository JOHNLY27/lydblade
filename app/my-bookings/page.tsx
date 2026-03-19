'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, type UserWithRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ChevronRight,
  Scissors,
  Phone,
  StickyNote,
  CalendarPlus,
  RefreshCw
} from 'lucide-react'

const barbersList = [
  { id: 'miguel', name: 'Miguel Santos', image: '/barbers/miguel.png' },
  { id: 'james', name: 'James Cruz', image: '/barbers/james.png' },
  { id: 'carlo', name: 'Carlo Reyes', image: '/barbers/carlo.png' },
  { id: 'marco', name: 'Marco Dela Cruz', image: '/barbers/marco.png' },
  { id: 'rafael', name: 'Rafael Garcia', image: '/barbers/rafael.png' },
]

const getBarberById = (id: string) => barbersList.find(b => b.id === id)

type Booking = {
  id: string
  customer_name: string
  customer_phone: string
  service: string
  booking_date: string
  booking_time: string
  barber_id: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

const statusConfig = {
  pending: {
    label: 'Pending',
    description: 'Your booking is awaiting confirmation from our team.',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
    ring: 'ring-yellow-400/20',
    dot: 'bg-yellow-400',
    gradient: 'from-yellow-400/20 to-yellow-400/5',
  },
  confirmed: {
    label: 'Confirmed',
    description: 'Your appointment is confirmed! See you soon.',
    icon: CheckCircle,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    ring: 'ring-emerald-400/20',
    dot: 'bg-emerald-400',
    gradient: 'from-emerald-400/20 to-emerald-400/5',
  },
  completed: {
    label: 'Completed',
    description: 'This appointment has been completed. Thanks for visiting!',
    icon: CheckCircle,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    ring: 'ring-primary/20',
    dot: 'bg-primary',
    gradient: 'from-primary/20 to-primary/5',
  },
  cancelled: {
    label: 'Cancelled',
    description: 'This booking has been cancelled.',
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    ring: 'ring-red-400/20',
    dot: 'bg-red-400',
    gradient: 'from-red-400/20 to-red-400/5',
  },
}

const filterOptions = [
  { value: 'all', label: 'All Bookings' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function MyBookings() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getClientUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      await fetchBookings(currentUser.id)
      setLoading(false)
    }
    getUser()
  }, [])

  // Set up real-time subscription for booking status changes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('booking-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Update the booking in state when it changes
          setBookings((prev) =>
            prev.map((b) =>
              b.id === payload.new.id ? { ...b, ...payload.new } as Booking : b
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setBookings(data as Booking[])
    }
  }

  const handleRefresh = async () => {
    if (!user) return
    setRefreshing(true)
    await fetchBookings(user.id)
    setTimeout(() => setRefreshing(false), 500)
  }

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter)

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatServiceName = (serviceId: string) => {
    return serviceId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
              My Appointments
            </span>
            <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-slate-500">
              Track the status of your appointments in real-time
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/booking"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 transition-all"
            >
              <CalendarPlus className="w-5 h-5" />
              New Booking
            </Link>
          </div>
        </div>

        {/* Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => {
            const config = statusConfig[status]
            const Icon = config.icon
            return (
              <button
                key={status}
                onClick={() => setFilter(filter === status ? 'all' : status)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  filter === status
                    ? `${config.border} ${config.bg} ring-2 ${config.ring}`
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-xs font-bold uppercase tracking-wide ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <span className="text-2xl font-bold">{counts[status]}</span>
              </button>
            )
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === option.value
                  ? 'bg-primary text-background'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {option.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({counts[option.value as keyof typeof counts]})
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-16 h-16 text-slate-800 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-500 mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {filter === 'all'
                ? "You haven't made any appointments yet."
                : `You don't have any ${filter} appointments.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 transition-all"
              >
                <CalendarPlus className="w-5 h-5" />
                Book an Appointment
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const config = statusConfig[booking.status]
              const StatusIcon = config.icon
              
              return (
                <div
                  key={booking.id}
                  className={`group relative rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${config.border}`}
                >
                  {/* Status gradient accent */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-50`} />
                  
                  {/* Left status indicator bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.dot}`} />

                  <div className="relative p-6 pl-7">
                    {/* Top Row: Service + Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                          <Scissors className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">
                            {formatServiceName(booking.service)}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Booked on {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                    </div>

                    {/* Barber Info */}
                    {booking.barber_id && (() => {
                      const barber = getBarberById(booking.barber_id)
                      return barber ? (
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                          <img src={barber.image} alt={barber.name} className="w-10 h-10 rounded-full object-cover border border-primary/30" />
                          <div>
                            <p className="text-xs text-slate-500">Your Barber</p>
                            <p className="text-sm font-bold">{barber.name}</p>
                          </div>
                        </div>
                      ) : null
                    })()}

                    {/* Status Message */}
                    <div className={`mb-4 p-3 rounded-xl ${config.bg} border ${config.border}`}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className={`w-4 h-4 ${config.color} mt-0.5 shrink-0`} />
                        <p className={`text-sm ${config.color}`}>
                          {config.description}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="text-sm font-medium">{formatDate(booking.booking_date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="text-sm font-medium">{booking.booking_time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">Phone</p>
                          <p className="text-sm font-medium">{booking.customer_phone}</p>
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="flex items-start gap-2 col-span-2 md:col-span-1">
                          <StickyNote className="w-4 h-4 text-slate-500 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Notes</p>
                            <p className="text-sm font-medium truncate max-w-[150px]">{booking.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action for confirmed bookings */}
                    {booking.status === 'confirmed' && (
                      <div className="mt-4 pt-4 border-t border-emerald-400/10">
                        <p className="text-xs text-emerald-400/70 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Your appointment is confirmed. Please arrive 5-10 minutes early.
                        </p>
                      </div>
                    )}

                    {/* Rebooking for cancelled */}
                    {booking.status === 'cancelled' && (
                      <div className="mt-4 pt-4 border-t border-red-400/10">
                        <Link
                          href={`/booking?service=${booking.service}`}
                          className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                        >
                          Rebook this service
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
