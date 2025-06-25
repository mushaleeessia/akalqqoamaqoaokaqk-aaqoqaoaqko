
-- Criar função para deletar conta do usuário e todos os dados relacionados
CREATE OR REPLACE FUNCTION delete_user_account(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deletar estatísticas do jogo
  DELETE FROM public.game_stats WHERE user_id = user_uuid;
  
  -- Deletar sessões de jogo
  DELETE FROM public.game_sessions WHERE user_id = user_uuid;
  
  -- Deletar perfil
  DELETE FROM public.profiles WHERE id = user_uuid;
  
  -- Deletar usuário da auth (isso cascateará outras dependências)
  DELETE FROM auth.users WHERE id = user_uuid;
END;
$$;

-- Conceder permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Criar política RLS para permitir que usuários deletem apenas suas próprias contas
CREATE POLICY "Users can delete their own account" ON auth.users
FOR DELETE USING (auth.uid() = id);
