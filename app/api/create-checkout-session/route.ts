import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, isRecurring } = await req.json();

    // Validate amount
    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gridmix.co.uk';

    if (isRecurring) {
      // Create a recurring subscription
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: 'GridMix Monthly Support',
                description: `Monthly donation of £${amount} to support GridMix`,
                images: [`${baseUrl}/Assets/gridmixlogo.png`],
              },
              unit_amount: Math.round(amount * 100), // Convert to pence
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/support`,
        metadata: {
          type: 'recurring',
          amount: amount.toString(),
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    } else {
      // Create a one-time payment
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: 'GridMix Support',
                description: `One-time donation of £${amount} to support GridMix`,
                images: [`${baseUrl}/Assets/gridmixlogo.png`],
              },
              unit_amount: Math.round(amount * 100), // Convert to pence
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/support/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/support`,
        metadata: {
          type: 'one-time',
          amount: amount.toString(),
        },
      });

      return NextResponse.json({ sessionId: session.id, url: session.url });
    }
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}
