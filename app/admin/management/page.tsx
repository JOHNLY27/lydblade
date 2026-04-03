'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, isAdmin, type UserWithRole } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, Scissors, Plus, Trash2, ArrowLeft, Upload, ImageIcon, X, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ManagementDashboard() {
  const [loading, setLoading] = useState(true)
  const [barbers, setBarbers] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])

  const [newBarber, setNewBarber] = useState({ name: '', specialty: '', experience: '', image: '' })
  const [newService, setNewService] = useState({ name: '', price: '', duration: '', category: 'Haircuts', image_url: '' })

  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    await fetchData()
    setLoading(false)
  }

  const fetchData = async () => {
    const { data: bData } = await supabase.from('barbers').select('*').order('created_at', { ascending: true })
    const { data: sData } = await supabase.from('services').select('*').order('created_at', { ascending: true })
    if (bData) setBarbers(bData)
    if (sData) setServices(sData)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, GIF)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImageSelection = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return '/barbers/default.png'

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const res = await fetch('/api/upload-barber-image', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      return data.url
    } catch (err: any) {
      console.error('Upload error:', err)
      alert('Failed to upload image: ' + err.message)
      return '/barbers/default.png'
    } finally {
      setUploading(false)
    }
  }

  const handleAddBarber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBarber.name) return

    // Upload the image first if a file is selected
    const imageUrl = await uploadImage()

    const { error } = await supabase.from('barbers').insert([{ 
      name: newBarber.name, 
      specialty: newBarber.specialty, 
      experience: newBarber.experience, 
      image: imageUrl 
    }])
    if (!error) {
      setNewBarber({ name: '', specialty: '', experience: '', image: '' })
      clearImageSelection()
      fetchData()
    } else {
      alert("Failed to add barber. Did you run the Supabase SQL setup?")
    }
  }

  const handleDeleteBarber = async (id: string) => {
    await supabase.from('barbers').delete().eq('id', id)
    fetchData()
  }

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newService.name) return

    // Build base service data
    const serviceData: any = {
      name: newService.name,
      price: newService.price,
      duration: newService.duration,
      category: newService.category,
    }

    // Try with image_url first
    if (newService.image_url) {
      serviceData.image_url = newService.image_url
    }

    let { error } = await supabase.from('services').insert([serviceData])

    // If it fails because image_url column doesn't exist, retry without it
    if (error && error.message?.includes('image_url')) {
      delete serviceData.image_url
      const retry = await supabase.from('services').insert([serviceData])
      error = retry.error
    }

    if (!error) {
      setNewService({ name: '', price: '', duration: '', category: 'Haircuts', image_url: '' })
      fetchData()
    } else {
      alert("Failed to add service: " + error.message)
    }
  }

  const handleDeleteService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id)
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-xl border border-primary/20 hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Data Management</h1>
            <p className="text-slate-500">Add or remove barbers and services directly from the database.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BARBER MANAGEMENT */}
          <div className="bg-background/50 border border-slate-800 rounded-3xl overflow-hidden p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-primary" />
              Manage Barbers
            </h2>
            
            <form onSubmit={handleAddBarber} className="space-y-4 rounded-xl border border-slate-800 p-4 bg-slate-900/50">
              <p className="text-sm font-bold text-primary mb-2">Add New Barber</p>
              <input type="text" placeholder="Barber Name (e.g. John Doe)" value={newBarber.name} onChange={e => setNewBarber({...newBarber, name: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" required />
              <input type="text" placeholder="Specialty (e.g. Fades & Undercuts)" value={newBarber.specialty} onChange={e => setNewBarber({...newBarber, specialty: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" required />
              <input type="text" placeholder="Experience (e.g. 5 years)" value={newBarber.experience} onChange={e => setNewBarber({...newBarber, experience: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" required />
              
              {/* Image Upload Area */}
              <div className="space-y-2">
                <p className="text-xs text-slate-400 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Barber Photo</p>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/png,image/jpeg,image/webp,image/gif" 
                  onChange={handleFileSelect}
                  className="hidden" 
                  id="barber-image-upload"
                />
                
                {imagePreview ? (
                  <div className="relative group">
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-primary/30 bg-black/30">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          type="button" 
                          onClick={clearImageSelection} 
                          className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-primary/60 mt-1 truncate">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-slate-700 hover:border-primary/50 rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-primary/5 cursor-pointer group"
                  >
                    <Upload className="w-8 h-8 text-slate-600 group-hover:text-primary/60 transition-colors" />
                    <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Click to choose photo from gallery</span>
                    <span className="text-xs text-slate-600">PNG, JPG, WEBP, GIF • Max 5MB</span>
                  </button>
                )}
              </div>
              
              <button type="submit" disabled={uploading} className="w-full py-2 bg-primary text-background font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add Barber</>
                )}
              </button>
            </form>

            <div className="space-y-3">
              {barbers.length === 0 ? <p className="text-sm text-slate-500 text-center">No barbers listed.</p> : barbers.map(barber => (
                <div key={barber.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-800 rounded-xl bg-black/20">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                      <img 
                        src={barber.image || '/barbers/default.png'} 
                        alt={barber.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/barbers/default.png' }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{barber.name}</p>
                      <p className="text-xs text-slate-500">{barber.specialty} • {barber.experience}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteBarber(barber.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg mt-2 sm:mt-0 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICE MANAGEMENT */}
          <div className="bg-background/50 border border-slate-800 rounded-3xl overflow-hidden p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Scissors className="w-6 h-6 text-primary" />
              Manage Services
            </h2>

             <form onSubmit={handleAddService} className="space-y-4 rounded-xl border border-slate-800 p-4 bg-slate-900/50">
              <p className="text-sm font-bold text-primary mb-2">Add New Service</p>
              <input type="text" placeholder="Service Name (e.g. Skin Fade)" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Price (e.g. ₱350)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" required />
                <input type="text" placeholder="Duration (e.g. 45 min)" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" required />
              </div>
              <input type="text" placeholder="Category (e.g. Haircuts)" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})} className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" />
              
              {/* Image URL input for service */}
              <div className="space-y-1">
                <p className="text-xs text-slate-400 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Haircut Image URL (optional)</p>
                <input 
                  type="url" 
                  placeholder="https://example.com/haircut-photo.jpg" 
                  value={newService.image_url} 
                  onChange={e => setNewService({...newService, image_url: e.target.value})} 
                  className="w-full bg-black/20 border border-slate-800 rounded-lg px-4 py-2" 
                />
                {newService.image_url && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-700 mt-2">
                    <img 
                      src={newService.image_url} 
                      alt="Service preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = 'block' }}
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="w-full py-2 bg-primary text-background font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </form>

            <div className="space-y-3">
              {services.length === 0 ? <p className="text-sm text-slate-500 text-center">No services listed.</p> : services.map(service => (
                <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-800 rounded-xl bg-black/20">
                  <div className="flex items-center gap-3">
                    {service.image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                        <img 
                          src={service.image_url} 
                          alt={service.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg">{service.name} <span className="text-primary text-sm font-bold ml-2">{service.price}</span></p>
                      <p className="text-xs text-slate-500">{service.duration} • {service.category}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteService(service.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg mt-2 sm:mt-0 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
