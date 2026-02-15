CREATE TABLE video_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  video_id TEXT NOT NULL,
  video_thumbnail_url TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  requested_length INTEGER NOT NULL DEFAULT 300,
  word_count INTEGER,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_email, video_id)
);

CREATE INDEX idx_summaries_user ON video_summaries (user_email, created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at BEFORE UPDATE ON video_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
