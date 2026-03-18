'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, type UserWithRole } from '@/lib/auth'
import { 
  Sparkles, 
  Upload, 
  Loader2, 
  Lightbulb,
  User,
  Bookmark
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { analyzeFaceAndRecommend } from '@/utils/gemini'

export default function Dashboard() {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!image || !user) return
    setUploading(true)

    try {
      // 1. Upload to Supabase Storage
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Math.random()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lydblade')
        .upload(fileName, image)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('lydblade')
        .getPublicUrl(fileName)

      // 2. Convert image to base64 for Gemini
      const reader = new FileReader()
      reader.readAsDataURL(image)
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1]

        // 3. AI Analysis
        const aiResult = await analyzeFaceAndRecommend(base64Data)
        setResults(aiResult)

        // 4. Save to Database
        console.log('Saving upload for user:', user.id)
        const { data: dbUpload, error: dbError } = await supabase
          .from('uploads')
          .insert({
            user_id: user.id,
            image_url: publicUrl,
            face_shape: aiResult.faceShape
          })
          .select()
          .single()

        if (dbError) {
          console.error('Database error:', dbError)
          throw new Error(`Database error: ${dbError.message}`)
        }

        const recommendations = aiResult.recommendations.map((rec: any) => ({
          upload_id: dbUpload.id,
          hairstyle_name: rec.name,
          description: rec.description,
          match_percentage: rec.matchPercentage,
          preview_url: `https://picsum.photos/seed/${rec.name}/400/400`
        }))

        await supabase.from('recommendations').insert(recommendations)
        
        fetchHistory(user.id)
        setUploading(false)
      }
    } catch (error: any) {
      console.error('Full error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`Error: ${error?.message || error?.error_description || 'Failed to process image. Check console (F12) for details.'}`)
      setUploading(false)
    }
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
              <span className="text-xs font-bold uppercase tracking-widest text-primary mb-1 block">Style Finder</span>
              <h1 className="text-3xl font-bold">Find Your Perfect Look</h1>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-slate-500">Step 1 of 3</span>
              <div className="text-xl font-bold text-primary">33% Complete</div>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: results ? '100%' : '33.33%' }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Upload Section */}
          <aside className="lg:col-span-4 space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">1</span>
                <h3 className="font-bold">Upload Selfie</h3>
              </div>
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl border-2 border-dashed border-slate-800 hover:border-primary/50 transition-all overflow-hidden flex flex-col items-center justify-center p-4 text-center cursor-pointer group">
                  {preview ? (
                    <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-slate-500 group-hover:text-primary transition-colors mb-2" />
                      <p className="text-sm text-slate-500">Click to upload your photo</p>
                    </>
                  )}
                  <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={!image || uploading}
                  className="w-full py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze My Face'}
                </button>
              </div>
            </section>

            {results && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">2</span>
                  <h3 className="font-bold">Face Shape</h3>
                </div>
                <div className="p-4 rounded-xl border border-primary bg-primary/10 flex flex-col items-center gap-2">
                  <User className="w-10 h-10 text-primary" />
                  <span className="text-lg font-bold capitalize">{results.faceShape}</span>
                </div>
              </section>
            )}
          </aside>

          {/* Results Section */}
          <div className="lg:col-span-8">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-800 rounded-2xl">
                <Sparkles className="w-16 h-16 text-slate-800 mb-4" />
                <h2 className="text-xl font-bold text-slate-500">Upload a photo to see AI suggestions</h2>
                <p className="text-sm text-slate-600 mt-2 max-w-sm">Our AI will analyze your facial features and recommend the best hairstyles for your face shape.</p>
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
                          src={rec.imageUrl || `https://picsum.photos/seed/${rec.name}/400/400`} 
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
                          <button className="flex-1 bg-primary text-background font-bold py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-all">Book This Style</button>
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
