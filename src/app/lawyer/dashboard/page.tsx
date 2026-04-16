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
  AlertCircle,
} from 'lucide-react'

export default async function LawyerDashboardPage() {
  const supabase = createClient()
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
      .gte('start_time', new Date().toISOString()),

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
    },
    {
      icon: Clock,
      label: 'Open Slots',
      value: (openSlotsCount ?? 0).toString(),
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: formatCurrency(totalEarnings),
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: (totalBookings?.length ?? 0).toString(),
    },
  ]

  return (
    <div className="bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                Lawyer Dashboard
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {profile?.full_name}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/lawyer/availability"
                className="btn-secondary text-sm py-2.5 px-4"
              >
                Availability
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
          <div className="bg-zinc-950 text-white rounded-xl p-5 flex items-center gap-4">
            <AlertCircle className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Complete your profile to attract clients</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Add your bio, hourly rate, and specializations to appear in search results.
              </p>
            </div>
            <Link href="/lawyer/setup" className="bg-white text-zinc-950 font-medium text-xs px-4 py-2 rounded-lg hover:bg-zinc-100 transition-colors flex-shrink-0">
              Complete Profile
            </Link>
          </div>
        ) : null}

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center mb-3">
                <stat.icon className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="text-2xl font-semibold tracking-tight text-zinc-950">{stat.value}</div>
              <div className="text-xs text-zinc-400 mt-0.5 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: '/lawyer/availability', icon: Calendar, label: 'Manage Availability', desc: 'Add or remove time slots' },
            { href: '/lawyer/setup', icon: User, label: 'Edit Profile', desc: 'Update your information' },
            { href: '/advice', icon: MessageSquare, label: 'Answer Questions', desc: 'Help and attract clients' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 p-5 transition-colors flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-zinc-950 text-sm">{item.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-300 flex-shrink-0" />
            </Link>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Sessions
          </h2>
          {(!upcomingBookings || upcomingBookings.length === 0) ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-10 text-center">
              <Clock className="w-10 h-10 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No upcoming sessions.</p>
              <Link href="/lawyer/availability" className="mt-3 inline-block text-zinc-950 text-sm font-medium hover:underline">
                Add availability slots
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(upcomingBookings as Booking[]).map((booking) => {
                const clientName = booking.client?.full_name || 'Client'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 font-semibold text-sm flex-shrink-0">
                      {getInitials(clientName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-zinc-950 text-sm">{clientName}</div>
                      {booking.slot && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {formatDateTime(booking.slot.start_time)}
                        </div>
                      )}
                      {booking.notes && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic">
                          &ldquo;{booking.notes}&rdquo;
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                          BOOKING_STATUS_COLORS[booking.status]
                        }`}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                      {booking.amount && (
                        <span className="text-xs font-semibold text-zinc-700">
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
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Past Sessions
            </h2>
            <div className="space-y-2">
              {(pastBookings as Booking[]).map((booking) => {
                const clientName = booking.client?.full_name || 'Client'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-zinc-100 p-5 flex items-center gap-4 opacity-70"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium text-xs flex-shrink-0">
                      {getInitials(clientName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-zinc-700 text-sm">{clientName}</div>
                      {booking.slot && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {formatDateTime(booking.slot.start_time)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md ${
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
