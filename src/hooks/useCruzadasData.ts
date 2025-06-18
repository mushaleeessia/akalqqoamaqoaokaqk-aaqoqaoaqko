
import { useState, useEffect } from 'react';

export interface CruzadasWord {
  id: number;
  word: string;
  clue: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical';
  number: number;
}

export interface CruzadasPuzzle {
  id: string;
  date: string;
  words: CruzadasWord[];
  gridSize: number;
}

// Puzzles pré-definidos que mudam a cada dia
const CRUZADAS_PUZZLES: CruzadasPuzzle[] = [
  {
    id: '2025-01-01',
    date: '2025-01-01',
    gridSize: 15,
    words: [
      { id: 1, word: 'CASA', clue: 'Local onde moramos', startRow: 1, startCol: 1, direction: 'horizontal', number: 1 },
      { id: 2, word: 'AMOR', clue: 'Sentimento profundo de carinho', startRow: 3, startCol: 1, direction: 'horizontal', number: 2 },
      { id: 3, word: 'VIDA', clue: 'Existência dos seres vivos', startRow: 5, startCol: 1, direction: 'horizontal', number: 3 },
      { id: 4, word: 'TEMPO', clue: 'Sucessão de momentos', startRow: 7, startCol: 1, direction: 'horizontal', number: 4 },
      { id: 5, word: 'CALMA', clue: 'Estado de tranquilidade', startRow: 1, startCol: 1, direction: 'vertical', number: 1 },
      { id: 6, word: 'ALTO', clue: 'Oposto de baixo', startRow: 1, startCol: 3, direction: 'vertical', number: 5 },
      { id: 7, word: 'MAR', clue: 'Grande massa de água salgada', startRow: 3, startCol: 3, direction: 'vertical', number: 6 },
      { id: 8, word: 'VERDE', clue: 'Cor da natureza', startRow: 1, startCol: 5, direction: 'vertical', number: 7 }
    ]
  },
  {
    id: '2025-01-02',
    date: '2025-01-02',
    gridSize: 15,
    words: [
      { id: 1, word: 'TERRA', clue: 'Nosso planeta', startRow: 1, startCol: 1, direction: 'horizontal', number: 1 },
      { id: 2, word: 'AGUA', clue: 'Líquido essencial à vida', startRow: 3, startCol: 1, direction: 'horizontal', number: 2 },
      { id: 3, word: 'FOGO', clue: 'Elemento que queima', startRow: 5, startCol: 1, direction: 'horizontal', number: 3 },
      { id: 4, word: 'VENTO', clue: 'Movimento do ar', startRow: 7, startCol: 1, direction: 'horizontal', number: 4 },
      { id: 5, word: 'TATU', clue: 'Animal com carapaça', startRow: 1, startCol: 1, direction: 'vertical', number: 1 },
      { id: 6, word: 'EGUA', clue: 'Fêmea do cavalo', startRow: 1, startCol: 2, direction: 'vertical', number: 5 },
      { id: 7, word: 'RUA', clue: 'Via pública da cidade', startRow: 1, startCol: 3, direction: 'vertical', number: 6 },
      { id: 8, word: 'RAGO', clue: 'Parte do estômago', startRow: 1, startCol: 4, direction: 'vertical', number: 7 }
    ]
  }
];

const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const getDaysSinceEpoch = (): number => {
  const today = new Date();
  const epoch = new Date('2025-01-01');
  const diffTime = today.getTime() - epoch.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const useCruzadasData = () => {
  const [todayPuzzle, setTodayPuzzle] = useState<CruzadasPuzzle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayPuzzle = () => {
      try {
        const dayIndex = getDaysSinceEpoch() % CRUZADAS_PUZZLES.length;
        const selectedPuzzle = CRUZADAS_PUZZLES[dayIndex];
        
        if (selectedPuzzle) {
          const todayString = getTodayDateString();
          const puzzleForToday = {
            ...selectedPuzzle,
            id: todayString,
            date: todayString
          };
          
          setTodayPuzzle(puzzleForToday);
          console.log('Puzzle do dia carregado:', puzzleForToday);
        }
      } catch (error) {
        console.error('Erro ao carregar puzzle:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayPuzzle();
  }, []);

  return {
    todayPuzzle,
    loading
  };
};
