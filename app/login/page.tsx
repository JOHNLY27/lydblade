'use client'

import { useState } from 'react'
import { signUpWithRole, type UserRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Scissors, Mail, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signUpWithRole(email, password, role)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      alert('Check your email for the confirmation link!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8 p-8 rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-md shadow-2xl">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <Scissors className="w-8 h-8 text-background" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome to AI Stylist</h2>
          <p className="text-slate-500">Sign in to get your perfect haircut recommendation</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Sign up as</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="text-primary"
                />
                <span className="text-sm">Customer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="text-primary"
                />
                <span className="text-sm">Admin</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-primary text-background font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full py-3 rounded-lg border border-primary/20 text-primary font-bold hover:bg-primary/10 transition-all"
            >
              Create Account
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
