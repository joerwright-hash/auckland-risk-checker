-- Add scans tracking columns to user_subscriptions table
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS scans_remaining INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS scans_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Set initial values for existing records
UPDATE user_subscriptions
SET 
  scans_remaining = CASE 
    WHEN plan = 'free' THEN 3
    WHEN plan = 'starter' THEN 100
    ELSE NULL
  END,
  scans_reset_date = DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
WHERE scans_remaining IS NULL;

-- Create function to reset scans monthly
CREATE OR REPLACE FUNCTION reset_monthly_scans()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    scans_remaining = CASE 
      WHEN plan = 'free' THEN 3
      WHEN plan = 'starter' THEN 100
      ELSE scans_remaining
    END,
    scans_reset_date = DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
  WHERE 
    scans_reset_date IS NOT NULL
    AND scans_reset_date <= CURRENT_DATE
    AND plan IN ('free', 'starter');
END;
$$ LANGUAGE plpgsql;

-- Note: In production, you would set up a cron job or scheduled task
-- to call reset_monthly_scans() at the start of each month
-- For now, the reset happens on-access in the decrement-scans API route
