import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

// Free hairstyle images from Pexels (pexels.com) - high quality, free to use
const allServices = [
  {
    id: 'classic-fade',
    name: 'Classic Fade',
    description: 'Sharp, clean, and eternally timeless. The fade gradually transitions from short to long for a polished look.',
    price: '₱350',
    duration: '45 min',
    image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'All face shapes'
  },
  {
    id: 'signature-undercut',
    name: 'Signature Undercut',
    description: 'A modern edge for the bold individual. Short sides with longer top for versatile styling.',
    price: '₱400',
    duration: '50 min',
    image: 'https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Oval, square faces'
  },
  {
    id: 'pompadour',
    name: 'Classic Pompadour',
    description: 'Vintage-inspired style with volume on top and shorter sides. A timeless statement.',
    price: '₱450',
    duration: '60 min',
    image: 'https://images.pexels.com/photos/2076930/pexels-photo-2076930.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Round, oval faces'
  },
  {
    id: 'textured-crop',
    name: 'Textured Crop',
    description: 'Modern, low-maintenance cut with textured layers that add dimension and movement.',
    price: '₱380',
    duration: '45 min',
    image: 'https://images.pexels.com/photos/668196/pexels-photo-668196.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'All face shapes'
  },
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    description: 'Ultra-short all over for a clean, masculine look. Minimal maintenance required.',
    price: '₱250',
    duration: '30 min',
    image: 'https://images.pexels.com/photos/897270/pexels-photo-897270.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'All face shapes'
  },
  {
    id: 'side-part',
    name: 'Side Part',
    description: 'Clean and professional look with a defined part. Perfect for business and formal occasions.',
    price: '₱350',
    duration: '45 min',
    image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Oval, heart faces'
  },
  {
    id: 'quiff',
    name: 'Modern Quiff',
    description: 'Volume at the front swept upward and back. A stylish, contemporary choice.',
    price: '₱420',
    duration: '55 min',
    image: 'https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Oval, round faces'
  },
  {
    id: 'crew-cut',
    name: 'Crew Cut',
    description: 'Short on sides, slightly longer on top. Classic military-inspired style.',
    price: '₱300',
    duration: '35 min',
    image: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'All face shapes'
  },
  {
    id: 'french-crop',
    name: 'French Crop',
    description: 'Short fringe with tapered sides. European style that\'s trending worldwide.',
    price: '₱380',
    duration: '45 min',
    image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Square, oval faces'
  },
  {
    id: 'slick-back',
    name: 'Slick Back',
    description: 'Hair combed back for a sleek, sophisticated appearance. Works with medium to long hair.',
    price: '₱400',
    duration: '50 min',
    image: 'https://images.pexels.com/photos/1446166/pexels-photo-1446166.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Oval, heart faces'
  },
  {
    id: 'beard-sculpting',
    name: 'Beard Sculpting',
    description: 'Precision grooming for the perfect jawline. Includes shaping and conditioning treatment.',
    price: '₱250',
    duration: '30 min',
    image: 'https://images.pexels.com/photos/2061820/pexels-photo-2061820.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Beard maintenance'
  },
  {
    id: 'hot-towel-shave',
    name: 'Hot Towel Shave',
    description: 'The ultimate luxury relaxation experience. Traditional straight razor shave with hot towels.',
    price: '₱300',
    duration: '40 min',
    image: 'https://images.pexels.com/photos/2068672/pexels-photo-2068672.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&dpr=1',
    bestFor: 'Clean shave, relaxation'
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">
            Our Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All Hairstyles & Services
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Browse our complete collection of premium haircuts and grooming services. 
            Each style is crafted to perfection by our expert barbers.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allServices.map((service) => (
            <div 
              key={service.id}
              className="group bg-background/50 rounded-xl border border-primary/10 overflow-hidden hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden relative">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm">
                    <span className="text-primary font-bold">Best for:</span> {service.bestFor}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <span className="text-primary font-bold">{service.price}</span>
                </div>
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{service.duration}</span>
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-background transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-4">Not sure which style suits you?</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold rounded-lg hover:bg-primary/90 transition-all"
          >
            Try AI Style Finder
          </Link>
        </div>
      </div>
    </div>
  )
}
