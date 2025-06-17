
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
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0];
  };

  const seedWords = [
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma',
    'lugar', 'caso', 'vida', 'modo', 'água', 'fogo', 'vento',
    'noite', 'morte', 'homem', 'mulher', 'filho', 'casa', 'porta',
    'mesa', 'livro', 'papel', 'boca', 'olhos', 'dente', 'braço',
    'perna', 'cabeça', 'corpo', 'amor', 'paz', 'guerra', 'força',
    'poder', 'direito', 'ordem', 'união', 'festa', 'jogo',
    'arte', 'obra', 'nome', 'ideia', 'plano', 'sorte', 'calor',
    'frio', 'verde', 'azul', 'preto', 'branco', 'carro', 'avião',
    'ponte', 'rádio', 'música', 'dança', 'filme', 'banco', 'praia',
    'campo', 'flor', 'árvore', 'pedra', 'metal',
    'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer',
    'partir', 'chegar', 'voltar', 'entrar', 'sair', 'subir', 'descer',
    'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar', 'dormir',
    'comer', 'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir',
    'tocar', 'pegar', 'soltar', 'abrir', 'fechar', 'ligar', 'parar',
    'começar', 'acabar', 'ganhar', 'perder', 'jogar', 'ler',
    'escrever', 'cantar', 'dançar', 'rir', 'chorar', 'gritar',
    'amou', 'viveu', 'morreu', 'soube', 'pôde', 'disse', 'partiu',
    'chegou', 'voltou', 'entrou', 'saiu', 'subiu', 'desceu', 'correu',
    'andou', 'saltou', 'pulou', 'voou', 'nadou', 'dormiu', 'comeu',
    'bebeu', 'falou', 'ouviu', 'viu', 'olhou', 'sentiu', 'tocou',
    'pegou', 'soltou', 'abriu', 'fechou', 'ligou', 'parou', 'ganhou',
    'perdeu', 'jogou', 'leu', 'cantou', 'dançou', 'riu', 'chorou'
  ];

  const generateWordsForMode = (mode: GameMode, date: string): string[] => {
    const wordCount = mode === 'solo' ? 1 : mode === 'duo' ? 2 : mode === 'trio' ? 3 : 4;
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
      const seed = date.split('-').reduce((acc, num) => acc + parseInt(num), 0) + i + (mode === 'solo' ? 0 : mode === 'duo' ? 100 : mode === 'trio' ? 200 : 300);
      const wordIndex = seed % seedWords.length;
      words.push(seedWords[wordIndex]);
    }
    
    return words;
  };

  const clearModeData = (mode: GameMode, today: string) => {
    localStorage.removeItem(`termo-daily-words-${mode}`);
    localStorage.removeItem(`termo-session-${mode}-${today}`);
  };

  useEffect(() => {
    const loadWords = () => {
      const today = getTodayDateBrasilia();
      const newWordsData: Record<GameMode, string[]> = {
        solo: [],
        duo: [],
        trio: [],
        quarteto: []
      };

      (['solo', 'duo', 'trio', 'quarteto'] as GameMode[]).forEach(mode => {
        clearModeData(mode, today);
        
        const words = generateWordsForMode(mode, today);
        const wordData = {
          date: today,
          words: words
        };
        
        localStorage.setItem(`termo-daily-words-${mode}`, JSON.stringify(wordData));
        newWordsData[mode] = words;
      });

      setWordsData(newWordsData);
      setLoading(false);
    };

    loadWords();
  }, []);

  return { 
    wordsData, 
    loading
  };
};
