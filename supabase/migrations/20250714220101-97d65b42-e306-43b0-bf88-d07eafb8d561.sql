-- Configurar REPLICA IDENTITY FULL para real-time updates completos na tabela game_stats
ALTER TABLE public.game_stats REPLICA IDENTITY FULL;

-- Garantir que a tabela esteja na publicação supabase_realtime
-- (normalmente já está, mas vamos garantir)
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_stats;