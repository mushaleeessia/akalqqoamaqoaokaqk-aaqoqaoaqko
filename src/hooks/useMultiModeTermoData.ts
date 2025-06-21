
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
  const [gameStartDate, setGameStartDate] = useState<string>('');

  const getTodayDateBrasilia = () => {
    const now = new Date();
    const brasiliaOffset = -3 * 60;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
    return brasiliaTime.toISOString().split('T')[0];
  };

  const validateWordLength = (words: string[]): string[] => {
    return words.filter(word => word.length === 5);
  };

  const rawSeedWords = [
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
    'lugar', 'casos', 'vidas', 'modos', 'aguas', 'fogos', 'vento',
    'noite', 'morte', 'homem', 'filho', 'casas', 'porta',
    'mesas', 'livro', 'papel', 'bocas', 'olhos', 'dente', 'braco',
    'perna', 'corpo', 'pazes', 'forca',
    'poder', 'ordem', 'uniao', 'festa', 'jogos',
    'artes', 'obras', 'nomes', 'ideia', 'plano', 'sorte', 'calor',
    'frios', 'verde', 'azuis', 'preto', 'carro', 'aviao',
    'ponte', 'radio', 'danca', 'filme', 'banco', 'praia',
    'campo', 'pedra', 'metal', 'vidro',
    'amava', 'vivia', 'sabia', 'podia', 'fazia', 'dizia',
    'subiu', 'andou', 'pulou', 'nadou',
    'comeu', 'bebeu', 'falou', 'ouviu', 'vendo', 'olhou',
    'tocou', 'pegou', 'abriu', 'ligou', 'parou',
    'perdeu', 'jogou', 'lendo',
    'cantou', 'rindo', 'chorou'
  ];

  const seedWords = validateWordLength(rawSeedWords);

  const generateWordsForMode = (mode: GameMode, date: string): string[] => {
    if (seedWords.length === 0) {
      return ['mundo'];
    }
    
    const wordCount = mode === 'solo' ? 1 : mode === 'duo' ? 2 : mode === 'trio' ? 3 : 4;
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const dateNumbers = date.split('-').map(num => parseInt(num));
      const seed = dateNumbers[0] + dateNumbers[1] * 31 + dateNumbers[2] * 365 + i + 
                   (mode === 'solo' ? 0 : mode === 'duo' ? 100 : mode === 'trio' ? 200 : 300);
      
      let hash = seed;
      hash = ((hash << 5) - hash + seed) & 0xffffffff;
      hash = Math.abs(hash);
      
      const wordIndex = hash % seedWords.length;
      words.push(seedWords[wordIndex]);
    }
    
    return words;
  };

  const clearAllMultiModeData = () => {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('termo-daily-words-') || 
        key.startsWith('termo-session-duo-') ||
        key.startsWith('termo-session-trio-') ||
        key.startsWith('termo-session-quarteto-') ||
        key.startsWith('termo-multi-session-')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('termo_duo_') || cookieName.startsWith('termo_trio_') || 
          cookieName.startsWith('termo_quarteto_') || cookieName.startsWith('termo_multi_')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  const forceNewWords = (date: string): Record<GameMode, string[]> => {
    clearAllMultiModeData();
    
    const newWordsData: Record<GameMode, string[]> = {
      solo: [],
      duo: [],
      trio: [],
      quarteto: []
    };

    (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
      const words = generateWordsForMode(mode, date);
      const wordData = {
        date: date,
        words: words,
        generated: new Date().toISOString()
      };
      
      localStorage.setItem(`termo-daily-words-${mode}`, JSON.stringify(wordData));
      newWordsData[mode] = words;
    });
    
    return newWordsData;
  };

  const loadOrGenerateWords = (date: string): Record<GameMode, string[]> => {
    const wordsData: Record<GameMode, string[]> = {
      solo: [],
      duo: [],
      trio: [],
      quarteto: []
    };

    let needsGeneration = false;

    (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
      const storedData = localStorage.getItem(`termo-daily-words-${mode}`);
      
      if (storedData) {
        try {
          const wordData = JSON.parse(storedData);
          if (wordData.date === date && wordData.words && wordData.words.length > 0) {
            wordsData[mode] = wordData.words;
          } else {
            needsGeneration = true;
          }
        } catch (error) {
          needsGeneration = true;
        }
      } else {
        needsGeneration = true;
      }
    });

    if (needsGeneration) {
      (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
        const words = generateWordsForMode(mode, date);
        const wordData = {
          date: date,
          words: words,
          generated: new Date().toISOString()
        };
        
        localStorage.setItem(`termo-daily-words-${mode}`, JSON.stringify(wordData));
        wordsData[mode] = words;
      });
    }

    return wordsData;
  };

  useEffect(() => {
    const loadWords = () => {
      const today = getTodayDateBrasilia();
      const words = loadOrGenerateWords(today);
      setWordsData(words);
      setGameStartDate(today);
      setLoading(false);
    };

    loadWords();

    // Só atualizar palavras se não há jogos em andamento
    const interval = setInterval(() => {
      const currentDate = getTodayDateBrasilia();
      
      const hasActiveGame = (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).some(mode => {
        const sessionData = localStorage.getItem(`termo-multi-session-${mode}`);
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            return session.gameStatus === 'playing' && session.guesses && session.guesses.length > 0;
          } catch {
            return false;
          }
        }
        return false;
      });

      if (!hasActiveGame && gameStartDate !== currentDate) {
        const updatedWords = loadOrGenerateWords(currentDate);
        setWordsData(updatedWords);
        setGameStartDate(currentDate);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [gameStartDate]);

  return { 
    wordsData, 
    loading
  };
};
