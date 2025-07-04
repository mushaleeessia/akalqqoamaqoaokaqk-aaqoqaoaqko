
-- Atualizar a função para incluir estatísticas mensais
CREATE OR REPLACE FUNCTION public.get_link_click_stats()
RETURNS TABLE (
  link_title TEXT,
  total_clicks BIGINT,
  clicks_today BIGINT,
  clicks_this_week BIGINT,
  clicks_this_month BIGINT,
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
    COUNT(*) FILTER (WHERE lc.clicked_at >= DATE_TRUNC('month', NOW())) as clicks_this_month,
    MAX(lc.clicked_at) as last_click
  FROM public.link_clicks lc
  GROUP BY lc.link_title
  ORDER BY total_clicks DESC;
END;
$$;
