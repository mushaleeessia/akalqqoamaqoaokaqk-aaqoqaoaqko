
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
        // Se não for da data atual, remover
        if (!key.includes(currentDate)) {
          keysToRemove.push(key);
        }
      }
    }
    
    // Remover chaves antigas
    keysToRemove.forEach(key => {
      console.log(`Removendo cache antigo: ${key}`);
      localStorage.removeItem(key);
    });

    // Limpar cookies antigos também
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('termo_') && !cookieName.includes(currentDate.replace(/-/g, '_'))) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
  };

  const forceNewWord = (date: string) => {
    console.log(`Forçando nova palavra para ${date}`);
    
    // Limpar cache antigo
    clearAllGameData(date);
    
    // Gerar nova palavra
    const newWord = generateDailyWord(date);
    
    const wordData = {
      date: date,
      word: newWord,
      generated: new Date().toISOString()
    };
    
    console.log(`Nova palavra gerada: ${newWord} para ${date}`);
    localStorage.setItem('termo-daily-word', JSON.stringify(wordData));
    
    return newWord;
  };

  useEffect(() => {
    const loadTodayWord = () => {
      const today = getTodayDateBrasilia();
      console.log(`Data atual em Brasília: ${today}`);
      
      // Verificar se já temos uma palavra para hoje
      const storedData = localStorage.getItem('termo-daily-word');
      
      if (storedData) {
        try {
          const wordData = JSON.parse(storedData);
          
          // Se a data mudou, forçar nova palavra
          if (wordData.date !== today) {
            console.log(`Data mudou de ${wordData.date} para ${today}, gerando nova palavra`);
            const newWord = forceNewWord(today);
            setTodayWord(newWord);
          } else {
            console.log(`Usando palavra existente: ${wordData.word}`);
            setTodayWord(wordData.word);
          }
        } catch (error) {
          console.error('Erro ao processar dados salvos:', error);
          const newWord = forceNewWord(today);
          setTodayWord(newWord);
        }
      } else {
        // Primeira vez, gerar palavra
        console.log('Primeira execução, gerando palavra');
        const newWord = forceNewWord(today);
        setTodayWord(newWord);
      }
      
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
            console.log('Detectada mudança de dia, atualizando palavra');
            const newWord = forceNewWord(currentDate);
            setTodayWord(newWord);
          }
        } catch (error) {
          console.error('Erro na verificação periódica:', error);
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
