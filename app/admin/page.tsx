'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, isAdmin, type UserWithRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { 
  Shield, Users, LogOut, Loader2, Calendar, CheckCircle, XCircle, Clock, 
  Scissors, TrendingUp, Star, AlertCircle, Eye, BarChart3, 
  CalendarDays, UserCheck, Activity, RefreshCw, ChevronRight, Search,
  Filter, Plus
} from 'lucide-react'
import Link from 'next/link'


const formatServiceName = (serviceId: string) => {
  return serviceId
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function AdminDashboard() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ users: 0, uploads: 0, recommendations: 0, bookings: 0 })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [barbersList, setBarbersList] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'barbers'>('overview')
  const [bookingFilter, setBookingFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [barberSearchQuery, setBarberSearchQuery] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const getBarberById = (id: string | number) => barbersList.find(b => String(b.id) === String(id))

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const currentUser = await getClientUser()
    if (!currentUser || !isAdmin(currentUser)) {
      router.push('/dashboard')
      return
    }
    setUser(currentUser)
    await fetchAdminData()
    setLoading(false)
  }

  const fetchAdminData = async () => {
    // Run all queries in parallel instead of sequentially
    const [
      { count: userCount },
      { count: uploadCount },
      { count: recCount },
      { count: bookingCount },
      { data: users },
      { data: bookingsData },
      { data: barbersData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('uploads').select('*', { count: 'exact', head: true }),
      supabase.from('recommendations').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('barbers').select('*'),
    ])

    setStats({
      users: userCount || 0,
      uploads: uploadCount || 0,
      recommendations: recCount || 0,
      bookings: bookingCount || 0
    })
    setRecentUsers(users || [])
    setBookings(bookingsData || [])
    setBarbersList(barbersData || [])
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAdminData()
    setTimeout(() => setRefreshing(false), 500)
  }

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
    
    if (!error) {
      fetchAdminData()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Computed data
  const today = new Date().toISOString().split('T')[0]
  
  const bookingStats = useMemo(() => {
    const pending = bookings.filter(b => b.status === 'pending').length
    const confirmed = bookings.filter(b => b.status === 'confirmed').length
    const completed = bookings.filter(b => b.status === 'completed').length
    const cancelled = bookings.filter(b => b.status === 'cancelled').length
    const todayBookings = bookings.filter(b => b.booking_date === today)
    const todayPending = todayBookings.filter(b => b.status === 'pending').length
    return { pending, confirmed, completed, cancelled, todayBookings, todayPending }
  }, [bookings, today])

  // Popular services
  const popularServices = useMemo(() => {
    const serviceCounts: Record<string, number> = {}
    bookings.forEach(b => {
      serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1
    })
    return Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([service, count]) => ({ service, count }))
  }, [bookings])

  // Barber performance
  const barberPerformance = useMemo(() => {
    return barbersList
      .filter(b => barberSearchQuery === '' || b.name.toLowerCase().includes(barberSearchQuery.toLowerCase()))
      .map(barber => {
        const barberBookings = bookings.filter(b => String(b.barber_id) === String(barber.id))
        const completedCount = barberBookings.filter(b => b.status === 'completed').length
        const todayCount = barberBookings.filter(b => b.booking_date === today).length
        const totalCount = barberBookings.length
        
        // Find last activity
        const lastBooking = barberBookings.length > 0 
          ? barberBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at 
          : null

        return {
          ...barber,
          totalBookings: totalCount,
          completedBookings: completedCount,
          todayBookings: todayCount,
          lastBooking
        }
      }).sort((a, b) => b.totalBookings - a.totalBookings)
  }, [bookings, today, barbersList, barberSearchQuery])

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings
    if (bookingFilter !== 'all') {
      filtered = filtered.filter(b => b.status === bookingFilter)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(b => {
        const barber = getBarberById(b.barber_id)
        return (
          b.customer_name?.toLowerCase().includes(q) ||
          b.customer_phone?.toLowerCase().includes(q) ||
          b.service?.toLowerCase().includes(q) ||
          (barber && barber.name.toLowerCase().includes(q))
        )
      })
    }
    return filtered
  }, [bookings, bookingFilter, searchQuery, barbersList])

  // Recent activity (last 5 bookings)
  const recentBookings = useMemo(() => bookings.slice(0, 5), [bookings])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-primary/10 hidden lg:flex flex-col p-6 space-y-8 sticky top-0 h-screen">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-8 h-8" />
          <h2 className="text-xl font-bold tracking-tight">Admin Panel</h2>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview' as const, label: 'Dashboard', icon: BarChart3 },
            { id: 'bookings' as const, label: 'Bookings', icon: Calendar, badge: bookingStats.pending },
            { id: 'barbers' as const, label: 'Barbers', icon: Scissors },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-background' 
                  : 'text-slate-400 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </span>
              {tab.badge ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-background/20 text-background' : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-primary/10 space-y-1">
            <Link href="/admin/management" className="w-full flex items-center gap-3 px-4 py-3 text-emerald-400 hover:bg-emerald-400/10 rounded-xl transition-all font-medium">
              <Plus className="w-5 h-5" />
              Manage Data (New)
            </Link>
            <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-primary/10 hover:text-primary rounded-xl transition-all">
              <Eye className="w-5 h-5" />
              Customer View
            </Link>
          </div>
        </nav>

        <div className="pt-6 border-t border-primary/10">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.email}</p>
              <p className="text-xs text-primary uppercase font-medium">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">

        {/* ═══════════════════════ OVERVIEW TAB ═══════════════════════ */}
        {activeTab === 'overview' && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Total Bookings', value: stats.bookings, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'AI Suggestions', value: stats.recommendations, icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Uploads', value: stats.uploads, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              ].map((stat, i) => (
                <div key={i} className="p-5 rounded-2xl border border-slate-800 bg-background/50 hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Today's Overview + Pending Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Today's Schedule */}
              <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Today's Schedule
                    </h2>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {bookingStats.todayBookings.length} appointments
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  {bookingStats.todayBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookingStats.todayBookings
                        .sort((a: any, b: any) => a.booking_time.localeCompare(b.booking_time))
                        .slice(0, 5)
                        .map((booking: any) => {
                        const barber = booking.barber_id ? getBarberById(booking.barber_id) : null
                        return (
                          <div key={booking.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800">
                            <div className="text-center shrink-0 w-14">
                              <p className="text-xs text-slate-500">Time</p>
                              <p className="text-sm font-bold text-primary">{booking.booking_time}</p>
                            </div>
                            <div className="h-8 w-px bg-slate-700" />
                            {barber && (
                              <img src={barber.image} alt={barber.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{booking.customer_name}</p>
                              <p className="text-xs text-slate-500 truncate">{formatServiceName(booking.service)}</p>
                            </div>
                            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              booking.status === 'confirmed' ? 'bg-emerald-400/20 text-emerald-400' :
                              booking.status === 'completed' ? 'bg-primary/20 text-primary' :
                              booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                              'bg-yellow-400/20 text-yellow-400'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        )
                      })}
                      {bookingStats.todayBookings.length > 5 && (
                        <button
                          onClick={() => setActiveTab('bookings')}
                          className="w-full text-center text-xs text-primary font-medium py-2 hover:underline"
                        >
                          View all {bookingStats.todayBookings.length} appointments →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Status Breakdown */}
              <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Booking Overview
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  {/* Status bars */}
                  {[
                    { label: 'Pending', count: bookingStats.pending, color: 'bg-yellow-400', textColor: 'text-yellow-400' },
                    { label: 'Confirmed', count: bookingStats.confirmed, color: 'bg-emerald-400', textColor: 'text-emerald-400' },
                    { label: 'Completed', count: bookingStats.completed, color: 'bg-primary', textColor: 'text-primary' },
                    { label: 'Cancelled', count: bookingStats.cancelled, color: 'bg-red-400', textColor: 'text-red-400' },
                  ].map((item, i) => {
                    const total = stats.bookings || 1
                    const percentage = Math.round((item.count / total) * 100)
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-400">{item.label}</span>
                          <span className={`font-bold ${item.textColor}`}>{item.count} <span className="font-normal text-slate-600">({percentage}%)</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all duration-700`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  {/* Pending action card */}
                  {bookingStats.pending > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-yellow-400">
                            {bookingStats.pending} pending {bookingStats.pending === 1 ? 'booking needs' : 'bookings need'} your attention
                          </p>
                          <button
                            onClick={() => { setActiveTab('bookings'); setBookingFilter('pending') }}
                            className="text-xs text-yellow-400/70 mt-1 hover:underline flex items-center gap-1"
                          >
                            Review now <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Services + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Popular Services */}
              <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-primary" />
                    Most Popular Services
                  </h2>
                </div>
                <div className="p-5">
                  {popularServices.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No booking data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {popularServices.map((item, i) => {
                        const maxCount = popularServices[0]?.count || 1
                        const percentage = Math.round((item.count / maxCount) * 100)
                        return (
                          <div key={item.service} className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              i === 0 ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium truncate">{formatServiceName(item.service)}</span>
                                <span className="text-xs text-slate-500 shrink-0 ml-2">{item.count} bookings</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${i === 0 ? 'bg-primary' : 'bg-slate-600'}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Recent Activity
                    </h2>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-800">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="p-4 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        booking.status === 'confirmed' ? 'bg-emerald-400' :
                        booking.status === 'completed' ? 'bg-primary' :
                        booking.status === 'cancelled' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <strong>{booking.customer_name}</strong>{' '}
                          <span className="text-slate-500">booked</span>{' '}
                          <strong className="text-primary">{formatServiceName(booking.service)}</strong>
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {new Date(booking.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        booking.status === 'confirmed' ? 'bg-emerald-400/20 text-emerald-400' :
                        booking.status === 'completed' ? 'bg-primary/20 text-primary' :
                        booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                        'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barber Quick Stats + Recent Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Barber Quick Stats */}
              <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-primary" />
                      Barber Performance
                    </h2>
                    <button
                      onClick={() => setActiveTab('barbers')}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Details
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-800">
                  {barberPerformance.map((barber) => (
                    <div key={barber.id} className="p-4 flex items-center gap-3">
                      <img src={barber.image} alt={barber.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{barber.name}</p>
                        <p className="text-xs text-slate-500">{barber.specialty}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-primary">{barber.totalBookings}</p>
                        <p className="text-[10px] text-slate-500">bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
                <div className="p-5 border-b border-slate-800">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Recent Users
                  </h2>
                </div>
                <div className="divide-y divide-slate-800">
                  {recentUsers.slice(0, 5).map((u) => (
                    <div key={u.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[180px]">{u.email}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin' 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════ BOOKINGS TAB ═══════════════════════ */}
        {activeTab === 'bookings' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Bookings</h1>
                <p className="text-slate-500 mt-1">Manage customer appointments</p>
              </div>
              <button
                onClick={handleRefresh}
                className="p-3 rounded-xl border border-primary/20 text-primary hover:bg-primary/10 transition-all"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Pending', count: bookingStats.pending, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', filter: 'pending' },
                { label: 'Confirmed', count: bookingStats.confirmed, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', filter: 'confirmed' },
                { label: 'Completed', count: bookingStats.completed, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', filter: 'completed' },
                { label: 'Cancelled', count: bookingStats.cancelled, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', filter: 'cancelled' },
              ].map((item) => (
                <button
                  key={item.filter}
                  onClick={() => setBookingFilter(bookingFilter === item.filter ? 'all' : item.filter)}
                  className={`p-4 rounded-xl border transition-all text-left ${
                    bookingFilter === item.filter ? `${item.border} ${item.bg} ring-1 ring-offset-0 ${item.border}` : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                </button>
              ))}
            </div>

            {/* Search + Filter */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name, phone, service, or barber..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                />
              </div>
              <button
                onClick={() => { setBookingFilter('all'); setSearchQuery('') }}
                className="px-4 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-primary hover:border-primary/20 transition-all text-sm flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear
              </button>
            </div>

            {/* Bookings List */}
            <div className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-base font-bold">
                  {bookingFilter === 'all' ? 'All Bookings' : `${bookingFilter.charAt(0).toUpperCase() + bookingFilter.slice(1)} Bookings`}
                  <span className="text-sm font-normal text-slate-500 ml-2">({filteredBookings.length})</span>
                </h2>
              </div>
              
              {filteredBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No bookings found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {filteredBookings.map((booking) => {
                    const barber = booking.barber_id ? getBarberById(booking.barber_id) : null
                    return (
                      <div key={booking.id} className="p-5 hover:bg-slate-800/20 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-bold">{booking.customer_name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                booking.status === 'confirmed' ? 'bg-emerald-400/20 text-emerald-400' :
                                booking.status === 'completed' ? 'bg-primary/20 text-primary' :
                                booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                                'bg-yellow-400/20 text-yellow-400'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Scissors className="w-3.5 h-3.5" />
                                {formatServiceName(booking.service)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {booking.booking_date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {booking.booking_time}
                              </span>
                              <span className="text-slate-500">📞 {booking.customer_phone}</span>
                            </div>
                            {barber && (
                              <div className="flex items-center gap-2 mt-2">
                                <img src={barber.image} alt={barber.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-xs text-slate-500">Barber: <strong className="text-slate-300">{barber.name}</strong></span>
                              </div>
                            )}
                            {booking.notes && (
                              <p className="text-xs text-slate-500 mt-2 italic">"{booking.notes}"</p>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0 ml-4">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20 transition-all"
                                  title="Confirm"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  className="p-2.5 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all"
                                  title="Cancel"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                                title="Mark Complete"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════ BARBERS TAB ═══════════════════════ */}
        {activeTab === 'barbers' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Barbers</h1>
                <p className="text-slate-500 mt-1">View barber performance and schedule</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search barbers..."
                    value={barberSearchQuery}
                    onChange={(e) => setBarberSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl bg-slate-800/30 border border-slate-800 text-sm focus:border-primary transition-all outline-none"
                  />
                </div>
                <Link 
                  href="/admin/management" 
                  className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-background rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barberPerformance.map((barber) => {
                const completionRate = barber.totalBookings > 0 
                  ? Math.round((barber.completedBookings / barber.totalBookings) * 100) 
                  : 0
                return (
                  <div key={barber.id} className="rounded-2xl border border-slate-800 bg-background/50 overflow-hidden hover:border-primary/30 transition-all group">
                    {/* Barber Header */}
                    <div className="relative p-6 pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <img 
                          src={barber.image} 
                          alt={barber.name} 
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-primary/30 transition-all" 
                        />
                        <div>
                          <h3 className="text-lg font-bold">{barber.name}</h3>
                          <p className="text-xs text-slate-500">{barber.specialty}</p>
                          {barber.lastBooking && (
                            <p className="text-[10px] text-slate-600 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Active {new Date(barber.lastBooking).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                          <p className="text-xl font-bold text-primary">{barber.totalBookings}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Total</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-emerald-400/5 border border-emerald-400/10">
                          <p className="text-xl font-bold text-emerald-400">{barber.completedBookings}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Done</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-blue-400/5 border border-blue-400/10">
                          <p className="text-xl font-bold text-blue-400">{barber.todayBookings}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Today</p>
                        </div>
                      </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">Completion rate</span>
                        <span className="font-bold text-primary">{completionRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
