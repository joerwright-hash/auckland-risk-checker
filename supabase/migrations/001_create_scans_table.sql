-- Create scans table
CREATE TABLE IF NOT EXISTS scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  findings JSONB NOT NULL DEFAULT '{"critical": [], "warnings": [], "minor": []}'::jsonb,
  summary JSONB NOT NULL DEFAULT '{"totalFindings": 0, "uniqueTerms": 0, "estimatedPenalty": ""}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS scans_user_id_idx ON scans(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans(created_at DESC);

-- Enable Row Level Security
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own scans
CREATE POLICY "Users can view their own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own scans
CREATE POLICY "Users can insert their own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own scans
CREATE POLICY "Users can update their own scans"
  ON scans FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own scans
CREATE POLICY "Users can delete their own scans"
  ON scans FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_scans_updated_at
  BEFORE UPDATE ON scans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
