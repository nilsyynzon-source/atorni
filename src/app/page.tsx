import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LawyerCard from '@/components/LawyerCard'
import { LawyerProfile } from '@/types'
import { LEGAL_SPECIALIZATIONS } from '@/types'
import { ArrowRight, CheckCircle, Scale } from 'lucide-react'

export default async function Home() {
  const supabase = createClient()

  const { data: featuredLawyers } = await supabase
    .from('lawyer_profiles')
    .select('*, profile:profiles(*)')
    .eq('is_accepting_clients', true)
    .limit(3)

  return (
    <div className="bg-white">

      {/* ─── Hero ─── */}
      <section className="bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="max-w-3xl">
            <p className="text-zinc-400 text-sm tracking-widest uppercase mb-6">
              Legal services platform
            </p>
            <h1 className="text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight mb-8">
              Legal help,<br />
              <span className="text-zinc-400">made simple.</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-xl">
              Connect with verified lawyers, get free legal advice, and book paid consultations — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/lawyers"
                className="inline-flex items-center justify-center gap-2 bg-white text-zinc-950 font-medium px-8 py-4 rounded-lg hover:bg-zinc-100 transition-colors text-sm tracking-wide"
              >
                Find a Lawyer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/register?role=lawyer"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white font-medium px-8 py-4 rounded-lg border border-zinc-700 hover:border-zinc-500 transition-colors text-sm tracking-wide"
              >
                Join as a Lawyer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-100">
            {[
              { value: '500+', label: 'Verified Lawyers' },
              { value: '10k+', label: 'Sessions Booked' },
              { value: '15+', label: 'Practice Areas' },
              { value: '4.9', label: 'Average Rating' },
            ].map((stat) => (
              <div key={stat.label} className="py-10 px-8 text-center">
                <div className="text-3xl font-semibold tracking-tight text-zinc-950">{stat.value}</div>
                <div className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mb-16">
            <h2 className="section-title">How it works</h2>
            <p className="section-subtitle">Three steps to expert legal help.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
            {[
              {
                step: '01',
                title: 'Find your lawyer',
                desc: 'Browse verified lawyers by specialty, location, or language. Compare profiles and rates.',
              },
              {
                step: '02',
                title: 'Book a session',
                desc: "Choose from the lawyer's available time slots. Pay securely online.",
              },
              {
                step: '03',
                title: 'Get legal help',
                desc: 'Meet your lawyer for a confidential consultation tailored to your situation.',
              },
            ].map((item) => (
              <div key={item.step} className="bg-white p-10">
                <div className="text-xs text-zinc-400 font-medium tracking-widest uppercase mb-6">{item.step}</div>
                <h3 className="text-lg font-semibold text-zinc-950 mb-3">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Practice Areas ─── */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mb-14">
            <h2 className="section-title">Practice areas</h2>
            <p className="section-subtitle">Find experts across all areas of law.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {LEGAL_SPECIALIZATIONS.map((spec) => (
              <Link
                key={spec}
                href={`/lawyers?specialization=${encodeURIComponent(spec)}`}
                className="bg-white hover:bg-zinc-950 hover:text-white border border-zinc-200 hover:border-zinc-950 rounded-lg p-4 text-center text-xs font-medium text-zinc-600 transition-all group"
              >
                {spec}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Lawyers ─── */}
      {featuredLawyers && featuredLawyers.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="section-title">Featured lawyers</h2>
                <p className="section-subtitle">Verified attorneys ready to help you.</p>
              </div>
              <Link
                href="/lawyers"
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {(featuredLawyers as LawyerProfile[]).map((lawyer) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Free Advice ─── */}
      <section className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-widest mb-4">Community Q&amp;A</p>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-950 mb-4">
                Free legal advice from real lawyers
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed mb-8">
                Ask any legal question and get answers from verified attorneys. Completely free, no commitment.
              </p>
              <div className="flex gap-3">
                <Link href="/advice" className="btn-primary py-3 px-6">
                  Browse Questions
                </Link>
                <Link href="/advice/new" className="btn-secondary py-3 px-6">
                  Ask a Question
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { q: 'Can my landlord enter without notice?', a: 3, tag: 'Real Estate' },
                { q: 'What are my rights if I was wrongfully terminated?', a: 5, tag: 'Employment' },
                { q: 'How do I contest a will?', a: 2, tag: 'Estate Planning' },
              ].map((item) => (
                <div key={item.q} className="bg-white border border-zinc-100 rounded-xl p-5">
                  <span className="text-xs text-zinc-400 uppercase tracking-widest">{item.tag}</span>
                  <p className="text-sm font-medium text-zinc-900 mt-2 mb-2">{item.q}</p>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <CheckCircle className="w-3 h-3 text-zinc-400" />
                    {item.a} lawyer {item.a === 1 ? 'answer' : 'answers'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── For Lawyers ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-zinc-950 rounded-2xl p-12 md:p-16 text-white">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Scale className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs text-zinc-400 uppercase tracking-widest">For Attorneys</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                  Grow your practice online
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed mb-8">
                  Create a profile, set your availability, and start accepting paid bookings. No monthly fees — just results.
                </p>
                <Link
                  href="/auth/register?role=lawyer"
                  className="inline-flex items-center gap-2 bg-white text-zinc-950 font-medium px-6 py-3 rounded-lg hover:bg-zinc-100 transition-colors text-sm tracking-wide"
                >
                  Join as a Lawyer
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Online presence',
                  'Flexible scheduling',
                  'Secure payments',
                  'Client Q&A',
                  'No monthly fees',
                  'Verified badge',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 bg-zinc-900 rounded-lg px-4 py-3">
                    <CheckCircle className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="text-xs text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
