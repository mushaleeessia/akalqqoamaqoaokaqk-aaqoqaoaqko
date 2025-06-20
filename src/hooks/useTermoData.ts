

import { useState, useEffect } from 'react';

export const useTermoData = () => {
  const [todayWord, setTodayWord] = useState<string>('');
  const [loading, setLoading] = useState(true);

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
    'campo', 'pedra', 'metal', 'vidro', 'papel',
    'amava', 'vivia', 'sabia', 'podia', 'fazia', 'dizia',
    'subiu', 'andou', 'pulou', 'voous', 'nadou',
    'comeu', 'bebeu', 'falou', 'ouviu', 'vendo', 'olhou',
    'tocou', 'pegou', 'abriu', 'ligou', 'parou',
    'ganhou', 'perdeu', 'jogou', 'lendo',
    'cantou', 'rindo', 'chorou'
  ];

  const seedWords = validateWordLength(rawSeedWords);

  const generateDailyWord = (date: string): string => {
    if (seedWords.length === 0) {
      return 'mundo';
    }
    
    const dateNumbers = date.split('-').map(num => parseInt(num));
    const seed = dateNumbers[0] + dateNumbers[1] * 31 + dateNumbers[2] * 365;
    
    let hash = seed;
    hash = ((hash << 5) - hash + seed) & 0xffffffff;
    hash = Math.abs(hash);
    
    const wordIndex = hash % seedWords.length;
    return seedWords[wordIndex];
  };

  const clearAllGameData = () => {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('termo-session-') || 
        key.startsWith('termo-daily-') ||
        key.startsWith('termo-solo-session-') ||
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
      if (cookieName.startsWith('termo_')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  const forceNewWord = (date: string): string => {
    clearAllGameData();
    
    const newWord = generateDailyWord(date);
    
    const wordData = {
      date: date,
      word: newWord,
      generated: new Date().toISOString()
    };
    
    localStorage.setItem('termo-daily-word', JSON.stringify(wordData));
    return newWord;
  };

  const loadOrGenerateWord = (date: string): string => {
    const storedData = localStorage.getItem('termo-daily-word');
    
    if (storedData) {
      try {
        const wordData = JSON.parse(storedData);
        if (wordData.date === date && wordData.word) {
          return wordData.word;
        }
      } catch (error) {
        // Dados corrompidos, gerar nova palavra
      }
    }
    
    const newWord = generateDailyWord(date);
    const wordData = {
      date: date,
      word: newWord,
      generated: new Date().toISOString()
    };
    
    localStorage.setItem('termo-daily-word', JSON.stringify(wordData));
    return newWord;
  };

  useEffect(() => {
    const loadTodayWord = () => {
      const today = getTodayDateBrasilia();
      const word = loadOrGenerateWord(today);
      setTodayWord(word);
      setLoading(false);
    };

    loadTodayWord();

    const interval = setInterval(() => {
      const currentDate = getTodayDateBrasilia();
      const storedData = localStorage.getItem('termo-daily-word');
      
      if (storedData) {
        try {
          const wordData = JSON.parse(storedData);
          if (wordData.date !== currentDate) {
            const newWord = loadOrGenerateWord(currentDate);
            setTodayWord(newWord);
          }
        } catch (error) {
          const newWord = loadOrGenerateWord(currentDate);
          setTodayWord(newWord);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.altKey && 
          event.key.toLowerCase() === 'r') {
        
        const keys = ['r', 'e', 's', 't'];
        let keySequence = '';
        
        const keyHandler = (e: KeyboardEvent) => {
          if (event.ctrlKey && event.shiftKey && event.altKey) {
            keySequence += e.key.toLowerCase();
            
            if (keySequence === 'rest') {
              const today = getTodayDateBrasilia();
              const newWord = forceNewWord(today);
              setTodayWord(newWord);
              window.location.reload();
            }
          } else {
            keySequence = '';
            window.removeEventListener('keydown', keyHandler);
          }
        };
        
        window.addEventListener('keydown', keyHandler);
        
        setTimeout(() => {
          window.removeEventListener('keydown', keyHandler);
        }, 3000);
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, []);

  return { 
    todayWord, 
    loading
  };
};

