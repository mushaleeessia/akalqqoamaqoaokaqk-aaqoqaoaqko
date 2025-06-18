
import { useState, useEffect, useCallback } from 'react';
import { CruzadasPuzzle, CruzadasWord } from './useCruzadasData';

export interface CellState {
  letter: string;
  isCorrect: boolean;
  belongsToWord: boolean;
  wordIds: number[];
  number?: number;
}

export interface GameProgress {
  completedWords: Set<number>;
  grid: CellState[][];
  selectedCell: { row: number; col: number } | null;
  selectedWord: CruzadasWord | null;
  gameCompleted: boolean;
}

const STORAGE_PREFIX = 'cruzadas_progress_';

export const useCruzadasGameState = (puzzle: CruzadasPuzzle | null) => {
  const [gameProgress, setGameProgress] = useState<GameProgress>({
    completedWords: new Set(),
    grid: [],
    selectedCell: null,
    selectedWord: null,
    gameCompleted: false
  });

  // Inicializar grid
  const initializeGrid = useCallback((puzzle: CruzadasPuzzle): CellState[][] => {
    const grid: CellState[][] = Array(puzzle.gridSize).fill(null).map(() =>
      Array(puzzle.gridSize).fill(null).map(() => ({
        letter: '',
        isCorrect: false,
        belongsToWord: false,
        wordIds: []
      }))
    );

    // Marcar células que pertencem a palavras
    puzzle.words.forEach(word => {
      for (let i = 0; i < word.word.length; i++) {
        const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
        
        if (row < puzzle.gridSize && col < puzzle.gridSize) {
          grid[row][col].belongsToWord = true;
          grid[row][col].wordIds.push(word.id);
          
          // Adicionar número se for o início da palavra
          if (i === 0) {
            grid[row][col].number = word.number;
          }
        }
      }
    });

    return grid;
  }, []);

  // Carregar progresso salvo
  const loadProgress = useCallback((puzzle: CruzadasPuzzle) => {
    const storageKey = STORAGE_PREFIX + puzzle.id;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsedProgress = JSON.parse(saved);
        const grid = initializeGrid(puzzle);
        
        // Restaurar letras do progresso salvo
        if (parsedProgress.userInputs) {
          Object.entries(parsedProgress.userInputs).forEach(([key, letter]) => {
            const [row, col] = key.split(',').map(Number);
            if (grid[row] && grid[row][col]) {
              grid[row][col].letter = letter as string;
            }
          });
        }
        
        const completedWords = checkAllWords(puzzle, grid);
        
        setGameProgress({
          completedWords,
          grid,
          selectedCell: null,
          selectedWord: null,
          gameCompleted: completedWords.size === puzzle.words.length
        });
        
        return;
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    }
    
    // Inicializar novo jogo
    const grid = initializeGrid(puzzle);
    setGameProgress({
      completedWords: new Set(),
      grid,
      selectedCell: null,
      selectedWord: null,
      gameCompleted: false
    });
  }, [initializeGrid]);

  // Verificar palavras completas
  const checkAllWords = (puzzle: CruzadasPuzzle, grid: CellState[][]): Set<number> => {
    const completed = new Set<number>();
    
    puzzle.words.forEach(word => {
      let isComplete = true;
      
      for (let i = 0; i < word.word.length; i++) {
        const row = word.direction === 'horizontal' ? word.startRow : word.startRow + i;
        const col = word.direction === 'horizontal' ? word.startCol + i : word.startCol;
        
        if (row >= puzzle.gridSize || col >= puzzle.gridSize) {
          isComplete = false;
          break;
        }
        
        const expectedLetter = word.word[i].toLowerCase();
        const actualLetter = grid[row][col].letter.toLowerCase();
        
        if (actualLetter !== expectedLetter) {
          isComplete = false;
          break;
        }
      }
      
      if (isComplete) {
        completed.add(word.id);
      }
    });
    
    return completed;
  };

  // Salvar progresso
  const saveProgress = useCallback((puzzle: CruzadasPuzzle, grid: CellState[][]) => {
    const storageKey = STORAGE_PREFIX + puzzle.id;
    const userInputs: { [key: string]: string } = {};
    
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.letter) {
          userInputs[`${rowIndex},${colIndex}`] = cell.letter;
        }
      });
    });
    
    const progressData = {
      userInputs,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(progressData));
  }, []);

  // Inserir letra
  const insertLetter = (letter: string) => {
    if (!puzzle || !gameProgress.selectedCell) return;
    
    const { row, col } = gameProgress.selectedCell;
    
    setGameProgress(prev => {
      const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].letter = letter.toUpperCase();
      
      const completedWords = checkAllWords(puzzle, newGrid);
      const gameCompleted = completedWords.size === puzzle.words.length;
      
      // Salvar progresso
      saveProgress(puzzle, newGrid);
      
      return {
        ...prev,
        grid: newGrid,
        completedWords,
        gameCompleted
      };
    });
  };

  // Apagar letra
  const deleteLetter = () => {
    if (!puzzle || !gameProgress.selectedCell) return;
    
    const { row, col } = gameProgress.selectedCell;
    
    setGameProgress(prev => {
      const newGrid = prev.grid.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].letter = '';
      
      const completedWords = checkAllWords(puzzle, newGrid);
      
      // Salvar progresso
      saveProgress(puzzle, newGrid);
      
      return {
        ...prev,
        grid: newGrid,
        completedWords,
        gameCompleted: false
      };
    });
  };

  // Selecionar célula
  const selectCell = (row: number, col: number) => {
    if (!puzzle) return;
    
    const cell = gameProgress.grid[row][col];
    if (!cell.belongsToWord) return;
    
    // Encontrar palavra relacionada
    const relatedWord = puzzle.words.find(word => cell.wordIds.includes(word.id));
    
    setGameProgress(prev => ({
      ...prev,
      selectedCell: { row, col },
      selectedWord: relatedWord || null
    }));
  };

  // Inicializar quando puzzle carrega
  useEffect(() => {
    if (puzzle) {
      loadProgress(puzzle);
    }
  }, [puzzle, loadProgress]);

  return {
    gameProgress,
    insertLetter,
    deleteLetter,
    selectCell
  };
};
