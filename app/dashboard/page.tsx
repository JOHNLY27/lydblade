'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, type UserWithRole } from '@/lib/auth'
import { 
  Sparkles, 
  Loader2, 
  Lightbulb,
  User,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  RefreshCw
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Face shape options with descriptions
const faceShapes = [
  { id: 'oval', name: 'Oval', description: 'Face length is greater than width, rounded jaw', icon: '🥚' },
  { id: 'round', name: 'Round', description: 'Equal width and length, soft angles', icon: '⚪' },
  { id: 'square', name: 'Square', description: 'Strong jawline, equal width and length', icon: '⬜' },
  { id: 'rectangle', name: 'Rectangle', description: 'Longer than wide, angular features', icon: '📏' },
  { id: 'heart', name: 'Heart', description: 'Wider forehead, narrower chin', icon: '💚' },
  { id: 'diamond', name: 'Diamond', description: 'Narrow forehead and jaw, wide cheekbones', icon: '💎' },
]

// Hair type options
const hairTypes = [
  { id: 'straight', name: 'Straight', description: 'Hair lies flat, no natural curl' },
  { id: 'wavy', name: 'Wavy', description: 'Loose S-shaped waves' },
  { id: 'curly', name: 'Curly', description: 'Defined curls, spiral pattern' },
  { id: 'coily', name: 'Coily', description: 'Tight coils, zigzag pattern' },
]

// Hair texture options
const hairTextures = [
  { id: 'fine', name: 'Fine', description: 'Thin, delicate strands' },
  { id: 'medium', name: 'Medium', description: 'Average thickness' },
  { id: 'thick', name: 'Thick', description: 'Coarse, dense hair' },
]

// Hair length options
const hairLengths = [
  { id: 'very-short', name: 'Very Short', description: 'Buzz cut, under 1 inch' },
  { id: 'short', name: 'Short', description: 'Above ears, 1-3 inches' },
  { id: 'medium', name: 'Medium', description: 'Ear to shoulder length' },
  { id: 'long', name: 'Long', description: 'Past shoulders' },
]

export default function Dashboard() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [step, setStep] = useState(1)
  const [results, setResults] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  
  // Form data
  const [formData, setFormData] = useState({
    faceShape: '',
    hairType: '',
    hairTexture: '',
    hairLength: '',
    lifestyle: '',
  })
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const currentUser = await getClientUser()
      if (!currentUser) {
        router.push('/login')
      } else {
        // Ensure profile exists
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: currentUser.id, 
            email: currentUser.email, 
            role: currentUser.role 
          }, { onConflict: 'id' })
        
        if (profileError) {
          console.error('Profile upsert error:', profileError)
        }
        
        setUser(currentUser)
        fetchHistory(currentUser.id)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('uploads')
      .select(`
        *,
        recommendations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (!error) setHistory(data)
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleAnalyze = async () => {
    if (!user) return
    setAnalyzing(true)

    try {
      // Generate recommendations based on form data
      const recommendations = generateRecommendations(formData)
      
      const result = {
        faceShape: formData.faceShape,
        recommendations: recommendations
      }
      
      setResults(result)
      
      // Save to database
      const { data: dbUpload, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          image_url: 'form-submission',
          face_shape: formData.faceShape
        })
        .select()
        .single()

      if (!dbError && dbUpload) {
        const recsToSave = recommendations.map((rec: any) => ({
          upload_id: dbUpload.id,
          hairstyle_name: rec.name,
          description: rec.description,
          match_percentage: rec.matchPercentage,
          preview_url: rec.imageUrl
        }))
        await supabase.from('recommendations').insert(recsToSave)
        fetchHistory(user.id)
      }
      
      setAnalyzing(false)
    } catch (error: any) {
      console.error('Error:', error)
      alert(`Error: ${error?.message || 'Failed to generate recommendations'}`)
      setAnalyzing(false)
    }
  }

  const generateRecommendations = (data: any) => {
    const recs: any[] = []
    
    // Based on face shape
    const faceShapeRecs: Record<string, string[]> = {
      'oval': ['Classic Pompadour', 'Textured Crop', 'Side Part', 'Modern Quiff'],
      'round': ['Classic Fade', 'Signature Undercut', 'Modern Quiff', 'Slick Back'],
      'square': ['Textured Crop', 'French Crop', 'Classic Pompadour', 'Side Part'],
      'rectangle': ['Side Part', 'Crew Cut', 'Textured Crop', 'Buzz Cut'],
      'heart': ['Side Part', 'Slick Back', 'Textured Crop', 'Classic Fade'],
      'diamond': ['Crew Cut', 'Textured Crop', 'Side Part', 'French Crop'],
    }
    
    const styles = faceShapeRecs[data.faceShape] || faceShapeRecs['oval']
    
    const styleData: Record<string, any> = {
      'Classic Fade': {
        description: 'A sharp fade that gradually transitions from short to long, perfect for adding structure.',
        image: 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Taper_Fade_Blonde.png?v=1748453009'
      },
      'Signature Undercut': {
        description: 'Short sides with longer top create contrast and draw attention upward.',
        image: 'https://cdn.righthair.ai/right-hair/image/undercut/undercut_style_10.webp'
      },
      'Classic Pompadour': {
        description: 'Volume on top with shorter sides creates height and balances your features.',
        image: 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Fade-Pompadour.webp?v=1754905431'
      },
      'Textured Crop': {
        description: 'Modern textured layers add dimension and movement to your look.',
        image: 'https://frenchcrop.co.uk/wp-content/uploads/2025/07/short-textured-french-crop-350x350.png'
      },
      'Side Part': {
        description: 'Clean and professional with a defined part that adds structure.',
        image: 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Skin-Fade-Side-Part.webp?v=1756752180'
      },
      'Modern Quiff': {
        description: 'Volume at the front swept upward creates a stylish, contemporary look.',
        image: 'https://cdn.shopify.com/s/files/1/0899/2676/2789/files/Quiff_Haircut.jpg?v=1746561695'
      },
      'Crew Cut': {
        description: 'Short on sides, slightly longer on top - classic and low maintenance.',
        image: 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Spiky-Crew-Cut.webp?v=1755505078'
      },
      'French Crop': {
        description: 'Short fringe with tapered sides - a trending European style.',
        image: 'https://skinfadebarbers.com/wp-content/uploads/2025/09/Asymmetrical-French-Crop-Fade-768x512.webp'
      },
      'Slick Back': {
        description: 'Sleek and sophisticated, perfect for formal occasions.',
        image: 'https://groomingrelentless.com/wp-content/uploads/2025/06/Short-Slick-Back.webp'
      },
      'Buzz Cut': {
        description: 'Ultra-short all over for a clean, masculine look.',
        image: 'https://i.pinimg.com/736x/d6/6b/d3/d66bd3bfb8d61559aa373494e8152e89.jpg'
      }
    }
    
    styles.forEach((style, index) => {
      const data = styleData[style]
      recs.push({
        name: style,
        description: data?.description || 'A stylish choice for your face shape.',
        matchPercentage: 95 - (index * 5),
        imageUrl: data?.image || 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Taper_Fade_Blonde.png?v=1748453009'
      })
    })
    
    return recs
  }

  const resetForm = () => {
    setStep(1)
    setResults(null)
    setFormData({
      faceShape: '',
      hairType: '',
      hairTexture: '',
      hairLength: '',
      lifestyle: '',
    })
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
      <div className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">AI Style Finder</span>
              <h1 className="text-3xl font-bold">Find Your Perfect Look</h1>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-500">Step {results ? 'Complete' : `${step} of 4`}</span>
              <div className="text-xl font-bold text-primary">{results ? '100%' : `${(step / 4) * 100}%`} Complete</div>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: results ? '100%' : `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Section */}
          <aside className="lg:col-span-4 space-y-8">
            {!results ? (
              <section className="bg-background/50 rounded-xl border border-slate-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">{step}</span>
                  <h3 className="font-bold">
                    {step === 1 && 'Face Shape'}
                    {step === 2 && 'Hair Type'}
                    {step === 3 && 'Hair Texture'}
                    {step === 4 && 'Current Length'}
                  </h3>
                </div>

                {/* Step 1: Face Shape */}
                {step === 1 && (
                  <div className="space-y-3">
                    {faceShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setFormData({ ...formData, faceShape: shape.id })}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          formData.faceShape === shape.id
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{shape.icon}</span>
                          <div>
                            <div className="font-bold">{shape.name}</div>
                            <div className="text-xs text-slate-500">{shape.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Hair Type */}
                {step === 2 && (
                  <div className="space-y-3">
                    {hairTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, hairType: type.id })}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          formData.hairType === type.id
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold">{type.name}</div>
                        <div className="text-xs text-slate-500">{type.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3: Hair Texture */}
                {step === 3 && (
                  <div className="space-y-3">
                    {hairTextures.map((texture) => (
                      <button
                        key={texture.id}
                        onClick={() => setFormData({ ...formData, hairTexture: texture.id })}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          formData.hairTexture === texture.id
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold">{texture.name}</div>
                        <div className="text-xs text-slate-500">{texture.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4: Hair Length */}
                {step === 4 && (
                  <div className="space-y-3">
                    {hairLengths.map((length) => (
                      <button
                        key={length.id}
                        onClick={() => setFormData({ ...formData, hairLength: length.id })}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          formData.hairLength === length.id
                            ? 'border-primary bg-primary/10'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="font-bold">{length.name}</div>
                        <div className="text-xs text-slate-500">{length.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className="flex-1 py-3 rounded-lg border border-slate-800 font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      disabled={
                        (step === 1 && !formData.faceShape) ||
                        (step === 2 && !formData.hairType) ||
                        (step === 3 && !formData.hairTexture)
                      }
                      className="flex-1 py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleAnalyze}
                      disabled={!formData.hairLength || analyzing}
                      className="flex-1 py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {analyzing ? 'Analyzing...' : 'Get Recommendations'}
                    </button>
                  )}
                </div>
              </section>
            ) : (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">✓</span>
                  <h3 className="font-bold">Your Profile</h3>
                </div>
                <div className="p-4 rounded-xl border border-primary bg-primary/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm"><strong>Face:</strong> {faceShapes.find(s => s.id === formData.faceShape)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm"><strong>Hair:</strong> {hairTypes.find(t => t.id === formData.hairType)?.name}, {hairTextures.find(t => t.id === formData.hairTexture)?.name}</span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-full mt-4 py-2 rounded-lg border border-primary/50 text-primary text-sm font-bold hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Start Over
                  </button>
                </div>
              </section>
            )}
          </aside>

          {/* Results Section */}
          <div className="lg:col-span-8">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-2xl">
                <Sparkles className="w-16 h-16 text-slate-800 mb-4" />
                <h2 className="text-xl font-bold text-slate-500">Complete the steps to see AI suggestions</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-sm">Answer a few questions about your face shape and hair type, and our AI will recommend the best hairstyles for you.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-primary" />
                    AI Suggestions
                  </h2>
                  <p className="text-sm text-slate-500">Based on your {results.faceShape} shape</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="group overflow-hidden rounded-xl border border-slate-800 bg-background/50 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          src={rec.imageUrl || 'https://cdn.shopify.com/s/files/1/0029/0868/4397/files/Taper_Fade_Blonde.png?v=1748453009'}
                          alt={rec.name}
                          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${rec.name}/400/400`; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold">{rec.name}</h3>
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">{rec.matchPercentage}% Match</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="flex gap-2">
                          <Link 
                            href={`/booking?service=${rec.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex-1 bg-primary text-background font-bold py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-all text-center"
                          >
                            Book This Style
                          </Link>
                          <button className="p-2.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all">
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stylist Tip */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-primary flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-background" />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">Stylist Tip</h4>
                      <p className="text-sm text-slate-300 italic">
                        "With an {results.faceShape} face shape, you have great versatility. Focus on styles that showcase your natural symmetry and complement your unique features."
                      </p>
                      <p className="mt-2 text-xs font-bold uppercase text-slate-500 tracking-wider">— AI Grooming Expert</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold mb-8">Previous Uploads</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 cursor-pointer">
                  <img src={item.image_url} alt="History" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                    <span className="text-xs font-bold text-primary uppercase">{item.face_shape}</span>
                    <span className="text-[10px] text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
