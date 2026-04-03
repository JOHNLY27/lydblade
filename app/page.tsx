import Link from 'next/link'
import { Scissors, Sparkles, Calendar, ArrowRight, Star, HelpCircle, Shield, Clock } from 'lucide-react'
import BarbersList from '@/components/barbers-list'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative px-6 py-12 md:px-10 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-xl bg-slate-900 min-h-[500px] flex items-center justify-center p-8 text-center bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&h=1080&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative max-w-3xl space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest border border-primary/30">
                  Premium Barbershop
                </span>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight text-white">
                  Master Your Look at <span className="text-primary">Lydblade</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
                  Where classic barbershop tradition meets modern style. Expert cuts, precision grooming, and AI-powered recommendations for the perfect you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
                <Link href="/booking" className="relative flex items-center justify-center gap-3 rounded-2xl h-16 sm:h-18 px-12 bg-primary text-background text-lg sm:text-xl font-bold hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary/30 group">
                  <span className="absolute inset-0 rounded-2xl bg-primary/50 animate-ping opacity-20"></span>
                  <Calendar className="w-6 h-6" />
                  Book Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/dashboard" className="flex items-center justify-center gap-3 rounded-2xl h-16 sm:h-18 px-10 bg-white/10 text-white border border-white/20 backdrop-blur-sm text-base font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5" />
                  AI Style Finder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-16 md:px-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10 border-l-4 border-primary pl-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Our Premium Services</h2>
            <p className="text-slate-500 mt-2">Meticulously crafted styles for the modern gentleman.</p>
          </div>
          <Link href="/services" className="text-primary font-bold flex items-center gap-1 hover:underline decoration-2 underline-offset-4">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Classic Fade', desc: 'Sharp, clean, and eternally timeless.', img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop' },
            { title: 'Signature Undercut', desc: 'A modern edge for the bold individual.', img: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop' },
            { title: 'Beard Sculpting', desc: 'Precision grooming for the perfect jawline.', img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop' },
            { title: 'Hot Towel Shave', desc: 'The ultimate luxury relaxation experience.', img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop' },
          ].map((service, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                <img src={service.img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Link href="/booking" className="w-full py-2 bg-primary text-background font-bold rounded text-sm text-center">Book Now</Link>
                </div>
              </div>
              <h3 className="text-lg font-bold">{service.title}</h3>
              <p className="text-slate-500 text-sm">{service.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Meet Our Barbers Section */}
      <section className="px-6 py-16 md:px-10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-4 border-primary pl-6 mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Meet Our Barbers</h2>
            <p className="text-slate-500 mt-2">Skilled professionals dedicated to your perfect look.</p>
          </div>
          <BarbersList />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-16 md:px-10 max-w-7xl mx-auto border-t border-primary/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose Lydblade?</h2>
          <p className="text-slate-500 mt-2">More than just a haircut, it's an experience.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">AI-Powered Styling</h3>
            <p className="text-sm text-slate-400">Not sure what fits? Our AI analyzes your face shape and hair type to recommend your best look.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Premium Quality</h3>
            <p className="text-sm text-slate-400">We use only top-tier grooming products and precise techniques for an unmatched finish.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Seamless Booking</h3>
            <p className="text-sm text-slate-400">Book, manage, and track your appointments easily with our modern platform.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 md:px-10 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">What Our Clients Say</h2>
            <p className="text-slate-500 mt-2">Join hundreds of satisfied gentlemen.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Mark D.', text: 'Best fade I have ever gotten. The AI suggested a style I never thought of, and it looks incredible.', rate: 5 },
              { name: 'Steve R.', text: 'Super professional. The atmosphere is top-notch and booking online is a breeze. Highly recommend.', rate: 5 },
              { name: 'Jason T.', text: 'Great service. Took his time and delivered exactly what I asked for. Will definitely be coming back.', rate: 5 },
            ].map((review, i) => (
              <div key={i} className="p-6 bg-background rounded-2xl border border-slate-800">
                <div className="flex gap-1 text-primary mb-3">
                  {[...Array(review.rate)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-primary" />)}
                </div>
                <p className="text-sm text-slate-300 italic mb-4">"{review.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-xs text-slate-400">
                    {review.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-400">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 md:px-10 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {[
            { q: 'Do you accept walk-ins?', a: 'While we do accept walk-ins, we highly recommend booking an appointment online to guarantee your slot and avoid long wait times.' },
            { q: 'How does the AI Style Finder work?', a: 'Just upload a photo or answer a few quick questions about your face shape and hair type. Our AI analyzes this to suggest the most flattering haircuts for you.' },
            { q: 'What happens if I need to cancel?', a: 'You can cancel your pending bookings directly from your "My Bookings" page. For confirmed slots, please contact us if you need to reschedule.' },
            { q: 'Do you offer kids haircuts?', a: 'Yes, we provide styling for all ages. However, our atmosphere is tailored towards a premium adult grooming experience.' },
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                {faq.q}
              </h3>
              <p className="text-sm text-slate-400 pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="px-6 py-16 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-4 border-primary pl-6 mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Find Us</h2>
            <p className="text-slate-500 mt-2">Visit our barbershop and experience premium grooming.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Map */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-slate-800 h-[400px] lg:h-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15795.0!2d125.5356!3d8.9475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3301f9be1a2b5f3d%3A0x3a3c4c3b3c3c3c3c!2sBuhangin%2C%20Butuan%20City%2C%20Agusan%20del%20Norte!5e0!3m2!1sen!2sph!4v1710000000000"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lydblade Barbershop Location - Buhangin, Butuan City"
              />
            </div>

            {/* Info Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Address */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">Our Location</h3>
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Lydblade Grooming Lab</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Buhangin, Butuan City
                    <br />
                    Agusan del Norte
                    <br />
                    Philippines
                  </p>
                </div>
                <a
                  href="https://www.google.com/maps/search/Buhangin+Butuan+City+Agusan+del+Norte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background font-bold text-sm hover:bg-primary/90 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
                  </svg>
                  Get Directions
                </a>
              </div>

              {/* Business Hours */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">Business Hours</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { day: 'Monday', hours: '9:00 AM – 8:00 PM' },
                    { day: 'Tuesday', hours: '9:00 AM – 8:00 PM' },
                    { day: 'Wednesday', hours: '9:00 AM – 8:00 PM' },
                    { day: 'Thursday', hours: '9:00 AM – 8:00 PM' },
                    { day: 'Friday', hours: '9:00 AM – 9:00 PM' },
                    { day: 'Saturday', hours: '8:00 AM – 9:00 PM' },
                    { day: 'Sunday', hours: '10:00 AM – 6:00 PM' },
                  ].map((item) => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                    const isToday = item.day === today
                    return (
                      <div key={item.day} className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${isToday ? 'bg-primary/10 border border-primary/20' : ''}`}>
                        <span className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-slate-400'}`}>
                          {item.day}
                          {isToday && <span className="ml-2 text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full">Today</span>}
                        </span>
                        <span className={`text-sm ${isToday ? 'font-bold text-primary' : 'text-slate-300'}`}>{item.hours}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Contact */}
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">Contact</h3>
                </div>
                <div className="space-y-3">
                  <a href="tel:+639949479270" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors">
                    <span className="text-primary">📞</span>
                    0994 947 9270
                  </a>
                  <a href="mailto:remitarjohnlydrick@gmail.com" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors">
                    <span className="text-primary">📧</span>
                    remitarjohnlydrick@gmail.com
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-slate-400 hover:text-primary transition-colors">
                    <span className="text-primary">📱</span>
                    @Lydblade
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-12 px-6 md:px-10 bg-background mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <Scissors className="w-8 h-8" />
            <h2 className="text-2xl font-bold tracking-tight">Lydblade</h2>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
          <p className="text-center text-slate-500 text-xs">
            © {new Date().getFullYear()} Lydblade Grooming Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
