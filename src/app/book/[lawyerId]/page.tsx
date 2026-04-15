'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BookingCalendar from '@/components/BookingCalendar'
import { AvailabilitySlot, LawyerProfile } from '@/types'
import { formatCurrency, formatDateTime, getInitials } from '@/lib/utils'
import { ArrowLeft, CheckCircle, CreditCard, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function BookPage() {
  const params = useParams()
  const lawyerId = params.lawyerId as string
  const router = useRouter()
  const supabase = createClient()

  const [lawyer, setLawyer] = useState<LawyerProfile | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'calendar' | 'confirm'>('calendar')

  useEffect(() => {
    async function load() {
      const { data: lawyerData } = await supabase
        .from('lawyer_profiles')
        .select('*, profile:profiles(*)')
        .eq('id', lawyerId)
        .single()

      if (!lawyerData) {
        router.push('/lawyers')
        return
      }

      const { data: slotsData } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('lawyer_id', lawyerId)
        .eq('is_booked', false)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      setLawyer(lawyerData as LawyerProfile)
      setSlots(slotsData || [])
      setLoading(false)
    }
    load()
  }, [lawyerId, router, supabase])

  const handleProceed = () => {
    if (!selectedSlot) {
      toast.error('Please select a time slot')
      return
    }
    setStep('confirm')
  }

  const handleCheckout = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/auth/login?redirectTo=/book/${lawyerId}`)
      return
    }

    if (!selectedSlot || !lawyer) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          lawyerId: lawyer.id,
          notes,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lawyer) return null

  const name = lawyer.profile?.full_name || 'Attorney'
  const initials = getInitials(name)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/lawyers/${lawyerId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900 font-bold text-lg flex-shrink-0">
              {lawyer.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lawyer.profile.avatar_url} alt={name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Book a session with {name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {lawyer.hourly_rate
                  ? `${formatCurrency(lawyer.hourly_rate)} per 1-hour consultation`
                  : '1-hour consultation'}
              </p>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-4 mt-6">
            <div className={`flex items-center gap-2 text-sm font-medium ${step === 'calendar' ? 'text-blue-900' : 'text-green-600'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'calendar' ? 'bg-blue-900 text-white' : 'bg-green-100 text-green-700'}`}>
                {step === 'confirm' ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              Choose time
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className={`flex items-center gap-2 text-sm font-medium ${step === 'confirm' ? 'text-blue-900' : 'text-gray-400'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === 'confirm' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                2
              </div>
              Confirm & pay
            </div>
          </div>
        </div>

        {step === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Select a date and time</h2>
              {slots.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No available slots for this lawyer at the moment.</p>
                  <Link href="/lawyers" className="mt-4 inline-block text-blue-700 font-medium text-sm hover:underline">
                    Browse other lawyers
                  </Link>
                </div>
              ) : (
                <BookingCalendar
                  slots={slots}
                  onSlotSelect={setSelectedSlot}
                  selectedSlot={selectedSlot}
                />
              )}
            </div>

            {selectedSlot && (
              <div className="flex justify-end">
                <button
                  onClick={handleProceed}
                  className="btn-primary px-8"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'confirm' && selectedSlot && (
          <div className="space-y-6">
            {/* Session summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">Confirm your booking</h2>
              <div className="bg-blue-50 rounded-xl p-5 mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-blue-700" />
                  <span className="font-semibold text-blue-900">Session Details</span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Lawyer</dt>
                    <dd className="font-medium text-gray-900">{name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Date & Time</dt>
                    <dd className="font-medium text-gray-900">{formatDateTime(selectedSlot.start_time)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Duration</dt>
                    <dd className="font-medium text-gray-900">1 hour</dd>
                  </div>
                  {lawyer.hourly_rate && (
                    <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
                      <dt className="font-semibold text-gray-900">Total</dt>
                      <dd className="font-bold text-blue-900 text-base">{formatCurrency(lawyer.hourly_rate)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 label mb-2">
                  <FileText className="w-4 h-4" />
                  Brief description of your matter (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input resize-none"
                  rows={4}
                  placeholder="Describe your legal situation briefly so the lawyer can prepare for your session..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{notes.length}/1000</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep('calendar')}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Change time
              </button>
              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="btn-primary flex items-center gap-2 px-8"
              >
                <CreditCard className="w-4 h-4" />
                {submitting ? 'Processing…' : `Pay ${lawyer.hourly_rate ? formatCurrency(lawyer.hourly_rate) : ''}`}
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center">
              You will be redirected to Stripe for secure payment processing. Your payment info is never stored on Atorni.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
