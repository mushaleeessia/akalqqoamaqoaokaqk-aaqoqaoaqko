import { useState, useEffect } from 'react';

export const useTermoData = () => {
  const [todayWord, setTodayWord] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const getTodayDateBrasilia = () => {
    const now = new Date();
    const brasiliaOffset = -3 * 60;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const brasiliaTime = new Date(utc + brasiliaOffset * 60000);
    return brasiliaTime.toISOString().split('T')[0];
  };

  const seedWords = [
    'mundo','terra','tempo','valor','ponto','grupo','parte','forma',
    'lugar', 'modo', 'vento','noite',
    'morte','homem','mulher','filho', 'porta','livro','papel',
    'boca','olhos','dente','braco','perna','cabeca','corpo','guerra',
    'forca','poder','ordem','uniao','festa','ideia','plano','sorte',
    'calor','verde', 'preto','branco','carro','aviao','ponte',
    'radio','musica','danca','filme','banco','praia','campo','arvore',
    'pedra','metal','chuva','viveu','soube','disse','grande','velho','baixo'
  ];

  const generateDailyWord = (date: string): string => {
    const [year, month, day] = date.split('-').map(n => parseInt(n, 10));
    let hash = year + month * 31 + day * 365;
    hash = ((hash << 5) - hash + hash) & 0xffffffff;
    hash = Math.abs(hash);
    return seedWords[hash % seedWords.length];
  };

  const clearAllGameData = () => {
    // localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('termo-session-') ||
        key.startsWith('termo-daily-') ||
        key.startsWith('termo-solo-session-') ||
        key.startsWith('termo-multi-session-')
      )) {
        localStorage.removeItem(key);
      }
    }
    // cookies
    document.cookie
      .split(';')
      .forEach(c => {
        const name = c.split('=')[0].trim();
        if (name.startsWith('termo_')) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      });
  };

  const forceNewWord = (date: string): string => {
    clearAllGameData();
    const newWord = generateDailyWord(date);
    const payload = {
      date,
      word: newWord,
      generated: new Date().toISOString()
    };
    localStorage.setItem('termo-daily-word', JSON.stringify(payload));
    return newWord;
  };

  useEffect(() => {
    const today = getTodayDateBrasilia();
    const stored = localStorage.getItem('termo-daily-word');

    if (stored) {
      try {
        const { date, word } = JSON.parse(stored);
        if (date === today) {
          // reutiliza a palavra salva
          setTodayWord(word);
        } else {
          // data antiga → força nova
          setTodayWord(forceNewWord(today));
        }
      } catch {
        // parse falhou → força nova
        setTodayWord(forceNewWord(today));
      }
    } else {
      // nunca jogou hoje → força nova
      setTodayWord(forceNewWord(today));
    }

    setLoading(false);

    // checagem de mudança de dia
    const interval = setInterval(() => {
      const nowDate = getTodayDateBrasilia();
      const item = localStorage.getItem('termo-daily-word');
      if (item) {
        try {
          const { date } = JSON.parse(item);
          if (date !== nowDate) {
            setTodayWord(forceNewWord(nowDate));
          }
        } catch {
          setTodayWord(forceNewWord(nowDate));
        }
      } else {
        setTodayWord(forceNewWord(nowDate));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { todayWord, loading };
};
