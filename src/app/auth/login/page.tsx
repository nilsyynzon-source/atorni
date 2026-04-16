'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Scale, Eye, EyeOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const authError = searchParams.get('error')

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        toast.error('Please confirm your email before signing in. Check your inbox.')
      } else if (error.message.includes('Invalid login credentials')) {
        toast.error('Incorrect email or password.')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <>
      {authError && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            {authError === 'auth_callback_failed'
              ? 'The confirmation link has expired or is invalid. Please try signing in or register again.'
              : 'Authentication failed. Please try again.'}
          </p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-11"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full text-center">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-zinc-100">
        <p className="text-sm text-zinc-500 text-center mb-4">Don&apos;t have an account?</p>
        <Link
          href="/auth/register"
          className="btn-secondary w-full block text-center"
        >
          Create a free account
        </Link>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl border border-zinc-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-zinc-950" />
            <span className="text-xl font-semibold tracking-tight text-zinc-950">Atorni</span>
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-950 mt-6 tracking-tight">Sign in</h1>
          <p className="text-zinc-500 text-sm mt-1">Welcome back to Atorni</p>
        </div>

        <Suspense fallback={<div className="h-48 animate-pulse bg-zinc-50 rounded-xl" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
