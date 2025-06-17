
import { useState, useEffect } from 'react';

export const useTermoData = () => {
  const [todayWord, setTodayWord] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const getTodayDateBrasilia = () => {
    // Criar data atual em UTC
    const now = new Date();
    // Ajustar para horário de Brasília (UTC-3)
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // Lista de palavras de 5 letras em português para usar como seed
  const seedWords = [
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
    'lugar', 'caso', 'mão', 'vida', 'modo', 'água', 'fogo', 'vento',
    'noite', 'morte', 'homem', 'mulher', 'filho', 'casa', 'porta',
    'mesa', 'livro', 'papel', 'boca', 'olhos', 'dente', 'braço',
    'perna', 'cabeça', 'corpo', 'amor', 'paz', 'guerra', 'força',
    'poder', 'direito', 'lei', 'ordem', 'união', 'festa', 'jogo',
    'arte', 'obra', 'nome', 'ideia', 'plano', 'sorte', 'calor',
    'frio', 'verde', 'azul', 'preto', 'branco', 'grande', 'pequeno',
    'carro', 'avião', 'ponte', 'rádio', 'música', 'dança', 'filme',
    'banco', 'praia', 'campo', 'flor', 'árvore', 'pedra', 'metal'
  ];

  const generateDailyWord = async (date: string): Promise<string> => {
    // Usar a data como seed para garantir que a mesma palavra seja gerada no mesmo dia
    const seed = date.split('-').reduce((acc, num) => acc + parseInt(num), 0);
    const wordIndex = seed % seedWords.length;
    const selectedWord = seedWords[wordIndex];
    
    try {
      // Tentar validar a palavra na API
      const response = await fetch(`https://api.dicionario-aberto.net/word/${selectedWord}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return selectedWord;
        }
      }
      
      // Se a API falhar, usar a palavra do seed mesmo assim
      return selectedWord;
    } catch (error) {
      return selectedWord;
    }
  };

  useEffect(() => {
    const loadTodayWord = async () => {
      const today = getTodayDateBrasilia();
      
      // Limpar cache antigo e forçar nova palavra
      localStorage.removeItem('termo-daily-word');
      
      // Gerar nova palavra para hoje
      try {
        const word = await generateDailyWord(today);
        const wordData = {
          date: today,
          word: word
        };
        
        localStorage.setItem('termo-daily-word', JSON.stringify(wordData));
        setTodayWord(word);
        console.log('Nova palavra do dia:', word, 'para a data:', today);
      } catch (error) {
        setTodayWord('termo'); // fallback
      } finally {
        setLoading(false);
      }
    };

    loadTodayWord();
  }, []);

  return { 
    todayWord, 
    loading
  };
};
