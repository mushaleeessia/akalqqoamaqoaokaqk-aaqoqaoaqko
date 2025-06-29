
import { CrosswordCell, CrosswordClue } from '@/types/crossword';
import { PlacedWord } from '@/types/crosswordGenerator';

export const placeWordOnGrid = (
  wordDef: { word: string; clue: string },
  row: number,
  col: number,
  direction: 'across' | 'down',
  grid: CrosswordCell[][],
  placedWords: PlacedWord[],
  clues: { across: CrosswordClue[]; down: CrosswordClue[] },
  clueNumber: number
): number => {
  const word = wordDef.word.toUpperCase();
  
  // Marcar células como não bloqueadas e colocar as letras
  for (let i = 0; i < word.length; i++) {
    const currentRow = direction === 'across' ? row : row + i;
    const currentCol = direction === 'across' ? col + i : col;
    
    grid[currentRow][currentCol] = {
      ...grid[currentRow][currentCol],
      letter: word[i],
      isBlocked: false,
      userInput: ''
    };
    
    // Adicionar informação sobre qual palavra esta célula pertence
    if (direction === 'across') {
      grid[currentRow][currentCol].belongsToWords.across = clueNumber;
    } else {
      grid[currentRow][currentCol].belongsToWords.down = clueNumber;
    }
  }
  
  // Sempre colocar o número na primeira célula da palavra
  grid[row][col].number = clueNumber;
  
  // Adicionar a palavra colocada
  placedWords.push({
    word: wordDef.word,
    clue: wordDef.clue,
    row,
    col,
    direction,
    number: clueNumber
  });
  
  // Adicionar a pista
  const clue: CrosswordClue = {
    number: clueNumber,
    clue: wordDef.clue,
    answer: wordDef.word.toUpperCase(),
    startRow: row,
    startCol: col,
    direction,
    length: wordDef.word.length
  };
  
  if (direction === 'across') {
    clues.across.push(clue);
  } else {
    clues.down.push(clue);
  }
  
  return clueNumber + 1;
};
