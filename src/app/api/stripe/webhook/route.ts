import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

// Use the service role key so we can bypass RLS for booking creation
function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata

    if (!meta?.client_id || !meta?.lawyer_id || !meta?.slot_id) {
      console.error('Missing metadata in Stripe session')
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Mark slot as booked
    await supabase
      .from('availability_slots')
      .update({ is_booked: true })
      .eq('id', meta.slot_id)

    // Create booking record
    const { error } = await supabase.from('bookings').insert({
      client_id: meta.client_id,
      lawyer_id: meta.lawyer_id,
      slot_id: meta.slot_id,
      status: 'confirmed',
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || null,
      amount: meta.amount ? parseFloat(meta.amount) : null,
      notes: meta.notes || null,
    })

    if (error) {
      console.error('Failed to create booking:', error)
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
