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
import { Calendar, Search, MessageSquare, Clock, CheckCircle, Plus } from 'lucide-react'

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'lawyer') {
    redirect('/lawyer/dashboard')
  }

  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select(
      `*,
      slot:availability_slots(*),
      lawyer_profile:lawyer_profiles(*, profile:profiles(*))`
    )
    .eq('client_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: pastBookings } = await supabase
    .from('bookings')
    .select(
      `*,
      slot:availability_slots(*),
      lawyer_profile:lawyer_profiles(*, profile:profiles(*))`
    )
    .eq('client_id', user.id)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-gray-500 mt-1">Manage your bookings and legal matters</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            {
              href: '/lawyers',
              icon: Search,
              label: 'Find a Lawyer',
              desc: 'Browse by specialty',
              color: 'bg-blue-50 text-blue-700',
            },
            {
              href: '/advice',
              icon: MessageSquare,
              label: 'Free Advice',
              desc: 'Ask legal questions',
              color: 'bg-amber-50 text-amber-700',
            },
            {
              href: '/advice/new',
              icon: Plus,
              label: 'Ask a Question',
              desc: 'Get community help',
              color: 'bg-green-50 text-green-700',
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="font-semibold text-gray-900 text-sm">{action.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{action.desc}</div>
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
              <h3 className="font-semibold text-gray-700 mb-2">No upcoming sessions</h3>
              <p className="text-gray-500 text-sm mb-5">
                Book a consultation with one of our verified lawyers.
              </p>
              <Link href="/lawyers" className="btn-primary text-sm py-2.5 px-6">
                Find a Lawyer
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {(upcomingBookings as Booking[]).map((booking) => {
                const lawyerName = booking.lawyer_profile?.profile?.full_name || 'Attorney'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900 font-bold flex-shrink-0">
                      {getInitials(lawyerName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{lawyerName}</div>
                      {booking.slot && (
                        <div className="text-sm text-gray-500 mt-0.5">
                          {formatDateTime(booking.slot.start_time)}
                        </div>
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
                        <span className="text-sm font-semibold text-gray-900">
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

        {/* Past Bookings */}
        {pastBookings && pastBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-gray-400" />
              Past Sessions
            </h2>
            <div className="space-y-3">
              {(pastBookings as Booking[]).map((booking) => {
                const lawyerName = booking.lawyer_profile?.profile?.full_name || 'Attorney'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 opacity-80"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-semibold text-sm flex-shrink-0">
                      {getInitials(lawyerName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 text-sm">{lawyerName}</div>
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
