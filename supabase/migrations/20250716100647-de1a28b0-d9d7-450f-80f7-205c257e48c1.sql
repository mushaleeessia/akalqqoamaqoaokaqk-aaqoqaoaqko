-- Create aim trainer tables for statistics and sessions
CREATE TABLE public.aim_trainer_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_mode VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  avg_reaction_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  targets_hit INTEGER NOT NULL DEFAULT 0,
  targets_missed INTEGER NOT NULL DEFAULT 0,
  total_targets INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0, -- seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.aim_trainer_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own aim sessions" 
ON public.aim_trainer_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aim sessions" 
ON public.aim_trainer_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create aim trainer stats table for aggregated user stats
CREATE TABLE public.aim_trainer_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_mode VARCHAR(50) NOT NULL,
  best_score INTEGER NOT NULL DEFAULT 0,
  best_accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  best_avg_reaction_time INTEGER NOT NULL DEFAULT 999999,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_targets_hit INTEGER NOT NULL DEFAULT 0,
  total_targets_missed INTEGER NOT NULL DEFAULT 0,
  avg_accuracy DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  avg_reaction_time INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_mode)
);

-- Enable RLS
ALTER TABLE public.aim_trainer_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own aim stats" 
ON public.aim_trainer_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aim stats" 
ON public.aim_trainer_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aim stats" 
ON public.aim_trainer_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_aim_trainer_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_aim_trainer_stats_updated_at
BEFORE UPDATE ON public.aim_trainer_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_aim_trainer_stats_updated_at();