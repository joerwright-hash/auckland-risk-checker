import { createSupabaseClient } from './client';

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'inactive' | 'trialing';
  plan: 'free' | 'starter' | 'pro';
  billing_period: 'monthly' | 'yearly';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  scans_remaining: number | null;
  scans_reset_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Gets user's subscription
 * @param userId - The user's ID
 * @returns The subscription record or error
 */
export async function getUserSubscription(userId: string) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data: data as UserSubscription | null, error };
}

/**
 * Gets scan usage statistics for a user
 * @param userId - The user's ID
 * @returns Usage statistics
 */
export async function getUserUsageStats(userId: string) {
  const supabase = createSupabaseClient();
  
  // Get all scans for the user
  const { data: scans, error } = await supabase
    .from('scans')
    .select('risk_score, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error, data: null };
  }

  // Calculate statistics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter scans from last 30 days
  const recentScans = scans?.filter(
    (scan) => new Date(scan.created_at) >= thirtyDaysAgo
  ) || [];

  // Filter scans from this month
  const monthlyScans = scans?.filter(
    (scan) => new Date(scan.created_at) >= thisMonthStart
  ) || [];

  // Group scans by day for chart
  const scansByDay: Record<string, number> = {};
  recentScans.forEach((scan) => {
    const date = new Date(scan.created_at).toISOString().split('T')[0];
    scansByDay[date] = (scansByDay[date] || 0) + 1;
  });

  // Create array of last 30 days with scan counts
  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    chartData.push({
      date: dateStr,
      day: date.getDate(),
      scans: scansByDay[dateStr] || 0,
    });
  }

  // Calculate average risk score
  const avgRiskScore =
    monthlyScans.length > 0
      ? Math.round(
          monthlyScans.reduce((sum, scan) => sum + scan.risk_score, 0) /
            monthlyScans.length
        )
      : 0;

  return {
    data: {
      totalScansThisMonth: monthlyScans.length,
      totalScansLast30Days: recentScans.length,
      averageRiskScore: avgRiskScore,
      chartData,
    },
    error: null,
  };
}
