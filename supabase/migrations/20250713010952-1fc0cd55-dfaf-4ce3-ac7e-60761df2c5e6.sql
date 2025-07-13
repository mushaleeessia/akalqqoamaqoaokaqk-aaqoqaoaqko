-- Criar tabela para sessões de música do Listen Together
CREATE TABLE public.listen_together_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id uuid NOT NULL,
  current_track_id text,
  current_track_name text,
  current_track_artist text,
  current_track_audio_url text,
  current_track_duration integer DEFAULT 180,
  current_track_image_url text,
  is_playing boolean NOT NULL DEFAULT false,
  current_time real NOT NULL DEFAULT 0,
  started_at bigint NOT NULL DEFAULT 0,
  queue jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para a fila de músicas
CREATE TABLE public.listen_together_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.listen_together_sessions(id) ON DELETE CASCADE,
  track_id text NOT NULL,
  track_name text NOT NULL,
  track_artist text NOT NULL,
  track_audio_url text NOT NULL,
  track_duration integer DEFAULT 180,
  track_image_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listen_together_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listen_together_queue ENABLE ROW LEVEL SECURITY;

-- Policies para listen_together_sessions
CREATE POLICY "Anyone can view sessions" 
ON public.listen_together_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage their session" 
ON public.listen_together_sessions 
FOR ALL 
USING (auth.uid() = admin_id);

-- Policies para listen_together_queue
CREATE POLICY "Anyone can view queue" 
ON public.listen_together_queue 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage queue" 
ON public.listen_together_queue 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.listen_together_sessions 
    WHERE id = session_id AND admin_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_listen_together_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_listen_together_sessions_updated_at
BEFORE UPDATE ON public.listen_together_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_listen_together_updated_at();

-- Função para limpar sessões antigas (mais de 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_listen_together_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.listen_together_sessions 
  WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$;