-- Create table for storing music tracks temporarily
CREATE TABLE public.music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spotify_url TEXT NOT NULL,
  youtube_url TEXT,
  audio_url TEXT,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  duration INTEGER DEFAULT 180,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Enable Row Level Security
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Create policies for music tracks
CREATE POLICY "Anyone can view music tracks" 
ON public.music_tracks 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage music tracks" 
ON public.music_tracks 
FOR ALL 
USING (auth.uid() = 'bedf5a3e-ea52-4ba1-bcb4-5e748f4d9654'::uuid);

-- Create function to clean up expired tracks
CREATE OR REPLACE FUNCTION public.cleanup_expired_tracks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.music_tracks 
  WHERE expires_at < NOW();
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_track_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_music_tracks_updated_at
BEFORE UPDATE ON public.music_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_track_updated_at();