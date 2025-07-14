-- Configurar REPLICA IDENTITY FULL para real-time updates completos na tabela game_stats
ALTER TABLE public.game_stats REPLICA IDENTITY FULL;