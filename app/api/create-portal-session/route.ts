import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/config';
import { getSessionFromCookies } from '@/lib/supabase/get-session-from-cookies';
import { getUserSubscription } from '@/lib/supabase/subscriptions';

export async function POST(req: NextRequest) {
  try {
    // Get Stripe instance
    const stripe = getStripe();
    
    // Check authentication - parse session directly from cookies
    const session = await getSessionFromCookies();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription to find Stripe customer ID
    const { data: subscription } = await getUserSubscription(session.user.id);

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_URL || req.nextUrl.origin;

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${baseUrl}/app/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
