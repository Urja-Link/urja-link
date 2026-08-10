import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any,
});

export async function POST(request: Request) {
    // 1. Read the raw text payload (Stripe needs the raw body to verify signature)
    const payload = await request.text();

    // 2. Get the signature from headers
    const sigHeader = request.headers.get('Stripe-Signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event: Stripe.Event;

    try {
        if (!sigHeader || !webhookSecret) {
            return NextResponse.json({ error: 'Missing Stripe signature or webhook secret in environment variable' }, { status: 400 });
        }

        // 3. Construct and verify the event
        event = stripe.webhooks.constructEvent(payload, sigHeader, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // 4. Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract metadata, mark user as PRO
        const userId = session.metadata?.userId;
        console.log(`Payment successful for user: ${userId}. Session ID: ${session.id}`);

        // TODO: Update user to pro status in your database (e.g., Supabase)
        // await supabase.from('users').update({ tier: 'pro' }).eq('id', userId);
    }

    return NextResponse.json({ received: true });
}
