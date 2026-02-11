import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getPriceId } from '@/lib/stripe/config';
import { getSessionFromCookies } from '@/lib/supabase/get-session-from-cookies';

export async function POST(req: NextRequest) {
  try {
    // Get Stripe instance (will throw if STRIPE_SECRET_KEY is not set)
    let stripe;
    try {
      stripe = getStripe();
    } catch (error: any) {
      console.error('Stripe configuration error:', error);
      return NextResponse.json(
        { 
          error: 'Payment service is not configured. Please contact support.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
    
    // Check authentication - parse session directly from cookies
    const authSession = await getSessionFromCookies();

    if (!authSession?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { priceId, plan, billingPeriod, cancelUrl } = body;

    // Validate input
    if (!priceId && (!plan || !billingPeriod)) {
      return NextResponse.json(
        { error: 'Price ID or plan and billing period required' },
        { status: 400 }
      );
    }

    // Get price ID if not provided directly
    const finalPriceId = priceId || getPriceId(plan, billingPeriod);

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'Invalid plan or price ID' },
        { status: 400 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || req.nextUrl.origin;

    // Get cancel URL: use provided cancelUrl, or referer header, or fallback to pricing
    const referer = req.headers.get('referer');
    let cancel_url = `${baseUrl}/pricing`; // Default fallback
    
    if (cancelUrl) {
      // Use provided cancelUrl if it's a valid URL on our domain
      try {
        const url = new URL(cancelUrl, baseUrl);
        if (url.origin === baseUrl || url.origin === req.nextUrl.origin) {
          cancel_url = url.toString();
        }
      } catch (e) {
        // Invalid URL, use default
      }
    } else if (referer) {
      // Use referer if it's from our domain
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.origin === baseUrl || refererUrl.origin === req.nextUrl.origin) {
          cancel_url = referer;
        }
      } catch (e) {
        // Invalid referer, use default
      }
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      customer_email: authSession.user.email,
      metadata: {
        userId: authSession.user.id,
        plan: plan || 'unknown',
        billingPeriod: billingPeriod || 'monthly',
      },
      subscription_data: {
        metadata: {
          userId: authSession.user.id,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
