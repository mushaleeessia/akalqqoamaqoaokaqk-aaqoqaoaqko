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
    'mesa', 'livro', 'papel', 'boca', 'olhos', 'dente', 'braco',
    'perna', 'cabeca', 'corpo', 'amor', 'paz', 'guerra', 'forca',
    'poder', 'direito', 'ordem', 'uniao', 'festa', 'jogo',
    'arte', 'obra', 'nome', 'ideia', 'plano', 'sorte', 'calor',
    'frio', 'verde', 'azul', 'preto', 'branco', 'carro', 'aviao',
    'ponte', 'radio', 'musica', 'danca', 'filme', 'banco', 'praia',
    'campo', 'flor', 'arvore', 'pedra', 'metal', 'chuva', 'sol',
    // Verbos infinitivos
    'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer',
    'partir', 'chegar', 'voltar', 'entrar', 'sair', 'subir', 'descer',
    'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar', 'dormir',
    'comer', 'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir',
    'tocar', 'pegar', 'soltar', 'abrir', 'fechar', 'ligar', 'parar',
    'comecar', 'acabar', 'ganhar', 'perder', 'jogar', 'ler',
    'escrever', 'cantar', 'dancar', 'rir', 'chorar', 'gritar',
    // Verbos conjugados (presente/passado)
    'amou', 'viveu', 'morreu', 'soube', 'pode', 'disse', 'partiu',
    'chegou', 'voltou', 'entrou', 'saiu', 'subiu', 'desceu', 'correu',
    'andou', 'saltou', 'pulou', 'voou', 'nadou', 'dormiu', 'comeu',
    'bebeu', 'falou', 'ouviu', 'viu', 'olhou', 'sentiu', 'tocou',
    'pegou', 'soltou', 'abriu', 'fechou', 'ligou', 'parou', 'ganhou',
    'perdeu', 'jogou', 'leu', 'cantou', 'dancou', 'riu', 'chorou',
    // Adjetivos
    'belo', 'feio', 'grande', 'pequeno', 'novo', 'velho', 'alto', 'baixo'
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
    console.log('🧹 LIMPEZA FORÇADA DE CACHE - MODO SOLO');
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
      console.log(`🗑️ Removendo cache: ${key}`);
      localStorage.removeItem(key);
    });

    // Limpar TODOS os cookies do termo
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('termo_')) {
        console.log(`🍪 Removendo cookie: ${cookieName}`);
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  const forceNewWord = (date: string) => {
    console.log(`🔄 FORÇANDO nova palavra SOLO para ${date}`);
    
    // Limpar cache antigo
    clearAllGameData(date);
    
    // Gerar nova palavra
    const newWord = generateDailyWord(date);
    
    const wordData = {
      date: date,
      word: newWord,
      generated: new Date().toISOString()
    };
    
    console.log(`✨ Nova palavra SOLO gerada: ${newWord} para ${date}`);
    localStorage.setItem('termo-daily-word', JSON.stringify(wordData));
    
    return newWord;
  };

  useEffect(() => {
    const loadTodayWord = () => {
      const today = getTodayDateBrasilia();
      console.log(`📅 Data atual em Brasília (SOLO): ${today}`);
      
      // SEMPRE forçar nova palavra no primeiro carregamento após meia-noite
      console.log('🚀 FORÇANDO reset completo no carregamento');
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
