-- Add summary column to scans table if it doesn't exist
-- This migration is safe to run multiple times (idempotent)

DO $$ 
BEGIN
  -- Check if summary column exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'scans' 
    AND column_name = 'summary'
  ) THEN
    -- Add summary column
    ALTER TABLE scans 
    ADD COLUMN summary JSONB NOT NULL DEFAULT '{"totalFindings": 0, "uniqueTerms": 0, "estimatedPenalty": ""}'::jsonb;
    
    RAISE NOTICE 'Summary column added to scans table';
  ELSE
    RAISE NOTICE 'Summary column already exists in scans table';
  END IF;
END $$;
