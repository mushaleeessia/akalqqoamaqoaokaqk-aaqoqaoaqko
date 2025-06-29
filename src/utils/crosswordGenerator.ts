
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { getBalancedWords, WordDefinition } from '@/data/crosswordWords';
import { PlacedWord } from '@/types/crosswordGenerator';
import { canPlaceWord } from './crosswordValidation';
import { findIntersections } from './crosswordIntersection';
import { placeWordOnGrid } from './crosswordPlacement';

export const generateCrosswordPuzzle = (): CrosswordPuzzle => {
  const size = 15;
  const words = getBalancedWords();
  
  // Inicializar grade vazia
  const grid: CrosswordCell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isBlocked: true,
      userInput: '',
      belongsToWords: {}
    }))
  );

  const placedWords: PlacedWord[] = [];
  const clues: { across: CrosswordClue[]; down: CrosswordClue[] } = {
    across: [],
    down: []
  };

  let clueNumber = 1;

  // Função para colocar uma palavra
  const placeWord = (wordDef: WordDefinition, row: number, col: number, direction: 'across' | 'down'): boolean => {
    const word = wordDef.word.toUpperCase();
    if (!canPlaceWord(word, row, col, direction, grid, placedWords, size)) return false;
    
    clueNumber = placeWordOnGrid(wordDef, row, col, direction, grid, placedWords, clues, clueNumber);
    return true;
  };

  // Colocar a primeira palavra no centro
  if (words.length > 0) {
    const firstWord = words[0];
    const startRow = Math.floor(size / 2);
    const startCol = Math.floor((size - firstWord.word.length) / 2);
    placeWord(firstWord, startRow, startCol, 'across');
  }

  // Tentar colocar as outras palavras com melhor estratégia
  for (let i = 1; i < words.length && i < 25; i++) {
    const currentWord = words[i];
    let placed = false;
    
    // Tentar intersecções com palavras já colocadas
    const shuffledPlacedWords = [...placedWords].sort(() => 0.5 - Math.random());
    
    for (const placedWord of shuffledPlacedWords) {
      if (placed) break;
      
      const intersections = findIntersections(currentWord.word, placedWord, size);
      const shuffledIntersections = intersections.sort(() => 0.5 - Math.random());
      
      for (const intersection of shuffledIntersections) {
        if (canPlaceWord(currentWord.word.toUpperCase(), intersection.row, intersection.col, intersection.direction, grid, placedWords, size)) {
          placeWord(currentWord, intersection.row, intersection.col, intersection.direction);
          placed = true;
          break;
        }
      }
    }
    
    // Se não conseguiu intersecção, tentar colocar isolado (com mais cuidado)
    if (!placed) {
      for (let attempts = 0; attempts < 150 && !placed; attempts++) {
        const direction = Math.random() < 0.5 ? 'across' : 'down';
        const wordLength = currentWord.word.length;
        
        const maxRow = direction === 'down' ? size - wordLength : size - 1;
        const maxCol = direction === 'across' ? size - wordLength : size - 1;
        
        if (maxRow <= 0 || maxCol <= 0) continue;
        
        const row = Math.floor(Math.random() * maxRow);
        const col = Math.floor(Math.random() * maxCol);
        
        if (canPlaceWord(currentWord.word.toUpperCase(), row, col, direction, grid, placedWords, size)) {
          placeWord(currentWord, row, col, direction);
          placed = true;
        }
      }
    }
  }

  // Ordenar pistas por número
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);

  return {
    grid,
    clues,
    size
  };
};
