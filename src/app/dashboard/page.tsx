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
  const supabase = createClient()
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
    <div className="bg-zinc-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your bookings and legal matters</p>
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
            },
            {
              href: '/advice',
              icon: MessageSquare,
              label: 'Free Advice',
              desc: 'Ask legal questions',
            },
            {
              href: '/advice/new',
              icon: Plus,
              label: 'Ask a Question',
              desc: 'Get community help',
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-400 p-5 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center mb-3">
                <action.icon className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="font-medium text-zinc-950 text-sm">{action.label}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{action.desc}</div>
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
              <h3 className="font-medium text-zinc-700 mb-2 text-sm">No upcoming sessions</h3>
              <p className="text-zinc-400 text-sm mb-5">
                Book a consultation with one of our verified lawyers.
              </p>
              <Link href="/lawyers" className="btn-primary text-sm py-2.5 px-6">
                Find a Lawyer
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(upcomingBookings as Booking[]).map((booking) => {
                const lawyerName = booking.lawyer_profile?.profile?.full_name || 'Attorney'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 font-semibold text-sm flex-shrink-0">
                      {getInitials(lawyerName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-zinc-950 text-sm">{lawyerName}</div>
                      {booking.slot && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {formatDateTime(booking.slot.start_time)}
                        </div>
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

        {/* Past Bookings */}
        {pastBookings && pastBookings.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Past Sessions
            </h2>
            <div className="space-y-2">
              {(pastBookings as Booking[]).map((booking) => {
                const lawyerName = booking.lawyer_profile?.profile?.full_name || 'Attorney'
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-zinc-100 p-5 flex items-center gap-4 opacity-70"
                  >
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 font-medium text-xs flex-shrink-0">
                      {getInitials(lawyerName)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-zinc-700 text-sm">{lawyerName}</div>
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
