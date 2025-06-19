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
    // Criar data atual em UTC
    const now = new Date();
    // Converter para horário de Brasília (UTC-3)
    const brasiliaOffset = -3 * 60; // -3 horas em minutos
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const brasiliaTime = new Date(utc + (brasiliaOffset * 60000));
    
    // Formatear como YYYY-MM-DD
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
      const dateNumbers = date.split('-').map(num => parseInt(num));
      const seed = dateNumbers[0] + dateNumbers[1] * 31 + dateNumbers[2] * 365 + i + (mode === 'solo' ? 0 : mode === 'duo' ? 100 : mode === 'trio' ? 200 : 300);
      
      // Algoritmo de hash simples para distribuição mais uniforme
      let hash = seed;
      hash = ((hash << 5) - hash + seed) & 0xffffffff;
      hash = Math.abs(hash);
      
      const wordIndex = hash % seedWords.length;
      words.push(seedWords[wordIndex]);
    }
    
    return words;
  };

  const clearAllMultiModeData = (currentDate: string) => {
    const keysToRemove: string[] = [];
    
    // Encontrar todas as chaves relacionadas aos modos multi
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith('termo-daily-words-') || 
        key.startsWith('termo-session-duo-') ||
        key.startsWith('termo-session-trio-') ||
        key.startsWith('termo-session-quarteto-') ||
        key.startsWith('termo-multi-session-')
      )) {
        // Se não for da data atual, remover
        if (!key.includes(currentDate)) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remover chaves antigas
    keysToRemove.forEach(key => {
      console.log(`Removendo cache multi-mode antigo: ${key}`);
      localStorage.removeItem(key);
    });

    // Limpar cookies antigos também
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if ((cookieName.startsWith('termo_duo_') || cookieName.startsWith('termo_trio_') || cookieName.startsWith('termo_quarteto_')) && 
          !cookieName.includes(currentDate.replace(/-/g, '_'))) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  const forceNewWords = (date: string) => {
    console.log(`Forçando novas palavras multi-mode para ${date}`);
    
    // Limpar cache antigo
    clearAllMultiModeData(date);
    
    const newWordsData: Record<GameMode, string[]> = {
      solo: [],
      duo: [],
      trio: [],
      quarteto: []
    };

    // Gerar palavras para cada modo
    (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
      const words = generateWordsForMode(mode, date);
      const wordData = {
        date: date,
        words: words,
        generated: new Date().toISOString()
      };
      
      console.log(`Novas palavras ${mode} geradas: ${words.join(', ')} para ${date}`);
      localStorage.setItem(`termo-daily-words-${mode}`, JSON.stringify(wordData));
      newWordsData[mode] = words;
    });
    
    return newWordsData;
  };

  useEffect(() => {
    const loadWords = () => {
      const today = getTodayDateBrasilia();
      console.log(`Data atual em Brasília (multi-mode): ${today}`);
      
      let needsUpdate = false;
      const newWordsData: Record<GameMode, string[]> = {
        solo: [],
        duo: [],
        trio: [],
        quarteto: []
      };

      // Verificar cada modo
      (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
        const storedData = localStorage.getItem(`termo-daily-words-${mode}`);
        
        if (storedData) {
          try {
            const wordData = JSON.parse(storedData);
            
            // Se a data mudou, marcar para atualização
            if (wordData.date !== today) {
              console.log(`Data mudou de ${wordData.date} para ${today} no modo ${mode}`);
              needsUpdate = true;
            } else {
              console.log(`Usando palavras existentes para ${mode}: ${wordData.words.join(', ')}`);
              newWordsData[mode] = wordData.words;
            }
          } catch (error) {
            console.error(`Erro ao processar dados salvos do modo ${mode}:`, error);
            needsUpdate = true;
          }
        } else {
          // Primeira vez para este modo
          console.log(`Primeira execução para modo ${mode}`);
          needsUpdate = true;
        }
      });

      // Se algum modo precisa de atualização, atualizar todos
      if (needsUpdate) {
        const updatedWords = forceNewWords(today);
        setWordsData(updatedWords);
      } else {
        setWordsData(newWordsData);
      }
      
      setLoading(false);
    };

    loadWords();

    // Verificar a cada minuto se mudou o dia
    const interval = setInterval(() => {
      const currentDate = getTodayDateBrasilia();
      
      // Verificar se algum modo tem data diferente da atual
      let needsUpdate = false;
      (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
        const storedData = localStorage.getItem(`termo-daily-words-${mode}`);
        if (storedData) {
          try {
            const wordData = JSON.parse(storedData);
            if (wordData.date !== currentDate) {
              needsUpdate = true;
            }
          } catch (error) {
            console.error(`Erro na verificação periódica do modo ${mode}:`, error);
            needsUpdate = true;
          }
        }
      });

      if (needsUpdate) {
        console.log('Detectada mudança de dia para modos multi, atualizando palavras');
        const updatedWords = forceNewWords(currentDate);
        setWordsData(updatedWords);
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  return { 
    wordsData, 
    loading
  };
};
