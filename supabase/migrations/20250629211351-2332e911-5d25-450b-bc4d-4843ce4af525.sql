
-- Criar tabela para armazenar cliques nos links
CREATE TABLE public.link_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_title TEXT NOT NULL,
  link_url TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_link_clicks_title ON public.link_clicks(link_title);
CREATE INDEX idx_link_clicks_date ON public.link_clicks(clicked_at);

-- Função para obter estatísticas de cliques
CREATE OR REPLACE FUNCTION public.get_link_click_stats()
RETURNS TABLE (
  link_title TEXT,
  total_clicks BIGINT,
  clicks_today BIGINT,
  clicks_this_week BIGINT,
  last_click TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lc.link_title,
    COUNT(*) as total_clicks,
    COUNT(*) FILTER (WHERE DATE(lc.clicked_at) = CURRENT_DATE) as clicks_today,
    COUNT(*) FILTER (WHERE lc.clicked_at >= NOW() - INTERVAL '7 days') as clicks_this_week,
    MAX(lc.clicked_at) as last_click
  FROM public.link_clicks lc
  GROUP BY lc.link_title
  ORDER BY total_clicks DESC;
END;
$$;
