import Link from 'next/link'
import { Scissors, Sparkles, Calendar, ArrowRight } from 'lucide-react'

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
                  Master Your Look at <span className="text-primary">Blade & AI</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
                  Where classic barbershop tradition meets modern style. Expert cuts, precision grooming, and AI-powered recommendations for the perfect you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/booking" className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 bg-primary text-background text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 group">
                  <Calendar className="w-5 h-5" />
                  Book Now
                </Link>
                <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-lg h-14 px-8 bg-white/10 text-white border border-white/20 backdrop-blur-sm text-base font-bold hover:bg-white/20 transition-all">
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

      {/* Footer */}
      <footer className="border-t border-primary/10 py-12 px-6 md:px-10 bg-background mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-primary">
            <Scissors className="w-8 h-8" />
            <h2 className="text-2xl font-bold tracking-tight">Blade & AI</h2>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-500">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contact Us</Link>
          </div>
          <p className="text-center text-slate-500 text-xs">
            © 2024 Blade & AI Grooming Lab. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
