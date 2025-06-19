import { useState, useEffect } from 'react';

export const useTermoData = () => {
  const [todayWord, setTodayWord] = useState<string>('');
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

  // Lista expandida de palavras de 5 letras em português incluindo verbos
  const seedWords = [
    // Substantivos
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
    'lugar', 'caso', 'vida', 'modo', 'agua', 'fogo', 'vento',
    'noite', 'morte', 'homem', 'mulher', 'filho', 'casa', 'porta',
    'livro', 'papel', 'boca', 'olhos', 'dente', 'braco',
    'perna', 'cabeca', 'corpo', 'guerra', 'forca',
    'poder', 'ordem', 'uniao', 'festa',
    'ideia', 'plano', 'sorte', 'calor',
    'verde', 'azul', 'preto', 'branco', 'carro', 'aviao',
    'ponte', 'radio', 'musica', 'danca', 'filme', 'banco', 'praia',
    'campo', 'arvore', 'pedra', 'metal', 'chuva',
    // Verbos conjugados (presente/passado)
    'viveu', 'soube', 'disse',
    // Adjetivos
    'grande', 'velho', 'baixo'
  ];

  const generateDailyWord = (date: string): string => {
    // Usar a data como seed para garantir determinismo
    const dateNumbers = date.split('-').map(num => parseInt(num));
    const seed = dateNumbers[0] + dateNumbers[1] * 31 + dateNumbers[2] * 365;
    
    // Algoritmo de hash simples para distribuição mais uniforme
    let hash = seed;
    hash = ((hash << 5) - hash + seed) & 0xffffffff;
    hash = Math.abs(hash);
    
    const wordIndex = hash % seedWords.length;
    return seedWords[wordIndex];
  };

  const clearAllGameData = (currentDate: string) => {
    const keysToRemove: string[] = [];
    
    // Encontrar todas as chaves relacionadas ao jogo
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
    
    // Remover TODAS as chaves antigas (forçar reset completo)
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpar TODOS os cookies do termo
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('termo_')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  const forceNewWord = (date: string) => {
    console.log(`n-frc-wrd`);
    
    // Limpar cache antigo
    clearAllGameData(date);
    
    // Gerar nova palavra
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
      
      // SEMPRE forçar nova palavra no primeiro carregamento após meia-noite
      const newWord = forceNewWord(today);
      setTodayWord(newWord);
      setLoading(false);
    };

    loadTodayWord();

    // Verificar a cada minuto se mudou o dia
    const interval = setInterval(() => {
      const currentDate = getTodayDateBrasilia();
      const storedData = localStorage.getItem('termo-daily-word');
      
      if (storedData) {
        try {
          const wordData = JSON.parse(storedData);
          if (wordData.date !== currentDate) {
            console.log('🌅 Detectada mudança de dia SOLO, atualizando palavra');
            const newWord = forceNewWord(currentDate);
            setTodayWord(newWord);
          }
        } catch (error) {
          console.error('Erro na verificação periódica SOLO:', error);
        }
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  return { 
    todayWord, 
    loading
  };
};
