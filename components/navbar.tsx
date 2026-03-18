'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scissors, Menu, X, User, LogOut, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getClientUser, isAdmin, type UserWithRole } from '@/lib/auth'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getClientUser()
      setUser(currentUser)
      setLoading(false)
    }
    checkUser()
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/booking', label: 'Book Now' },
    { href: '/dashboard', label: 'AI Suggest' },
    ...(user && isAdmin(user) ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  const isActive = (href: string) => pathname === href

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
            <Scissors className="w-7 h-7" />
            <span className="text-xl font-bold tracking-tight">Blade & AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {user.email[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-300 max-w-[120px] truncate">
                        {user.email}
                      </span>
                      {isAdmin(user) && (
                        <Shield className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-background font-bold text-sm hover:bg-primary/90 transition-all"
                  >
                    <User className="w-4 h-4" />
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/10 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-400 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {!loading && (
                <>
                  {user ? (
                    <>
                      <div className="px-4 py-3 flex items-center gap-2 text-slate-400">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {user.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{user.email}</span>
                        {isAdmin(user) && <Shield className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-lg bg-primary text-background font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Login / Signup
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
