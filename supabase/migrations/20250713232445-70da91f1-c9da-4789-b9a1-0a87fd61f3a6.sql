-- Criar uma nova tabela específica para progressos de infinity mode
-- que permite persistência por palavra individual
CREATE TABLE IF NOT EXISTS public.infinity_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_word TEXT NOT NULL,
  guesses TEXT[] NOT NULL DEFAULT '{}',
  current_guess TEXT NOT NULL DEFAULT '',
  game_status TEXT NOT NULL DEFAULT 'playing',
  current_row INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, target_word)
);

-- Enable RLS
ALTER TABLE public.infinity_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own infinity progress"
ON public.infinity_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_infinity_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_infinity_progress_updated_at
  BEFORE UPDATE ON public.infinity_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_infinity_progress_updated_at();