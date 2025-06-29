
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { getBalancedWords, WordDefinition } from '@/data/crosswordWords';

interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

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

  // Função melhorada para verificar se uma palavra pode ser colocada
  const canPlaceWord = (word: string, row: number, col: number, direction: 'across' | 'down'): boolean => {
    const len = word.length;
    
    // Verificar limites básicos
    if (direction === 'across') {
      if (col + len > size) return false;
    } else {
      if (row + len > size) return false;
    }
    
    // Verificar se há espaço antes da palavra (não deve haver letra)
    if (direction === 'across') {
      if (col > 0 && !grid[row][col - 1].isBlocked && grid[row][col - 1].letter !== '') {
        return false;
      }
    } else {
      if (row > 0 && !grid[row - 1][col].isBlocked && grid[row - 1][col].letter !== '') {
        return false;
      }
    }
    
    // Verificar se há espaço depois da palavra (não deve haver letra)
    if (direction === 'across') {
      if (col + len < size && !grid[row][col + len].isBlocked && grid[row][col + len].letter !== '') {
        return false;
      }
    } else {
      if (row + len < size && !grid[row + len][col].isBlocked && grid[row + len][col].letter !== '') {
        return false;
      }
    }
    
    // Verificar cada posição da palavra
    let intersectionCount = 0;
    for (let i = 0; i < len; i++) {
      const currentRow = direction === 'across' ? row : row + i;
      const currentCol = direction === 'across' ? col + i : col;
      const currentCell = grid[currentRow][currentCol];
      
      // Se a célula já tem uma letra, deve ser exatamente a mesma
      if (!currentCell.isBlocked && currentCell.letter !== '') {
        if (currentCell.letter.toUpperCase() !== word[i].toUpperCase()) {
          return false;
        }
        intersectionCount++;
      } else {
        // Verificar células adjacentes perpendiculares para evitar conflitos
        if (direction === 'across') {
          // Verificar acima e abaixo
          if (currentRow > 0) {
            const cellAbove = grid[currentRow - 1][currentCol];
            if (!cellAbove.isBlocked && cellAbove.letter !== '') {
              // Só permite se for uma intersecção válida (palavra vertical passando por aqui)
              const hasVerticalWord = cellAbove.belongsToWords.down;
              if (!hasVerticalWord) return false;
            }
          }
          if (currentRow < size - 1) {
            const cellBelow = grid[currentRow + 1][currentCol];
            if (!cellBelow.isBlocked && cellBelow.letter !== '') {
              const hasVerticalWord = cellBelow.belongsToWords.down;
              if (!hasVerticalWord) return false;
            }
          }
        } else {
          // Verificar esquerda e direita
          if (currentCol > 0) {
            const cellLeft = grid[currentRow][currentCol - 1];
            if (!cellLeft.isBlocked && cellLeft.letter !== '') {
              const hasHorizontalWord = cellLeft.belongsToWords.across;
              if (!hasHorizontalWord) return false;
            }
          }
          if (currentCol < size - 1) {
            const cellRight = grid[currentRow][currentCol + 1];
            if (!cellRight.isBlocked && cellRight.letter !== '') {
              const hasHorizontalWord = cellRight.belongsToWords.across;
              if (!hasHorizontalWord) return false;
            }
          }
        }
      }
    }
    
    // Para palavras que não a primeira, deve ter pelo menos uma intersecção
    if (placedWords.length > 0 && intersectionCount === 0) {
      return false;
    }
    
    return true;
  };

  // Função para colocar uma palavra
  const placeWord = (wordDef: WordDefinition, row: number, col: number, direction: 'across' | 'down'): boolean => {
    const word = wordDef.word.toUpperCase();
    if (!canPlaceWord(word, row, col, direction)) return false;
    
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
    clueNumber++;
    
    return true;
  };

  // Encontrar intersecções possíveis melhoradas
  const findIntersections = (word: string, placedWord: PlacedWord): Array<{row: number, col: number, direction: 'across' | 'down'}> => {
    const intersections = [];
    const upperWord = word.toUpperCase();
    const upperPlacedWord = placedWord.word.toUpperCase();
    
    for (let i = 0; i < upperWord.length; i++) {
      for (let j = 0; j < upperPlacedWord.length; j++) {
        if (upperWord[i] === upperPlacedWord[j]) {
          let newRow, newCol, newDirection: 'across' | 'down';
          
          if (placedWord.direction === 'across') {
            // Nova palavra será vertical
            newDirection = 'down';
            newRow = placedWord.row - i;
            newCol = placedWord.col + j;
          } else {
            // Nova palavra será horizontal
            newDirection = 'across';
            newRow = placedWord.row + j;
            newCol = placedWord.col - i;
          }
          
          // Verificar se a posição é válida
          if (newRow >= 0 && newCol >= 0 && 
              newRow + (newDirection === 'down' ? upperWord.length : 0) <= size &&
              newCol + (newDirection === 'across' ? upperWord.length : 0) <= size) {
            intersections.push({ row: newRow, col: newCol, direction: newDirection });
          }
        }
      }
    }
    
    return intersections;
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
      
      const intersections = findIntersections(currentWord.word, placedWord);
      const shuffledIntersections = intersections.sort(() => 0.5 - Math.random());
      
      for (const intersection of shuffledIntersections) {
        if (canPlaceWord(currentWord.word.toUpperCase(), intersection.row, intersection.col, intersection.direction)) {
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
        
        if (canPlaceWord(currentWord.word.toUpperCase(), row, col, direction)) {
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
