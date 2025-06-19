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
    const brasiliaOffset = -3 * 60; // UTC-3 in minutes
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 60000);
    return brasiliaTime.toISOString().split('T')[0];
  };

  // Todas as palavras têm exatamente 5 letras
  const seedWords = [
    'mundo','terra','tempo','valor','ponto','grupo','parte','forma',
    'lugar','casos','vidas','modos','aguas','fogos','vento','noite',
    'morte','homem','filho','casas','porta','mesas','livro','papel',
    'bocas','olhos','dente','braco','perna','corpo','pazes','forca',
    'poder','ordem','uniao','festa','jogos','artes','obras','nomes',
    'ideia','plano','sorte','calor','frios','verde','azuis','preto',
    'carro','aviao','ponte','radio','danca','filme','banco','praia',
    'campo','pedra','metal','vidro','amava','vivia','sabia','podia',
    'fazia','dizia','saius','subiu','andou','pulou','nadou','comeu',
    'bebeu','falou','ouviu','vendo','olhou','tocou','pegou','abriu',
    'ligou','parou','acaba','jogou','andar','viver','falar','beber',
    'comer','ouvir','criar','mudar','jogar','pular','ferir','fugir',
    'salto','barco','poema','media','gerar','musgo','amado','brisa',
    'nozes','igual','jovem','solar'
  ];

  const generateWordsForMode = (mode: GameMode, date: string): string[] => {
    const wordCount = mode === 'solo'
      ? 1
      : mode === 'duo'
      ? 2
      : mode === 'trio'
      ? 3
      : 4;
    const words: string[] = [];

    for (let i = 0; i < wordCount; i++) {
      const [year, month, day] = date.split('-').map(n => parseInt(n, 10));
      const baseSeed =
        year +
        month * 31 +
        day * 365 +
        i +
        (mode === 'solo'
          ? 0
          : mode === 'duo'
          ? 100
          : mode === 'trio'
          ? 200
          : 300);
      let hash = baseSeed;
      hash = ((hash << 5) - hash + baseSeed) & 0xffffffff;
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
      if (
        key &&
        (key.startsWith('termo-daily-words-') ||
          key.startsWith('termo-session-duo-') ||
          key.startsWith('termo-session-trio-') ||
          key.startsWith('termo-session-quarteto-') ||
          key.startsWith('termo-multi-session-'))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(k => localStorage.removeItem(k));

    document.cookie
      .split(';')
      .forEach(c => {
        const name = c.split('=')[0].trim();
        if (
          name.startsWith('termo_duo_') ||
          name.startsWith('termo_trio_') ||
          name.startsWith('termo_quarteto_') ||
          name.startsWith('termo_multi_')
        ) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
  };

  const forceNewWords = (date: string) => {
    clearAllMultiModeData();
    const newData: Record<GameMode, string[]> = {
      solo: [],
      duo: [],
      trio: [],
      quarteto: []
    };

    (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
      const words = generateWordsForMode(mode, date);
      const payload = {
        date,
        words,
        generated: new Date().toISOString()
      };
      localStorage.setItem(`termo-daily-words-${mode}`, JSON.stringify(payload));
      newData[mode] = words;
    });

    return newData;
  };

  useEffect(() => {
    // Track pressed keys
    const pressedKeys = new Set<string>();

    const loadWords = () => {
      const today = getTodayDateBrasilia();
      const initial = forceNewWords(today);
      setWordsData(initial);
      setLoading(false);
    };

    loadWords();

    const interval = setInterval(() => {
      const currentDate = getTodayDateBrasilia();
      let needsReset = false;

      (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
        const item = localStorage.getItem(`termo-daily-words-${mode}`);
        if (item) {
          try {
            const parsed = JSON.parse(item);
            if (parsed.date !== currentDate) {
              needsReset = true;
            }
          } catch {
            needsReset = true;
          }
        }
      });

      if (needsReset) {
        const updated = forceNewWords(currentDate);
        setWordsData(updated);
      }
    }, 60000);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      pressedKeys.add(key);
      const combo = ['shift', 'control', 'alt', 'r', 'e', 's', 't'];
      if (combo.every(k => pressedKeys.has(k))) {
        const today = getTodayDateBrasilia();
        const forced = forceNewWords(today);
        setWordsData(forced);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    wordsData,
    loading
  };
};
