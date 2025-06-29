
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
  
  console.log(`placeWordOnGrid: Placing "${word}" at [${row}, ${col}] with number ${clueNumber}`);
  
  // SEMPRE colocar o número na primeira célula - GARANTIR que seja definido
  grid[row][col].number = clueNumber;
  console.log(`FORCED number ${clueNumber} at position [${row}, ${col}]`);
  
  // Marcar células como não bloqueadas e colocar as letras
  for (let i = 0; i < word.length; i++) {
    const currentRow = direction === 'across' ? row : row + i;
    const currentCol = direction === 'across' ? col + i : col;
    
    // Garantir que a célula existe
    if (!grid[currentRow] || !grid[currentRow][currentCol]) {
      console.error(`Invalid cell position: [${currentRow}, ${currentCol}]`);
      continue;
    }
    
    grid[currentRow][currentCol] = {
      ...grid[currentRow][currentCol],
      letter: word[i],
      isBlocked: false,
      userInput: grid[currentRow][currentCol].userInput || ''
    };
    
    // Adicionar informação sobre qual palavra esta célula pertence
    if (!grid[currentRow][currentCol].belongsToWords) {
      grid[currentRow][currentCol].belongsToWords = {};
    }
    
    if (direction === 'across') {
      grid[currentRow][currentCol].belongsToWords.across = clueNumber;
    } else {
      grid[currentRow][currentCol].belongsToWords.down = clueNumber;
    }
  }
  
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
  
  console.log(`placeWordOnGrid: Successfully placed "${word}" with number ${clueNumber}`);
  console.log(`Grid cell [${row}][${col}] number is now:`, grid[row][col].number);
  
  return clueNumber + 1;
};
