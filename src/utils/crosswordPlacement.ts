
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
  
  // Verificar se a célula inicial já tem um número
  // Se não tiver, atribuir o número atual
  if (!grid[row][col].number) {
    grid[row][col].number = clueNumber;
    console.log(`Assigned number ${clueNumber} to cell [${row}, ${col}]`);
  } else {
    console.log(`Cell [${row}, ${col}] already has number ${grid[row][col].number}, using existing number`);
    // Se já tem número, usar o número existente para esta palavra
    clueNumber = grid[row][col].number;
  }
  
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
  
  // Retornar o próximo número disponível apenas se criamos um novo número
  // Se reutilizamos um número existente, incrementar para o próximo
  if (grid[row][col].number === clueNumber) {
    return clueNumber + 1;
  } else {
    // Encontrar o próximo número disponível
    let nextNumber = 1;
    const usedNumbers = new Set<number>();
    
    // Coletar todos os números já usados
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].number) {
          usedNumbers.add(grid[i][j].number);
        }
      }
    }
    
    // Encontrar o próximo número não usado
    while (usedNumbers.has(nextNumber)) {
      nextNumber++;
    }
    
    return nextNumber;
  }
};
