'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Scale, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('Welcome back!')
    router.push(redirectTo)
    router.refresh()
  }

  return (
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
          <h1 className="text-2xl font-semibold text-zinc-950 mt-6 tracking-tight">Welcome back</h1>
          <p className="text-zinc-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <Suspense fallback={<div className="h-48 animate-pulse bg-zinc-50 rounded-xl" />}>
          <LoginForm />
        </Suspense>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-zinc-950 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
