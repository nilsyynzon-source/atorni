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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xl font-bold text-blue-900">Atorni</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-blue-700'
                    : 'text-gray-600 hover:text-blue-700'
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
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-900 font-semibold text-xs">
                    {getInitials(user.full_name)}
                  </div>
                  <span className="max-w-[120px] truncate">{user.full_name || user.email}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href={dashboardPath}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {isLawyer && (
                      <Link
                        href="/lawyer/setup"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />
                        Edit Profile
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-blue-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-700 hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          {user ? (
            <>
              <Link
                href={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-blue-700"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="block text-sm font-medium text-red-600 hover:text-red-700"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-gray-700 hover:text-blue-700"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="block bg-blue-900 text-white text-sm font-medium px-4 py-2 rounded-lg text-center"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
