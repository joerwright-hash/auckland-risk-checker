export type PlanType = 'free' | 'starter' | 'pro';

export interface PlanLimits {
  scansPerMonth: number; // Infinity for unlimited
  name: string;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    scansPerMonth: 3,
    name: 'Free',
  },
  starter: {
    scansPerMonth: 100,
    name: 'Starter',
  },
  pro: {
    scansPerMonth: Infinity,
    name: 'Pro',
  },
};

/**
 * Gets the scan limit for a plan
 */
export function getScanLimit(plan: PlanType): number {
  return PLAN_LIMITS[plan].scansPerMonth;
}

/**
 * Checks if a plan has unlimited scans
 */
export function isUnlimited(plan: PlanType): boolean {
  return PLAN_LIMITS[plan].scansPerMonth === Infinity;
}

/**
 * Formats usage display text
 */
export function formatUsageDisplay(
  plan: PlanType,
  scansUsed: number,
  scansRemaining: number | null
): string {
  if (isUnlimited(plan)) {
    return `${scansUsed} scans this month`;
  }

  if (scansRemaining !== null) {
    return `${scansRemaining}/${PLAN_LIMITS[plan].scansPerMonth} scans remaining`;
  }

  return `${scansUsed}/${PLAN_LIMITS[plan].scansPerMonth} scans`;
}

/**
 * Calculates usage percentage
 */
export function getUsagePercentage(
  plan: PlanType,
  scansUsed: number
): number {
  if (isUnlimited(plan)) {
    return 0; // No progress bar for unlimited
  }

  const limit = PLAN_LIMITS[plan].scansPerMonth;
  return Math.min(100, Math.round((scansUsed / limit) * 100));
}

/**
 * Gets encouraging message based on usage
 */
export function getEncouragingMessage(
  plan: PlanType,
  scansRemaining: number | null
): string | null {
  if (isUnlimited(plan)) {
    return null;
  }

  if (scansRemaining === null) {
    return null;
  }

  const limit = PLAN_LIMITS[plan].scansPerMonth;
  const percentage = (scansRemaining / limit) * 100;

  if (percentage <= 10) {
    return 'Running low on scans!';
  } else if (percentage <= 25) {
    return 'Consider upgrading for more scans';
  } else if (percentage >= 90) {
    return 'Great! You have plenty of scans left';
  }

  return null;
}
