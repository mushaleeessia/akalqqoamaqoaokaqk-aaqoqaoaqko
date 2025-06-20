
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

  const seedWords = [
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
    'lugar', 'caso', 'vida', 'modo', 'agua', 'fogo', 'vento',
    'noite', 'morte', 'homem', 'mulher', 'filho', 'casa', 'porta',
    'mesa', 'livro', 'papel', 'boca', 'olhos', 'dente', 'braco',
    'perna', 'cabeca', 'corpo', 'amor', 'paz', 'guerra', 'forca',
    'poder', 'direito', 'ordem', 'uniao', 'festa', 'jogo',
    'arte', 'obra', 'nome', 'ideia', 'plano', 'sorte', 'calor',
    'frio', 'verde', 'azul', 'preto', 'branco', 'carro', 'aviao',
    'ponte', 'radio', 'musica', 'danca', 'filme', 'banco', 'praia',
    'campo', 'flor', 'arvore', 'pedra', 'metal', 'chuva', 'sol',
    'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer',
    'partir', 'chegar', 'voltar', 'entrar', 'sair', 'subir', 'descer',
    'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar', 'dormir',
    'comer', 'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir',
    'tocar', 'pegar', 'soltar', 'abrir', 'fechar', 'ligar', 'parar',
    'comecar', 'acabar', 'ganhar', 'perder', 'jogar', 'ler',
    'escrever', 'cantar', 'dancar', 'rir', 'chorar', 'gritar',
    'amou', 'viveu', 'morreu', 'soube', 'pode', 'disse', 'partiu',
    'chegou', 'voltou', 'entrou', 'saiu', 'subiu', 'desceu', 'correu',
    'andou', 'saltou', 'pulou', 'voou', 'nadou', 'dormiu', 'comeu',
    'bebeu', 'falou', 'ouviu', 'viu', 'olhou', 'sentiu', 'tocou',
    'pegou', 'soltou', 'abriu', 'fechou', 'ligou', 'parou', 'ganhou',
    'perdeu', 'jogou', 'leu', 'cantou', 'dancou', 'riu', 'chorou',
    'belo', 'feio', 'grande', 'pequeno', 'novo', 'velho', 'alto', 'baixo'
  ];

  const generatePlayerIpHash = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ip = data.ip;
      
      let hash = 0;
      for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString();
    } catch (error) {
      const fallback = navigator.userAgent + screen.width + screen.height;
      let hash = 0;
      for (let i = 0; i < fallback.length; i++) {
        const char = fallback.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString();
    }
  };

  const generateDailyWord = (date: string): string => {
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
    
    // Gerar nova palavra apenas se não existir ou data diferente
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

    // Verificar mudança de dia a cada minuto
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

  // Atalho para reset forçado
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
