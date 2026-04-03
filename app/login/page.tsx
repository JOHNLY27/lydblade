'use client'

import { useState } from 'react'
import { signUpWithRole, type UserRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/client'
import { Scissors, Mail, Lock, Loader2, ShieldCheck, User, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setRole('customer')
  }

  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab)
    resetForm()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check user role to decide where to redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await signUpWithRole(email, password, role)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSignupSuccess(true)
      setLoading(false)
    }
  }

  // Password match indicator
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-6 p-8 rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-md shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-400/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
            <p className="text-slate-500 text-sm">
              We've sent a confirmation link to <strong className="text-slate-300">{email}</strong>. 
              Please check your email and click the link to verify your account.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSignupSuccess(false)
                switchTab('signin')
              }}
              className="w-full py-3 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              Go to Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-primary transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6 p-8 rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Scissors className="w-7 h-7 text-background" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500">
            {activeTab === 'signin'
              ? 'Sign in to access your account'
              : 'Join us and get your perfect haircut recommendation'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-800/50 p-1">
          <button
            onClick={() => switchTab('signin')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'signin'
                ? 'bg-primary text-background shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('signup')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'signup'
                ? 'bg-primary text-background shadow-lg'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={activeTab === 'signin' ? handleLogin : handleSignup} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null) }}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {activeTab === 'signup' && password.length > 0 && password.length < 6 && (
              <p className="text-xs text-yellow-400">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Confirm Password - Only for Sign Up */}
          {activeTab === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border transition-all outline-none ${
                      passwordsMatch
                        ? 'border-emerald-400 focus:ring-1 focus:ring-emerald-400'
                        : passwordsMismatch
                        ? 'border-red-400 focus:ring-1 focus:ring-red-400'
                        : 'border-slate-800 focus:border-primary focus:ring-1 focus:ring-primary'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordsMatch && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Passwords match
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>


            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (activeTab === 'signup' && passwordsMismatch)}
            className="w-full py-3.5 rounded-xl bg-primary text-background font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : activeTab === 'signin' ? (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center space-y-3 pt-2">
          <p className="text-sm text-slate-500">
            {activeTab === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => switchTab('signup')}
                  className="text-primary font-medium hover:underline"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => switchTab('signin')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <Link href="/" className="text-sm text-slate-600 hover:text-primary transition-colors block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
