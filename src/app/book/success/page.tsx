import Link from 'next/link'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl border border-zinc-200 p-10 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-zinc-950 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-3">Booking Confirmed</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Your session has been booked and payment processed successfully. You will receive a
          confirmation email with the meeting details shortly.
        </p>

        {searchParams.session_id && (
          <p className="text-xs text-zinc-400 mb-6 font-mono">
            Ref: {searchParams.session_id.slice(-12)}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            View My Bookings
          </Link>
          <Link
            href="/lawyers"
            className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            Browse more lawyers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
