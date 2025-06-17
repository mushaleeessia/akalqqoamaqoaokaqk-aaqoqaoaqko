
import { useState, useEffect } from 'react';
import { GameMode } from '@/components/GameModeSelector';

export const useMultiModeTermoData = () => {
  const [wordsData, setWordsData] = useState<Record<GameMode, string[]>>({
    solo: [],
    duo: [],
    trio: [],
    quarteto: []
  });
  const [loading, setLoading] = useState(true);

  const getTodayDateBrasilia = () => {
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0];
  };

  // Todas as palavras têm exatamente 5 letras
  const seedWords = [
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
    'lugar', 'casos', 'vidas', 'modos', 'aguas', 'fogos', 'vento',
    'noite', 'morte', 'homem', 'mulher', 'filho', 'casas', 'porta',
    'mesas', 'livro', 'papel', 'bocas', 'olhos', 'dente', 'braco',
    'perna', 'cabeca', 'corpo', 'amores', 'pazes', 'guerra', 'forca',
    'poder', 'direito', 'ordem', 'uniao', 'festa', 'jogos',
    'artes', 'obras', 'nomes', 'ideia', 'plano', 'sorte', 'calor',
    'frios', 'verde', 'azuis', 'preto', 'branco', 'carro', 'aviao',
    'ponte', 'radio', 'musica', 'danca', 'filme', 'banco', 'praia',
    'campo', 'flores', 'arvore', 'pedra', 'metal', 'vidro', 'papel',
    'amava', 'vivia', 'morreu', 'sabia', 'podia', 'fazia', 'dizia',
    'partiu', 'chegou', 'voltou', 'entrou', 'saius', 'subiu', 'desceu',
    'correu', 'andou', 'saltou', 'pulou', 'voous', 'nadou', 'dormiu',
    'comeu', 'bebeu', 'falou', 'ouviu', 'vendo', 'olhou', 'sentiu',
    'tocou', 'pegou', 'soltou', 'abriu', 'fechou', 'ligou', 'parou',
    'comeca', 'acaba', 'ganhou', 'perdeu', 'jogou', 'lendo',
    'escreveu', 'cantou', 'dancou', 'rindo', 'chorou', 'gritou'
  ];

  const generateWordsForMode = (mode: GameMode, date: string): string[] => {
    const wordCount = mode === 'solo' ? 1 : mode === 'duo' ? 2 : mode === 'trio' ? 3 : 4;
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const seed = date.split('-').reduce((acc, num) => acc + parseInt(num), 0) + i + (mode === 'solo' ? 0 : mode === 'duo' ? 100 : mode === 'trio' ? 200 : 300);
      const wordIndex = seed % seedWords.length;
      words.push(seedWords[wordIndex]);
    }
    
    return words;
  };

  const clearModeData = (mode: GameMode, today: string) => {
    localStorage.removeItem(`termo-daily-words-${mode}`);
    localStorage.removeItem(`termo-session-${mode}-${today}`);
  };

  useEffect(() => {
    const loadWords = () => {
      const today = getTodayDateBrasilia();
      const newWordsData: Record<GameMode, string[]> = {
        solo: [],
        duo: [],
        trio: [],
        quarteto: []
      };

      (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
        clearModeData(mode, today);
        
        const words = generateWordsForMode(mode, today);
        const wordData = {
          date: today,
          words: words
        };
        
        localStorage.setItem(`termo-daily-words-${mode}`, JSON.stringify(wordData));
        newWordsData[mode] = words;
      });

      setWordsData(newWordsData);
      setLoading(false);
    };

    loadWords();
  }, []);

  return { 
    wordsData, 
    loading
  };
};
