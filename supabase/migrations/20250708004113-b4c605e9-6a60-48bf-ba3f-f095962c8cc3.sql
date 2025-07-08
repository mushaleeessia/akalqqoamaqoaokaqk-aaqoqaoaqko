-- Habilitar a extensão unaccent
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Criar tabela para palavras portuguesas válidas
CREATE TABLE public.portuguese_words (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word text NOT NULL UNIQUE,
  word_normalized text NOT NULL, -- palavra sem acentos para busca rápida
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_portuguese_words_word ON public.portuguese_words (word);
CREATE INDEX idx_portuguese_words_word_normalized ON public.portuguese_words (word_normalized);

-- RLS políticas (permitir leitura para todos, escrita apenas para admin)
ALTER TABLE public.portuguese_words ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "Anyone can read words" 
ON public.portuguese_words 
FOR SELECT 
USING (true);

-- Apenas o admin pode modificar palavras (usando o ID da aleeessia)
CREATE POLICY "Only admin can modify words" 
ON public.portuguese_words 
FOR ALL 
USING (auth.uid() = 'bedf5a3e-ea52-4ba1-bcb4-5e748f4d9654'::uuid);

-- Função para normalizar palavras (remover acentos)
CREATE OR REPLACE FUNCTION public.normalize_word(input_word text)
RETURNS text AS $$
BEGIN
  RETURN lower(unaccent(input_word));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para atualizar word_normalized automaticamente
CREATE OR REPLACE FUNCTION public.update_word_normalized()
RETURNS TRIGGER AS $$
BEGIN
  NEW.word_normalized = public.normalize_word(NEW.word);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_word_normalized
  BEFORE INSERT OR UPDATE ON public.portuguese_words
  FOR EACH ROW
  EXECUTE FUNCTION public.update_word_normalized();

-- Inserir palavras base do sistema atual
INSERT INTO public.portuguese_words (word) VALUES
-- Palavras críticas que estavam no código
('olhos'), ('dentes'), ('bracos'), ('pernas'), ('cabecas'), ('corpos'), ('aguas'), ('fogos'), ('ventos'),
('noites'), ('mortes'), ('homens'), ('mulheres'), ('filhos'), ('casas'), ('portas'), ('mesas'), ('livros'),
('papeis'), ('bocas'), ('amores'), ('guerras'), ('forcas'), ('poderes'), ('ordens'), ('festas'), ('jogos'),
('artes'), ('obras'), ('nomes'), ('ideias'), ('planos'), ('sortes'), ('calores'), ('frios'), ('verdes'),
('azuis'), ('pretos'), ('brancos'), ('carros'), ('avioes'), ('pontes'), ('radios'), ('musicas'), ('dancas'),
('filmes'), ('bancos'), ('praias'), ('campos'), ('flores'), ('arvores'), ('pedras'), ('metais'), ('vidros'),
('navio'), ('termo'), ('palavra'), ('jogo'), ('casa'), ('vida'), ('tempo'), ('mundo'), ('amor'), ('terra'),
('agua'), ('água'), ('fogo'), ('vento'), ('luz'), ('noite'), ('sol'), ('lua'), ('mar'), ('rio'), ('monte'),
('pedra'), ('arvore'), ('árvore'), ('flor'), ('fruto'), ('folha'), ('raiz'), ('broto'), ('animal'), ('gato'), ('cao'), ('cão'),
-- Palavras mencionadas pelo usuário
('unico'), ('único'), ('unica'), ('única'), ('uniao'), ('união'), ('tunel'), ('túnel'),
-- Palavras comuns adicionais
('pessoa'), ('homem'), ('mulher'), ('filho'), ('filha'), ('pai'), ('mãe'), ('amigo'), ('livro'),
('amar'), ('viver'), ('saber'), ('fazer'), ('dizer'), ('partir'), ('chegar'), ('voltar'),
('entrar'), ('sair'), ('correr'), ('andar'), ('voar'), ('nadar'), ('dormir'), ('comer');