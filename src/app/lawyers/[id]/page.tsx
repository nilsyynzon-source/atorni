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
  Star,
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
    <div className="bg-gray-50 min-h-screen">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/lawyers"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all lawyers
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-2xl flex-shrink-0">
                  {lawyer.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={lawyer.profile.avatar_url}
                      alt={name}
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                    {lawyer.is_verified && (
                      <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified Attorney
                      </span>
                    )}
                  </div>
                  {lawyer.location && (
                    <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      {lawyer.location}
                    </div>
                  )}
                  {lawyer.bar_number && (
                    <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                      <Scale className="w-4 h-4" />
                      Bar No. {lawyer.bar_number}
                    </div>
                  )}
                </div>
              </div>

              {/* Specializations */}
              {lawyer.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {lawyer.specializations.map((spec) => (
                    <span
                      key={spec}
                      className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bio */}
            {lawyer.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{lawyer.bio}</p>
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Details</h2>
              <dl className="grid sm:grid-cols-2 gap-5">
                {lawyer.years_experience && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wide">Experience</dt>
                      <dd className="font-semibold text-gray-900">{lawyer.years_experience} years</dd>
                    </div>
                  </div>
                )}
                {lawyer.languages.length > 0 && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Languages className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wide">Languages</dt>
                      <dd className="font-semibold text-gray-900">{lawyer.languages.join(', ')}</dd>
                    </div>
                  </div>
                )}
                {lawyer.website && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wide">Website</dt>
                      <dd>
                        <a
                          href={lawyer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-medium hover:underline text-sm"
                        >
                          {lawyer.website.replace(/^https?:\/\//, '')}
                        </a>
                      </dd>
                    </div>
                  </div>
                )}
                {lawyer.linkedin_url && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Linkedin className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase tracking-wide">LinkedIn</dt>
                      <dd>
                        <a
                          href={lawyer.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-medium hover:underline text-sm"
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
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
              <div className="text-center mb-6">
                {lawyer.hourly_rate ? (
                  <>
                    <div className="text-3xl font-bold text-blue-900">
                      {formatCurrency(lawyer.hourly_rate)}
                    </div>
                    <div className="text-gray-500 text-sm">per 1-hour session</div>
                  </>
                ) : (
                  <div className="text-gray-500 text-sm">Rate upon consultation</div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {lawyer.is_accepting_clients ? 'Currently accepting clients' : 'Not accepting clients'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  {hasSlots ? `${slots?.length} upcoming slots available` : 'No upcoming availability'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
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
                  className="w-full bg-gray-100 text-gray-400 font-medium py-3 rounded-xl cursor-not-allowed"
                >
                  {lawyer.is_accepting_clients ? 'No availability' : 'Not available'}
                </button>
              )}

              {lawyer.phone && (
                <div className="mt-4 flex items-center gap-2 justify-center text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span>{lawyer.phone}</span>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong className="block mb-1">Disclaimer</strong>
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
