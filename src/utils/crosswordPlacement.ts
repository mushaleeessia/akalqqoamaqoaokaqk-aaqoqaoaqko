
import { CrosswordCell, CrosswordClue } from '@/types/crossword';
import { WordDefinition } from '@/data/crosswordWords';
import { PlacedWord } from '@/types/crosswordGenerator';

export const placeWordOnGrid = (
  wordDef: WordDefinition,
  row: number,
  col: number,
  direction: 'across' | 'down',
  grid: CrosswordCell[][],
  placedWords: PlacedWord[],
  clues: { across: CrosswordClue[]; down: CrosswordClue[] },
  clueNumber: number
): number => {
  const word = wordDef.word.toUpperCase();
  
  // Marcar células como não bloqueadas e colocar letras
  for (let i = 0; i < word.length; i++) {
    const currentRow = direction === 'across' ? row : row + i;
    const currentCol = direction === 'across' ? col + i : col;
    
    // Preservar número existente se já houver
    const existingNumber = grid[currentRow][currentCol].number;
    
    grid[currentRow][currentCol] = {
      letter: word[i],
      isBlocked: false,
      userInput: '',
      number: i === 0 ? clueNumber : existingNumber,
      belongsToWords: {
        ...grid[currentRow][currentCol].belongsToWords,
        [direction]: clueNumber
      }
    };
  }

  // Adicionar à lista de palavras colocadas
  placedWords.push({
    word,
    clue: wordDef.clue,
    row,
    col,
    direction,
    number: clueNumber
  });

  // Criar a pista
  const clueObj: CrosswordClue = {
    number: clueNumber,
    clue: wordDef.clue,
    answer: word,
    startRow: row,
    startCol: col,
    direction,
    length: word.length
  };

  clues[direction].push(clueObj);
  
  return clueNumber + 1;
};
