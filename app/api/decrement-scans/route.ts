import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSessionFromCookies } from '@/lib/supabase/get-session-from-cookies';
import { getUserSubscription } from '@/lib/supabase/subscriptions';
import { getScanLimit, isUnlimited } from '@/lib/subscription-limits';

export async function POST(req: NextRequest) {
  try {
    // Check authentication - parse session directly from cookies
    const session = await getSessionFromCookies();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await getUserSubscription(
      session.user.id
    );

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for free users
      console.error('Error fetching subscription:', subError);
    }

    const plan = (subscription?.plan || 'free') as 'free' | 'starter' | 'pro';

    // Check if unlimited
    if (isUnlimited(plan)) {
      return NextResponse.json({
        success: true,
        scansRemaining: null,
        isUnlimited: true,
      });
    }

    // Get or create subscription record
    let subscriptionRecord = subscription;

    if (!subscriptionRecord) {
      // Create free subscription record
      const supabase = createServerSupabaseClient();
      const { data: newSub, error: createError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: session.user.id,
          plan: 'free',
          status: 'active',
          billing_period: 'monthly',
          scans_remaining: getScanLimit('free'),
          scans_reset_date: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            1
          ).toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating subscription:', createError);
        return NextResponse.json(
          { error: 'Failed to initialize subscription' },
          { status: 500 }
        );
      }

      subscriptionRecord = newSub;
    }

    // Ensure subscriptionRecord exists
    if (!subscriptionRecord) {
      return NextResponse.json(
        { error: 'Failed to get or create subscription' },
        { status: 500 }
      );
    }

    // Check if we need to reset (new month)
    const now = new Date();
    const resetDate = subscriptionRecord.scans_reset_date
      ? new Date(subscriptionRecord.scans_reset_date)
      : null;

    let scansRemaining = subscriptionRecord.scans_remaining ?? getScanLimit(plan);

    if (resetDate && now >= resetDate) {
      // Reset scans for new month
      scansRemaining = getScanLimit(plan);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      
      const supabase = createServerSupabaseClient();
      const { error: resetError } = await supabase
        .from('user_subscriptions')
        .update({
          scans_remaining: scansRemaining,
          scans_reset_date: nextMonth.toISOString(),
        })
        .eq('user_id', session.user.id);

      if (resetError) {
        console.error('Error resetting scans:', resetError);
      }
    }

    // Check if user has scans remaining
    if (scansRemaining <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scan limit reached',
          scansRemaining: 0,
        },
        { status: 403 }
      );
    }

    // Decrement scans
    const supabase = createServerSupabaseClient();
    const { data: updated, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        scans_remaining: scansRemaining - 1,
      })
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error decrementing scans:', updateError);
      return NextResponse.json(
        { error: 'Failed to update scan count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      scansRemaining: updated.scans_remaining,
      isUnlimited: false,
    });
  } catch (error: any) {
    console.error('Error in decrement-scans:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
