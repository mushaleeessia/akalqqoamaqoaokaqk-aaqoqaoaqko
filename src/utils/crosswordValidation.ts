
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
  const upperWord = word.toUpperCase();
  
  // Verificar limites básicos
  if (direction === 'across') {
    if (col + len > size) return false;
  } else {
    if (row + len > size) return false;
  }
  
  // Verificar se há espaço antes da palavra
  if (direction === 'across') {
    if (col > 0 && !grid[row][col - 1].isBlocked && grid[row][col - 1].letter !== '') {
      return false;
    }
  } else {
    if (row > 0 && !grid[row - 1][col].isBlocked && grid[row - 1][col].letter !== '') {
      return false;
    }
  }
  
  // Verificar se há espaço depois da palavra
  if (direction === 'across') {
    if (col + len < size && !grid[row][col + len].isBlocked && grid[row][col + len].letter !== '') {
      return false;
    }
  } else {
    if (row + len < size && !grid[row + len][col].isBlocked && grid[row + len][col].letter !== '') {
      return false;
    }
  }
  
  // Verificar cada posição da palavra e contar intersecções válidas
  let validIntersectionCount = 0;
  
  for (let i = 0; i < len; i++) {
    const currentRow = direction === 'across' ? row : row + i;
    const currentCol = direction === 'across' ? col + i : col;
    const currentCell = grid[currentRow][currentCol];
    
    // Se a célula já tem uma letra
    if (!currentCell.isBlocked && currentCell.letter !== '') {
      // A letra deve ser exatamente a mesma
      if (currentCell.letter.toUpperCase() !== upperWord[i]) {
        return false;
      }
      
      // Verificar se há realmente uma palavra perpendicular passando por aqui
      let hasPerpendicularWord = false;
      
      for (const placedWord of placedWords) {
        if (placedWord.direction !== direction) {
          // Verificar se a palavra perpendicular passa por esta célula
          if (direction === 'across') {
            // Nossa palavra é horizontal, verificar palavras verticais
            if (placedWord.col === currentCol && 
                placedWord.row <= currentRow && 
                placedWord.row + placedWord.word.length > currentRow) {
              hasPerpendicularWord = true;
              break;
            }
          } else {
            // Nossa palavra é vertical, verificar palavras horizontais
            if (placedWord.row === currentRow && 
                placedWord.col <= currentCol && 
                placedWord.col + placedWord.word.length > currentCol) {
              hasPerpendicularWord = true;
              break;
            }
          }
        }
      }
      
      if (hasPerpendicularWord) {
        validIntersectionCount++;
      } else {
        // Se não há palavra perpendicular, esta intersecção é inválida
        return false;
      }
    } else {
      // Célula vazia - verificar se não há conflitos adjacentes
      if (direction === 'across') {
        // Verificar acima e abaixo
        if (currentRow > 0 && !grid[currentRow - 1][currentCol].isBlocked && grid[currentRow - 1][currentCol].letter !== '') {
          return false;
        }
        if (currentRow < size - 1 && !grid[currentRow + 1][currentCol].isBlocked && grid[currentRow + 1][currentCol].letter !== '') {
          return false;
        }
      } else {
        // Verificar esquerda e direita
        if (currentCol > 0 && !grid[currentRow][currentCol - 1].isBlocked && grid[currentRow][currentCol - 1].letter !== '') {
          return false;
        }
        if (currentCol < size - 1 && !grid[currentRow][currentCol + 1].isBlocked && grid[currentRow][currentCol + 1].letter !== '') {
          return false;
        }
      }
    }
  }
  
  // Para palavras que não a primeira, deve ter pelo menos uma intersecção válida
  if (placedWords.length > 0 && validIntersectionCount === 0) {
    return false;
  }
  
  return true;
};
