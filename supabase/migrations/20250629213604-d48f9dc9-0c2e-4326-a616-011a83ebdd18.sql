
-- Habilitar RLS na tabela link_clicks se não estiver habilitado
-- ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir inserções de qualquer usuário (já que é para tracking de links públicos)
CREATE POLICY "Allow public inserts on link_clicks" ON public.link_clicks
FOR INSERT WITH CHECK (true);

-- Criar política para permitir leitura apenas para usuários autenticados (para as estatísticas)
CREATE POLICY "Allow authenticated reads on link_clicks" ON public.link_clicks
FOR SELECT USING (auth.role() = 'authenticated');
