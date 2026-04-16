import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Determine where to redirect based on user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      // If 'next' was provided (from emailRedirectTo), use it
      // Otherwise, redirect based on role
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }

      if (profile?.role === 'lawyer') {
        return NextResponse.redirect(`${origin}/lawyer/dashboard`)
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
