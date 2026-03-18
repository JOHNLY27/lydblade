import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'customer'

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
}

// Client-side: Get current user with role
export async function getClientUser(): Promise<UserWithRole | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return {
    id: user.id,
    email: user.email!,
    role: profile?.role || 'customer'
  }
}

// Check if user is admin
export function isAdmin(user: UserWithRole | null): boolean {
  return user?.role === 'admin'
}

// Sign up with role
export async function signUpWithRole(
  email: string, 
  password: string, 
  role: UserRole = 'customer'
) {
  const supabase = createClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { role }
    }
  })
}
