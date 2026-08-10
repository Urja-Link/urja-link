import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-01-27.acacia' as any, // specify standard latest API version
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // create a checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Urja-Link Pro Subscription',
                            description: 'Advanced Digital Twin & AI Solar Analytics',
                        },
                        unit_amount: 150000, // ₹1,500.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // use 'subscription' for recurring, but stick to payment for simplicity
            success_url: `${request.headers.get('origin')}/dashboard?success=true`,
            cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
            metadata: {
                userId: body.userId || 'anonymous-user'
            }
        });

        // return the session ID
        return NextResponse.json({ sessionId: session.id });
    } catch (err: any) {
        console.error("Stripe Checkout Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
