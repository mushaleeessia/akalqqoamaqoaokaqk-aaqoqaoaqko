-- Criar índice para melhorar performance de buscas por target_words específicas no modo infinity
CREATE INDEX IF NOT EXISTS idx_game_sessions_infinity_target_words 
ON public.game_sessions USING GIN (target_words) 
WHERE game_mode = 'infinity';

-- Criar índice composto para otimizar buscas por usuário, modo e palavras
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_mode_words 
ON public.game_sessions (user_id, game_mode, target_words) 
WHERE game_mode = 'infinity';