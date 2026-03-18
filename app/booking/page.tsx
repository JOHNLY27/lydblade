'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, type UserWithRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Scissors, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const services = [
  { id: 'classic-fade', name: 'Classic Fade', price: '₱350', duration: '45 min' },
  { id: 'signature-undercut', name: 'Signature Undercut', price: '₱400', duration: '50 min' },
  { id: 'beard-sculpting', name: 'Beard Sculpting', price: '₱250', duration: '30 min' },
  { id: 'hot-towel-shave', name: 'Hot Towel Shave', price: '₱300', duration: '40 min' },
  { id: 'full-grooming', name: 'Full Grooming Package', price: '₱700', duration: '90 min' },
  { id: 'hair-color', name: 'Hair Color & Styling', price: '₱800', duration: '120 min' },
]

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', 
  '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

export default function Booking() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getClientUser()
      if (currentUser) {
        setUser(currentUser)
        setFormData(prev => ({ ...prev, name: currentUser.email.split('@')[0] }))
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.service || !formData.date || !formData.time) {
      alert('Please fill in all required fields')
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
          notes: formData.notes,
          status: 'pending'
        })

      if (error) throw error
      setSubmitted(true)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-8">
            Your appointment has been scheduled. We'll send you a confirmation message soon.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/" 
              className="w-full py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-all"
            >
              Back to Home
            </Link>
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full py-3 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/10 transition-all"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    )
  }

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
            Skip the AI recommendation and book directly. Our expert barbers will give you the perfect look.
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
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.service === service.id
                          ? 'border-primary bg-primary/10'
                          : 'border-slate-800 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{service.name}</span>
                        <span className="text-primary font-bold">{service.price}</span>
                      </div>
                      <span className="text-xs text-slate-500">{service.duration}</span>
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
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                          onClick={() => setFormData({ ...formData, time })}
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
                disabled={submitting}
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
            <div className="p-6 rounded-xl border border-primary/10 bg-background/50">
              <h3 className="font-bold mb-4">Why Book With Us?</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Expert barbers with 10+ years experience
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Premium grooming products
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  Relaxing atmosphere
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
