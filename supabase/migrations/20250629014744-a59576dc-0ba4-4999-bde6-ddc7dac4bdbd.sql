
-- Insert initial crossword stats for existing users who might have played
-- This ensures we have separate tracking for crossword games
INSERT INTO public.game_stats (user_id, game_mode, win_streak, max_win_streak, total_games, total_wins, total_losses, average_attempts)
SELECT DISTINCT user_id, 'crossword', 0, 0, 0, 0, 0, 0
FROM public.game_stats 
WHERE game_mode = 'solo'
ON CONFLICT (user_id, game_mode) DO NOTHING;

-- Add a unique constraint to prevent duplicate game_mode entries per user
ALTER TABLE public.game_stats 
ADD CONSTRAINT unique_user_game_mode 
UNIQUE (user_id, game_mode);
