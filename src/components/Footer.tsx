import Link from 'next/link'
import { Scale } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Scale className="w-4 h-4 text-white" />
              <span className="text-base font-semibold tracking-tight">Atorni</span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Connecting people with qualified legal professionals. Quality legal help made accessible.
            </p>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">For Clients</h4>
            <ul className="space-y-3">
              {[
                { href: '/lawyers', label: 'Find a Lawyer' },
                { href: '/advice', label: 'Free Legal Advice' },
                { href: '/auth/register', label: 'Create Account' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Lawyers */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">For Lawyers</h4>
            <ul className="space-y-3">
              {[
                { href: '/auth/register?role=lawyer', label: 'Join as a Lawyer' },
                { href: '/lawyer/setup', label: 'Set Up Profile' },
                { href: '/lawyer/availability', label: 'Manage Availability' },
                { href: '/lawyer/dashboard', label: 'Dashboard' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Privacy Policy', 'Terms of Service', 'Contact'].map((label) => (
                <li key={label}>
                  <Link href="#" className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 text-xs">
            &copy; {new Date().getFullYear()} Atorni. All rights reserved.
          </p>
          <p className="text-zinc-600 text-xs text-center">
            Atorni does not provide legal advice. Information is for general purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
