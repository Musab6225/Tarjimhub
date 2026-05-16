-- Create terminologies table
CREATE TABLE IF NOT EXISTS terminologies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  term TEXT NOT NULL,
  definition TEXT,
  category TEXT,
  dialects JSONB NOT NULL,
  examples JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_terminologies_user_id ON terminologies(user_id);
CREATE INDEX IF NOT EXISTS idx_terminologies_category ON terminologies(category);
