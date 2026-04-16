import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slotId, lawyerId, notes } = await req.json()

    if (!slotId || !lawyerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch slot and verify it's still available
    const { data: slot } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('id', slotId)
      .eq('is_booked', false)
      .single()

    if (!slot) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Fetch lawyer profile and rate
    const { data: lawyerProfile } = await supabase
      .from('lawyer_profiles')
      .select('*, profile:profiles(full_name, email)')
      .eq('id', lawyerId)
      .single()

    if (!lawyerProfile) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 })
    }

    if (!lawyerProfile.hourly_rate) {
      return NextResponse.json(
        { error: 'Lawyer has not set a rate' },
        { status: 400 }
      )
    }

    const lawyerName =
      (lawyerProfile.profile as { full_name: string } | null)?.full_name || 'Attorney'

    const amountInCents = Math.round(lawyerProfile.hourly_rate * 100)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountInCents,
            product_data: {
              name: `Legal Consultation with ${lawyerName}`,
              description: `1-hour session on ${new Date(slot.start_time).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        client_id: user.id,
        lawyer_id: lawyerId,
        slot_id: slotId,
        notes: notes || '',
        amount: lawyerProfile.hourly_rate.toString(),
      },
      success_url: `${appUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book/${lawyerId}`,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
