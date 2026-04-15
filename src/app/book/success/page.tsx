import Link from 'next/link'
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react'

export default function BookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Booking Confirmed!</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your session has been booked and payment processed successfully. You will receive a
          confirmation email with the meeting details shortly.
        </p>

        {searchParams.session_id && (
          <p className="text-xs text-gray-400 mb-6">
            Reference: {searchParams.session_id.slice(-12)}
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
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors"
          >
            Browse more lawyers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
