'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Scale, Eye, EyeOff, UserCheck, Briefcase, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

function RegisterForm() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as UserRole) || 'client'

  const [role, setRole] = useState<UserRole>(initialRole)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)

    const redirectTo = role === 'lawyer' ? '/lawyer/setup' : '/dashboard'
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // If session is present, email confirmation is disabled — log in immediately
    if (data.session) {
      toast.success('Account created!')
      router.push(redirectTo)
      router.refresh()
      return
    }

    // No session means email confirmation is required
    setEmailSent(true)
    setLoading(false)
  }

  // Email confirmation sent state
  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-zinc-600" />
        </div>
        <h2 className="text-lg font-semibold text-zinc-950 mb-2">Check your email</h2>
        <p className="text-zinc-500 text-sm leading-relaxed mb-4">
          We sent a confirmation link to{' '}
          <strong className="text-zinc-700">{email}</strong>.
          Click it to activate your account.
        </p>
        <p className="text-xs text-zinc-400 mb-6">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            onClick={() => setEmailSent(false)}
            className="underline text-zinc-600 hover:text-zinc-950"
          >
            try again
          </button>
          .
        </p>
        <Link href="/auth/login" className="btn-primary block text-center">
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole('client')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
            role === 'client'
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
          )}
        >
          <UserCheck className="w-6 h-6" />
          <span className="text-sm font-semibold">I need a lawyer</span>
          <span className={cn('text-xs', role === 'client' ? 'text-zinc-300' : 'text-zinc-400')}>Find &amp; book consultations</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('lawyer')}
          className={cn(
            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
            role === 'lawyer'
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
          )}
        >
          <Briefcase className="w-6 h-6" />
          <span className="text-sm font-semibold">I&apos;m a lawyer</span>
          <span className={cn('text-xs', role === 'lawyer' ? 'text-zinc-300' : 'text-zinc-400')}>Offer legal services</span>
        </button>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="label">Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="Jane Smith"
            required
            autoComplete="name"
          />
        </div>

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
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-center"
        >
          {loading
            ? 'Creating account…'
            : role === 'lawyer'
            ? 'Create lawyer account'
            : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-xs text-zinc-400 text-center">
        By creating an account you agree to our{' '}
        <Link href="#" className="underline">Terms of Service</Link> and{' '}
        <Link href="#" className="underline">Privacy Policy</Link>.
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl border border-zinc-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-zinc-950" />
            <span className="text-xl font-semibold tracking-tight text-zinc-950">Atorni</span>
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-950 mt-6 tracking-tight">Create your account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join thousands of people using Atorni</p>
        </div>

        <Suspense fallback={<div className="h-64 animate-pulse bg-zinc-50 rounded-xl" />}>
          <RegisterForm />
        </Suspense>

        <div className="mt-6 text-center border-t border-zinc-100 pt-6">
          <p className="text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-zinc-950 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
