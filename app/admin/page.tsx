'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, isAdmin, type UserWithRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Shield, Users, Image, LogOut, Loader2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, uploads: 0, recommendations: 0, bookings: 0 })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const supabase = createClient()
  const router = useRouter()

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
    fetchAdminData()
    setLoading(false)
  }

  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview')

  const fetchAdminData = async () => {
    // Get counts
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: uploadCount } = await supabase
      .from('uploads')
      .select('*', { count: 'exact', head: true })
    
    const { count: recCount } = await supabase
      .from('recommendations')
      .select('*', { count: 'exact', head: true })

    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    setStats({
      users: userCount || 0,
      uploads: uploadCount || 0,
      recommendations: recCount || 0,
      bookings: bookingCount || 0
    })

    // Get recent users
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    setRecentUsers(users || [])

    // Get recent bookings
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    
    setBookings(bookingsData || [])
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

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'overview' ? 'bg-primary text-background' : 'text-slate-400 hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <Shield className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-primary text-background' : 'text-slate-400 hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Bookings
          </button>
          <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-primary/10 hover:text-primary rounded-lg transition-all block">
            <Image className="w-5 h-5" />
            Customer View
          </Link>
        </nav>

        <div className="pt-6 border-t border-primary/10">
          <div className="flex items-center gap-3 p-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.email}</p>
              <p className="text-xs text-primary uppercase">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {activeTab === 'overview' ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your application data</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Users</p>
                    <p className="text-2xl font-bold">{stats.users}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Image className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Uploads</p>
                    <p className="text-2xl font-bold">{stats.uploads}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Recommendations</p>
                    <p className="text-2xl font-bold">{stats.recommendations}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Bookings</p>
                    <p className="text-2xl font-bold">{stats.bookings}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="rounded-xl border border-primary/10 bg-background/50 overflow-hidden">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl font-bold">Recent Users</h2>
              </div>
              <div className="divide-y divide-primary/10">
                {recentUsers.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {u.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.email}</p>
                        <p className="text-sm text-slate-500">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
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
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Bookings</h1>
              <p className="text-slate-500 mt-1">Manage customer appointments</p>
            </div>

            <div className="rounded-xl border border-primary/10 bg-background/50 overflow-hidden">
              <div className="p-6 border-b border-primary/10">
                <h2 className="text-xl font-bold">Recent Bookings</h2>
              </div>
              <div className="divide-y divide-primary/10">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold">{booking.customer_name}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                            booking.status === 'completed' ? 'bg-primary/20 text-primary' :
                            booking.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">{booking.service}</p>
                        <p className="text-sm text-slate-500">
                          {booking.booking_date} at {booking.booking_time} • {booking.customer_phone}
                        </p>
                        {booking.notes && (
                          <p className="text-sm text-slate-500 mt-2 italic">"{booking.notes}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="p-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-all"
                              title="Confirm"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all"
                              title="Cancel"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                            title="Mark Complete"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
