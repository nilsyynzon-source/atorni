import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getInitials } from '@/lib/utils'
import {
  MapPin,
  CheckCircle,
  Briefcase,
  Languages,
  Globe,
  Linkedin,
  Phone,
  Calendar,
  ArrowLeft,
  Scale,
  CreditCard,
} from 'lucide-react'

export default async function LawyerProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const { data: lawyer } = await supabase
    .from('lawyer_profiles')
    .select('*, profile:profiles(*)')
    .eq('id', params.id)
    .single()

  if (!lawyer) notFound()

  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('lawyer_id', lawyer.id)
    .eq('is_booked', false)
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(5)

  const name = lawyer.profile?.full_name || 'Attorney'
  const initials = getInitials(name)
  const hasSlots = (slots?.length ?? 0) > 0

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Back nav */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all lawyers
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main profile */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 font-bold text-2xl flex-shrink-0 border border-zinc-200">
                  {lawyer.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lawyer.profile.avatar_url}
                      alt={name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">{name}</h1>
                    {lawyer.is_verified && (
                      <span className="flex items-center gap-1 text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    )}
                  </div>
                  {lawyer.location && (
                    <div className="flex items-center gap-1.5 mt-2 text-zinc-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      {lawyer.location}
                    </div>
                  )}
                  {lawyer.bar_number && (
                    <div className="flex items-center gap-1.5 mt-1 text-zinc-400 text-sm">
                      <Scale className="w-4 h-4" />
                      Bar No. {lawyer.bar_number}
                    </div>
                  )}
                </div>
              </div>

              {/* Specializations */}
              {lawyer.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {lawyer.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            {lawyer.bio && (
              <div className="bg-white rounded-xl border border-zinc-200 p-8">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4">About</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line text-sm">{lawyer.bio}</p>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl border border-zinc-200 p-8">
              <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-5">Details</h2>
              <dl className="grid sm:grid-cols-2 gap-5">
                {lawyer.years_experience && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400 uppercase tracking-wide">Experience</dt>
                      <dd className="font-medium text-zinc-900 text-sm mt-0.5">{lawyer.years_experience} years</dd>
                    </div>
                  </div>
                )}
                {lawyer.languages.length > 0 && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <Languages className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400 uppercase tracking-wide">Languages</dt>
                      <dd className="font-medium text-zinc-900 text-sm mt-0.5">{lawyer.languages.join(', ')}</dd>
                    </div>
                  </div>
                )}
                {lawyer.website && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400 uppercase tracking-wide">Website</dt>
                      <dd className="mt-0.5">
                        <a
                          href={lawyer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-950 font-medium hover:underline text-sm"
                        >
                          {lawyer.website.replace(/^https?:\/\//, '')}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {lawyer.linkedin_url && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <Linkedin className="w-3.5 h-3.5 text-zinc-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-400 uppercase tracking-wide">LinkedIn</dt>
                      <dd className="mt-0.5">
                        <a
                          href={lawyer.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-950 font-medium hover:underline text-sm"
                        >
                          View Profile
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Booking sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 sticky top-20">
              <div className="text-center mb-6">
                {lawyer.hourly_rate ? (
                  <>
                    <div className="text-3xl font-semibold tracking-tight text-zinc-950">
                      {formatCurrency(lawyer.hourly_rate)}
                    </div>
                    <div className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">per 1-hour session</div>
                  </>
                ) : (
                  <div className="text-zinc-500 text-sm">Rate upon consultation</div>
                )}
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CheckCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  {lawyer.is_accepting_clients ? 'Currently accepting clients' : 'Not accepting clients'}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  {hasSlots ? `${slots?.length} upcoming slots available` : 'No upcoming availability'}
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <CreditCard className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  Secure payment via Stripe
                </div>
              </div>

              {lawyer.is_accepting_clients && hasSlots ? (
                <Link
                  href={`/book/${lawyer.id}`}
                  className="btn-primary w-full block text-center"
                >
                  Book a Session
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-zinc-100 text-zinc-400 font-medium py-3 rounded-lg cursor-not-allowed text-sm"
                >
                  {lawyer.is_accepting_clients ? 'No availability' : 'Not available'}
                </button>
              )}

              {lawyer.phone && (
                <div className="mt-4 flex items-center gap-2 justify-center text-sm text-zinc-400">
                  <Phone className="w-4 h-4" />
                  <span>{lawyer.phone}</span>
                </div>
              )}
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5">
              <p className="text-xs text-zinc-500 leading-relaxed">
                <strong className="block mb-1 text-zinc-700">Disclaimer</strong>
                Information on this profile is for general purposes. Booking a session does not
                establish an attorney-client relationship until confirmed in writing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
