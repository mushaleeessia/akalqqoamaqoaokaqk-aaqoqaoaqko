import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InfinityWordData {
  word: string;
  generatedAt: string;
}

export const useInfinityMode = () => {
  const [currentWord, setCurrentWord] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateRandomWord = useCallback(async (): Promise<string> => {
    setLoading(true);
    
    try {
      // Lista de palavras para o modo infinity
      const infinityWords = [
        'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
        'lugar', 'casos', 'vidas', 'modos', 'aguas', 'fogos', 'vento',
        'noite', 'morte', 'homem', 'filho', 'casas', 'porta',
        'mesas', 'livro', 'papel', 'bocas', 'olhos', 'dente', 'braco',
        'perna', 'corpo', 'pazes', 'forca', 'poder', 'ordem', 'uniao', 
        'festa', 'jogos', 'artes', 'obras', 'nomes', 'ideia', 'plano', 
        'sorte', 'calor', 'frios', 'verde', 'azuis', 'preto', 'carro', 
        'aviao', 'ponte', 'radio', 'danca', 'filme', 'banco', 'praia',
        'campo', 'pedra', 'metal', 'vidro', 'amava', 'vivia', 'sabia', 
        'podia', 'fazia', 'dizia', 'subiu', 'andou', 'pulou', 'nadou',
        'comeu', 'bebeu', 'falou', 'ouviu', 'vendo', 'olhou', 'tocou', 
        'pegou', 'abriu', 'ligou', 'parou', 'perdeu', 'jogou', 'lendo',
        'cantou', 'rindo', 'chorou', 'escola', 'amigo', 'sonho', 'espaco',
        'musica', 'dentes', 'cabeca', 'cabelo', 'rosto', 'smile', 'feliz',
        'triste', 'bravo', 'calmo', 'doce', 'salgado', 'quente', 'gelado'
      ];

      // Gerar um índice aleatório baseado no timestamp para garantir aleatoriedade
      const randomSeed = Date.now() + Math.random() * 1000;
      const randomIndex = Math.floor(randomSeed) % infinityWords.length;
      const selectedWord = infinityWords[randomIndex];

      setCurrentWord(selectedWord);
      
      // Salvar a palavra gerada no localStorage para o modo infinity
      const wordData: InfinityWordData = {
        word: selectedWord,
        generatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('termo-infinity-word', JSON.stringify(wordData));
      
      return selectedWord;
    } catch (error) {
      console.error('Erro ao gerar palavra para modo infinity:', error);
      // Fallback para uma palavra padrão
      const fallbackWord = 'mundo';
      setCurrentWord(fallbackWord);
      return fallbackWord;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentWord = useCallback((): string => {
    if (currentWord) return currentWord;

    // Tentar carregar palavra existente do localStorage
    const storedData = localStorage.getItem('termo-infinity-word');
    if (storedData) {
      try {
        const wordData: InfinityWordData = JSON.parse(storedData);
        setCurrentWord(wordData.word);
        return wordData.word;
      } catch (error) {
        console.error('Erro ao carregar palavra do infinity mode:', error);
      }
    }

    // Se não há palavra armazenada, gerar uma nova
    generateRandomWord();
    return currentWord || 'mundo';
  }, [currentWord, generateRandomWord]);

  const clearInfinityData = useCallback(() => {
    localStorage.removeItem('termo-infinity-word');
    localStorage.removeItem('termo-infinity-session');
    setCurrentWord('');
  }, []);

  return {
    currentWord,
    loading,
    generateRandomWord,
    getCurrentWord,
    clearInfinityData
  };
};