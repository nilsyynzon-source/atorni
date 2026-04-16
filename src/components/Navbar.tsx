'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { getInitials } from '@/lib/utils'
import { Scale, Menu, X, ChevronDown, LogOut, LayoutDashboard, User } from 'lucide-react'

interface NavbarProps {
  user: Profile | null
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfileOpen(false)
    router.push('/')
    router.refresh()
  }

  const isLawyer = user?.role === 'lawyer'
  const dashboardPath = isLawyer ? '/lawyer/dashboard' : '/dashboard'

  const navLinks = [
    { href: '/lawyers', label: 'Find a Lawyer' },
    { href: '/advice', label: 'Free Advice' },
  ]

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Scale className="w-5 h-5 text-zinc-950" />
            <span className="text-lg font-semibold tracking-tight text-zinc-950">Atorni</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? 'text-zinc-950 font-medium'
                    : 'text-zinc-500 hover:text-zinc-950'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-950 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-medium text-xs border border-zinc-200">
                    {getInitials(user.full_name)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-zinc-100">
                      <p className="text-xs font-medium text-zinc-900 truncate">{user.full_name || user.email}</p>
                      <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href={dashboardPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                    {isLawyer && (
                      <Link
                        href="/lawyer/setup"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        <User className="w-3.5 h-3.5" />
                        Edit Profile
                      </Link>
                    )}
                    <div className="border-t border-zinc-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary py-2 px-4"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-zinc-500 hover:text-zinc-950"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-zinc-600 hover:text-zinc-950"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-zinc-100 mt-3 space-y-2">
            {user ? (
              <>
                <Link
                  href={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2 text-sm text-zinc-700"
                >
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="block text-sm text-red-600 py-2">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-zinc-700">
                  Sign in
                </Link>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="btn-primary block text-center py-2.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
