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

  // Try to get role from user metadata first (set during signup, no extra query needed)
  const metadataRole = user.user_metadata?.role
  if (metadataRole && (metadataRole === 'admin' || metadataRole === 'customer')) {
    return {
      id: user.id,
      email: user.email!,
      role: metadataRole as UserRole
    }
  }

  // Fallback: query profiles table only if metadata doesn't have the role
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
