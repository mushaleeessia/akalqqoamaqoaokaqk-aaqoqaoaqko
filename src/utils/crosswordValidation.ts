
import { CrosswordCell } from '@/types/crossword';
import { PlacedWord } from '@/types/crosswordGenerator';

export const canPlaceWord = (
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down',
  grid: CrosswordCell[][],
  placedWords: PlacedWord[],
  size: number
): boolean => {
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
