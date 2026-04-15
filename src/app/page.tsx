import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LawyerCard from '@/components/LawyerCard'
import { LawyerProfile } from '@/types'
import { LEGAL_SPECIALIZATIONS } from '@/types'
import {
  Scale,
  Search,
  Calendar,
  Shield,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const { data: featuredLawyers } = await supabase
    .from('lawyer_profiles')
    .select('*, profile:profiles(*)')
    .eq('is_accepting_clients', true)
    .limit(3)

  return (
    <div className="bg-white">
      {/* ─── Hero ─── */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium">Trusted Legal Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Quality Legal Help,{' '}
              <span className="text-amber-400">Made Accessible</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-10 max-w-2xl">
              Connect with verified lawyers, get free legal advice from the community, and book paid
              consultations — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/lawyers"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-900 font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                <Search className="w-5 h-5" />
                Find a Lawyer
              </Link>
              <Link
                href="/auth/register?role=lawyer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
              >
                Join as a Lawyer
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '500+', label: 'Verified Lawyers' },
              { value: '10k+', label: 'Sessions Booked' },
              { value: '15+', label: 'Practice Areas' },
              { value: '4.9★', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-sm text-blue-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Atorni Works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Get the legal help you need in three simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                step: '01',
                title: 'Find Your Lawyer',
                desc: 'Browse verified lawyers by specialty, location, or language. Read profiles and compare rates.',
              },
              {
                icon: Calendar,
                step: '02',
                title: 'Book a Session',
                desc: 'Choose an available time slot from the lawyer\'s calendar. Pay securely online with Stripe.',
              },
              {
                icon: Shield,
                step: '03',
                title: 'Get Legal Help',
                desc: 'Meet with your lawyer for a confidential consultation. Get expert advice tailored to your situation.',
              },
            ].map((item) => (
              <div key={item.step} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="absolute -top-4 left-8">
                  <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {item.step}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 mt-2">
                  <item.icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Practice Areas ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Practice Areas</h2>
            <p className="text-gray-500 text-lg">Find experts across all areas of law.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {LEGAL_SPECIALIZATIONS.map((spec) => (
              <Link
                key={spec}
                href={`/lawyers?specialization=${encodeURIComponent(spec)}`}
                className="bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-4 text-center text-sm font-medium text-gray-700 hover:text-blue-700 transition-all"
              >
                {spec}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Lawyers ─── */}
      {featuredLawyers && featuredLawyers.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Lawyers</h2>
                <p className="text-gray-500 mt-1">Highly rated attorneys ready to help you</p>
              </div>
              <Link
                href="/lawyers"
                className="flex items-center gap-2 text-blue-700 font-medium hover:text-blue-900 transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {(featuredLawyers as LawyerProfile[]).map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Free Advice ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-10 md:p-16 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-5 text-sm font-medium">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Community Q&A
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Free Legal Advice from Real Lawyers
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-8">
                  Ask any legal question and get answers from verified attorneys. Completely free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/advice"
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-blue-900 font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Browse Questions
                  </Link>
                  <Link
                    href="/advice/new"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Ask a Question
                  </Link>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { q: 'Can my landlord enter without notice?', a: '3 answers', tag: 'Real Estate' },
                  { q: 'What are my rights if I was wrongfully terminated?', a: '5 answers', tag: 'Employment' },
                  { q: 'How do I contest a will?', a: '2 answers', tag: 'Estate Planning' },
                ].map((item) => (
                  <div key={item.q} className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{item.tag}</span>
                    <p className="text-sm font-medium mt-2 mb-1">{item.q}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-200">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {item.a} from lawyers
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Lawyers CTA ─── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-blue-700" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Are You a Lawyer?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto">
            Join Atorni to grow your practice. Create a profile, set your availability, and start
            accepting paid bookings — no monthly fees, just success-based commissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[
              'Build your online presence',
              'Flexible scheduling',
              'Secure online payments',
              'Answer free Q&A to attract clients',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/auth/register?role=lawyer"
              className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold px-10 py-4 rounded-xl transition-colors text-lg"
            >
              Join as a Lawyer
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Trust signals ─── */}
      <section className="py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: Shield,
                title: 'Verified Attorneys',
                desc: 'All lawyers are verified by bar number and credentials before going live.',
              },
              {
                icon: Star,
                title: 'Secure Payments',
                desc: 'All transactions are processed securely through Stripe with full buyer protection.',
              },
              {
                icon: MessageSquare,
                title: 'Confidential',
                desc: 'All consultations are private and protected under attorney-client privilege.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
