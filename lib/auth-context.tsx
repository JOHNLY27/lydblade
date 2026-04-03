'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserWithRole } from '@/lib/auth'

type AuthContextType = {
  user: UserWithRole | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial auth check
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const role = authUser.user_metadata?.role
        setUser({
          id: authUser.id,
          email: authUser.email!,
          role: (role === 'admin' || role === 'customer') ? role : 'customer'
        })
      }
      setLoading(false)
    }
    init()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const role = session.user.user_metadata?.role
        setUser({
          id: session.user.id,
          email: session.user.email!,
          role: (role === 'admin' || role === 'customer') ? role : 'customer'
        })
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
