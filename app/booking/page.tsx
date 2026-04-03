'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, type UserWithRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Scissors, CheckCircle, Loader2, CalendarCheck, Star, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', 
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

export default function Booking() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookedSlots, setBookedSlots] = useState<{ barber_id: string; booking_time: string }[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    barber: '',
    notes: ''
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initData = async () => {
      const [userRes, barbersRes, servicesRes] = await Promise.all([
        getClientUser(),
        supabase.from('barbers').select('*').order('created_at', { ascending: true }),
        supabase.from('services').select('*').order('created_at', { ascending: true })
      ])
      
      if (userRes) {
        setUser(userRes)
        setFormData(prev => ({ ...prev, name: userRes.email.split('@')[0], email: userRes.email }))
      }
      if (barbersRes.data) setBarbers(barbersRes.data)
      if (servicesRes.data) setServices(servicesRes.data)
      
      setLoading(false)
    }
    initData()
  }, [])

  // Fetch booked slots when date changes to check barber availability
  useEffect(() => {
    if (formData.date) {
      fetchBookedSlots(formData.date)
    }
  }, [formData.date])

  const fetchBookedSlots = async (date: string) => {
    setCheckingAvailability(true)
    const { data, error } = await supabase
      .from('bookings')
      .select('barber_id, booking_time')
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])

    if (!error && data) {
      setBookedSlots(data)
    }
    setCheckingAvailability(false)
  }

  // Check if a barber is available at a specific time
  const isBarberAvailable = (barberId: string, time: string) => {
    return !bookedSlots.some(
      slot => slot.barber_id === barberId && slot.booking_time === time
    )
  }

  // Get available barbers for the selected time
  const getAvailableBarbers = () => {
    if (!formData.time) return barbers
    return barbers.map(barber => ({
      ...barber,
      available: isBarberAvailable(barber.id, formData.time)
    }))
  }

  // Count how many slots a barber has booked for the selected date
  const getBarberBookingCount = (barberId: string) => {
    return bookedSlots.filter(slot => slot.barber_id === barberId).length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.service || !formData.date || !formData.time || !formData.barber) {
      alert('Please fill in all required fields including selecting a barber')
      return
    }

    // Double check barber availability
    if (!isBarberAvailable(formData.barber, formData.time)) {
      alert('This barber is no longer available at this time. Please select another barber or time.')
      await fetchBookedSlots(formData.date)
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.id || null,
          customer_name: formData.name,
          customer_phone: formData.phone,
          service: formData.service,
          booking_date: formData.date,
          booking_time: formData.time,
          barber_id: formData.barber,
          notes: formData.notes,
          status: 'pending'
        })

      if (error) throw error

      // Send email confirmation using our new API route
      const selectedService = services.find(s => s.id === formData.service)?.name;
      const selectedBarberObj = barbers.find(b => b.id === formData.barber)?.name;
      
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            date: formData.date,
            time: formData.time,
            service: selectedService || formData.service,
            barberName: selectedBarberObj || formData.barber
          })
        });
      } catch (emailError) {
        console.error("Failed to send email confirmation", emailError);
      }

      setSubmitted(true)
    } catch (error: any) {
      console.error('Booking error:', error)
      if (error?.code === '23505') {
        alert('Someone else just booked this time slot! Please choose another time.');
        await fetchBookedSlots(formData.date);
      } else {
        alert('Failed to submit booking. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectedBarber = barbers.find(b => b.id === formData.barber)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-20 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Submitted!</h1>
          {selectedBarber && (
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src={selectedBarber.image}
                alt={selectedBarber.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
              />
              <div className="text-left">
                <p className="font-bold text-sm">{selectedBarber.name}</p>
                <p className="text-xs text-slate-500">Your barber</p>
              </div>
            </div>
          )}
          <p className="text-slate-500 mb-3">
            Your appointment request has been submitted and is <strong className="text-yellow-400">awaiting confirmation</strong> from our team.
          </p>
          <p className="text-sm text-slate-600 mb-8">
            You can track the status of your booking anytime from the My Bookings page.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/my-bookings" 
              className="w-full py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <CalendarCheck className="w-5 h-5" />
              Track My Bookings
            </Link>
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full py-3 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/10 transition-all"
            >
              Book Another
            </button>
            <Link 
              href="/" 
              className="w-full py-3 rounded-lg text-slate-500 font-medium hover:text-slate-300 transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const availableBarbers = getAvailableBarbers()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
            Book Appointment
          </span>
          <h1 className="text-4xl font-bold mb-4">Schedule Your Visit</h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Choose your barber, pick a service, and book your appointment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-primary" />
                  Select Service *
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, service: service.id })}
                      className={`p-4 rounded-lg border text-left transition-all flex items-center gap-4 ${
                        formData.service === service.id
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-800 hover:border-primary/50'
                      }`}
                    >
                      {service.image_url && (
                        <div className="shrink-0">
                          <img 
                            src={service.image_url} 
                            alt={service.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700" 
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold truncate mr-2">{service.name}</span>
                          <span className="text-primary font-bold shrink-0">{service.price}</span>
                        </div>
                        <span className="text-xs text-slate-500">{service.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50 space-y-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Date & Time *
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Select Date</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value, barber: '', time: '' })}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Select Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, time, barber: '' })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            formData.time === time
                              ? 'bg-primary text-background'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barber Selection */}
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Choose Your Barber *
                  </h2>
                  {checkingAvailability && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Checking availability...
                    </span>
                  )}
                </div>

                {!formData.date || !formData.time ? (
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-center">
                    <AlertCircle className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      Please select a <strong>date</strong> and <strong>time</strong> first to see available barbers
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {availableBarbers.map((barber) => {
                      const isAvailable = 'available' in barber ? (barber as any).available === true : true
                      const bookingCount = getBarberBookingCount(barber.id)
                      
                      return (
                        <button
                          key={barber.id}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setFormData({ ...formData, barber: barber.id })}
                          className={`relative p-4 rounded-xl border text-left transition-all ${
                            !isAvailable
                              ? 'border-slate-800 opacity-50 cursor-not-allowed'
                              : formData.barber === barber.id
                              ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                              : 'border-slate-800 hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Barber Photo */}
                            <div className="relative shrink-0">
                              <img
                                src={barber.image}
                                alt={barber.name}
                                className="w-16 h-16 rounded-xl object-cover"
                              />
                              {formData.barber === barber.id && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3.5 h-3.5 text-background" />
                                </div>
                              )}
                              {!isAvailable && (
                                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-red-400 uppercase">Booked</span>
                                </div>
                              )}
                            </div>

                            {/* Barber Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold">{barber.name}</h3>
                                {!isAvailable && (
                                  <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
                                    Unavailable
                                  </span>
                                )}
                                {isAvailable && (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                                    Available
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-400">{barber.specialty}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1 text-xs text-yellow-400">
                                  <Star className="w-3 h-3 fill-yellow-400" />
                                  {barber.rating}
                                </span>
                                <span className="text-xs text-slate-600">•</span>
                                <span className="text-xs text-slate-500">{barber.experience} exp.</span>
                                {bookingCount > 0 && (
                                  <>
                                    <span className="text-xs text-slate-600">•</span>
                                    <span className="text-xs text-slate-500">{bookingCount}/{timeSlots.length} slots booked today</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="p-6 rounded-xl border border-primary/10 bg-background/50 space-y-4">
                <label className="block text-sm font-medium text-slate-400">Additional Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
                  placeholder="Any special requests or preferences..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !formData.barber}
                className="w-full py-4 rounded-lg bg-primary text-background font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Booking Summary */}
            {(formData.service || formData.barber || formData.date) && (
              <div className="p-6 rounded-xl border border-primary/10 bg-primary/5 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                  Booking Summary
                </h3>
                <div className="space-y-3 text-sm">
                  {formData.service && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service</span>
                      <span className="font-medium">{services.find(s => s.id === formData.service)?.name}</span>
                    </div>
                  )}
                  {formData.service && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Price</span>
                      <span className="font-bold text-primary">{services.find(s => s.id === formData.service)?.price}</span>
                    </div>
                  )}
                  {formData.date && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium">
                        {new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  {formData.time && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time</span>
                      <span className="font-medium">{formData.time}</span>
                    </div>
                  )}
                  {selectedBarber && (
                    <div className="pt-3 border-t border-primary/10">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedBarber.image}
                          alt={selectedBarber.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-sm">{selectedBarber.name}</p>
                          <p className="text-xs text-slate-500">{selectedBarber.specialty}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6 rounded-xl border border-primary/10 bg-background/50">
              <h3 className="font-bold mb-4">Why Book With Us?</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {barbers.length} expert barber{barbers.length !== 1 ? 's' : ''} to choose from
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Real-time availability checking
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Premium grooming products
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Satisfaction guaranteed
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-primary/10 bg-primary/5">
              <h3 className="font-bold mb-2">Want AI Recommendations?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Not sure what style suits you? Let our AI analyze your face and suggest the perfect haircut.
              </p>
              <Link
                href="/dashboard"
                className="block w-full py-3 rounded-lg border border-primary text-primary font-bold text-center hover:bg-primary hover:text-background transition-all"
              >
                Try AI Suggestion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
