
-- Criar tabela para rastrear webhooks enviados
CREATE TABLE IF NOT EXISTS public.discord_webhooks_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_hash TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_discord_webhooks_user_session 
ON public.discord_webhooks_sent (user_id, session_hash);

-- Criar índice para limpeza de dados antigos
CREATE INDEX IF NOT EXISTS idx_discord_webhooks_sent_at 
ON public.discord_webhooks_sent (sent_at);

-- Habilitar RLS
ALTER TABLE public.discord_webhooks_sent ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seus próprios registros
CREATE POLICY "Users can view their own webhook records" 
  ON public.discord_webhooks_sent 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que usuários insiram apenas seus próprios registros
CREATE POLICY "Users can insert their own webhook records" 
  ON public.discord_webhooks_sent 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Função para limpar registros antigos (mais de 7 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_webhook_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.discord_webhooks_sent 
  WHERE sent_at < NOW() - INTERVAL '7 days';
END;
$$;
