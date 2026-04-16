import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Booking } from '@/types'
import {
  formatCurrency,
  formatDateTime,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  getInitials,
} from '@/lib/utils'
import {
  Calendar,
  User,
  Clock,
  DollarSign,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

export default async function LawyerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/lawyer/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'lawyer') redirect('/dashboard')

  const { data: lawyerProfile } = await supabase
    .from('lawyer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!lawyerProfile) {
    redirect('/lawyer/setup')
  }

  const [
    { data: upcomingBookings },
    { data: pastBookings },
    { count: openSlotsCount },
    { data: totalBookings },
  ] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        `*,
        slot:availability_slots(*),
        client:profiles(*)`
      )
      .eq('lawyer_id', lawyerProfile.id)
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('bookings')
      .select(
        `*,
        slot:availability_slots(*),
        client:profiles(*)`
      )
      .eq('lawyer_id', lawyerProfile.id)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('availability_slots')
      .select('id', { count: 'exact', head: true })
      .eq('lawyer_id', lawyerProfile.id)
      .eq('is_booked', false)
      .gte('start_time', new Date().toISOString())
      .returns<null>(),

    supabase
      .from('bookings')
      .select('amount, status')
      .eq('lawyer_id', lawyerProfile.id)
      .eq('status', 'completed'),
  ])

  const totalEarnings = (totalBookings || []).reduce(
    (sum, b) => sum + (b.amount || 0),
    0
  )

  const stats = [
    {
      icon: Calendar,
      label: 'Upcoming Sessions',
      value: (upcomingBookings?.length ?? 0).toString(),
      color: 'bg-blue-50 text-blue-700',
    },
    {
      icon: Clock,
      label: 'Open Slots',
      value: (openSlotsCount ?? 0).toString(),
      color: 'bg-green-50 text-green-700',
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: formatCurrency(totalEarnings),
      color: 'bg-amber-50 text-amber-700',
    },
    {
      icon: CheckCircle,
      label: 'Completed Sessions',
      value: (totalBookings?.length ?? 0).toString(),
      color: 'bg-purple-50 text-purple-700',
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lawyer Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                {profile?.full_name} — manage your practice
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/lawyer/availability"
                className="btn-secondary text-sm py-2.5 px-4"
              >
                Manage Availability
              </Link>
              <Link
                href="/lawyer/setup"
                className="btn-primary text-sm py-2.5 px-4"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile completion notice */}
        {!lawyerProfile.bio || !lawyerProfile.hourly_rate || lawyerProfile.specializations.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <TrendingUp className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Complete your profile to attract clients</p>
              <p className="text-amber-700 text-sm mt-0.5">
                Add your bio, hourly rate, and specializations to appear in search results.
              </p>
            </div>
            <Link href="/lawyer/setup" className="btn-primary text-sm py-2 px-5 flex-shrink-0">
              Complete Profile
            </Link>
          </div>
        ) : null}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: '/lawyer/availability', icon: Calendar, label: 'Manage Availability', desc: 'Add or remove time slots' },
            { href: '/lawyer/setup', icon: User, label: 'Edit Profile', desc: 'Update your information' },
            { href: '/advice', icon: MessageSquare, label: 'Answer Questions', desc: 'Help and attract clients' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            Upcoming Sessions
          </h2>
          {(!upcomingBookings || upcomingBookings.length === 0) ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No upcoming sessions.</p>
              <Link href="/lawyer/availability" className="mt-4 inline-block text-blue-700 text-sm font-medium hover:underline">
                Add availability slots
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(upcomingBookings as Booking[]).map((booking) => {
                const clientName = booking.client?.full_name || 'Client'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold flex-shrink-0">
                      {getInitials(clientName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{clientName}</div>
                      {booking.slot && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {formatDateTime(booking.slot.start_time)}
                        </div>
                      )}
                      {booking.notes && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                          &ldquo;{booking.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          BOOKING_STATUS_COLORS[booking.status]
                        }`}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                      {booking.amount && (
                        <span className="text-sm font-semibold text-green-700">
                          {formatCurrency(booking.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        {pastBookings && pastBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              Past Sessions
            </h2>
            <div className="space-y-3">
              {(pastBookings as Booking[]).map((booking) => {
                const clientName = booking.client?.full_name || 'Client'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 opacity-80"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm flex-shrink-0">
                      {getInitials(clientName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{clientName}</div>
                      {booking.slot && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatDateTime(booking.slot.start_time)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        BOOKING_STATUS_COLORS[booking.status]
                      }`}
                    >
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
