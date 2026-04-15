import Link from 'next/link'
import { Scale } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Scale className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xl font-bold">Atorni</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Connecting people with qualified legal professionals. Quality legal help made accessible.
            </p>
          </div>

          {/* For Clients */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Clients</h4>
            <ul className="space-y-2">
              {[
                { href: '/lawyers', label: 'Find a Lawyer' },
                { href: '/advice', label: 'Free Legal Advice' },
                { href: '/auth/register', label: 'Create Account' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-blue-200 text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Lawyers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Lawyers</h4>
            <ul className="space-y-2">
              {[
                { href: '/auth/register?role=lawyer', label: 'Join as a Lawyer' },
                { href: '/lawyer/setup', label: 'Set Up Profile' },
                { href: '/lawyer/availability', label: 'Manage Availability' },
                { href: '/lawyer/dashboard', label: 'Lawyer Dashboard' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-blue-200 text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { href: '#', label: 'About Us' },
                { href: '#', label: 'Privacy Policy' },
                { href: '#', label: 'Terms of Service' },
                { href: '#', label: 'Contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-blue-200 text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-blue-300 text-sm">
            &copy; {new Date().getFullYear()} Atorni. All rights reserved.
          </p>
          <p className="text-blue-400 text-xs text-center">
            Atorni does not provide legal advice. Information provided is for general purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
