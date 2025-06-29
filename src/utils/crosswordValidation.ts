
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
      // Se a célula está vazia, verificar se não há conflitos adjacentes
      if (direction === 'across') {
        // Verificar acima
        if (currentRow > 0) {
          const cellAbove = grid[currentRow - 1][currentCol];
          if (!cellAbove.isBlocked && cellAbove.letter !== '') {
            // Se há letra acima, deve haver uma palavra vertical válida
            const belongsToVerticalWord = cellAbove.belongsToWords?.down;
            if (!belongsToVerticalWord) return false;
            
            // Verificar se essa posição faz parte da mesma palavra vertical
            const verticalWord = placedWords.find(pw => 
              pw.direction === 'down' && 
              pw.number === belongsToVerticalWord &&
              pw.row <= currentRow - 1 && 
              pw.row + pw.word.length > currentRow - 1 &&
              pw.col === currentCol
            );
            
            if (verticalWord) {
              // Verificar se a palavra vertical continua até a posição atual
              const verticalIndex = currentRow - verticalWord.row;
              if (verticalIndex >= 0 && verticalIndex < verticalWord.word.length) {
                if (verticalWord.word[verticalIndex].toUpperCase() !== word[i].toUpperCase()) {
                  return false;
                }
              }
            }
          }
        }
        
        // Verificar abaixo
        if (currentRow < size - 1) {
          const cellBelow = grid[currentRow + 1][currentCol];
          if (!cellBelow.isBlocked && cellBelow.letter !== '') {
            const belongsToVerticalWord = cellBelow.belongsToWords?.down;
            if (!belongsToVerticalWord) return false;
            
            const verticalWord = placedWords.find(pw => 
              pw.direction === 'down' && 
              pw.number === belongsToVerticalWord &&
              pw.row <= currentRow + 1 && 
              pw.row + pw.word.length > currentRow + 1 &&
              pw.col === currentCol
            );
            
            if (verticalWord) {
              const verticalIndex = currentRow - verticalWord.row;
              if (verticalIndex >= 0 && verticalIndex < verticalWord.word.length) {
                if (verticalWord.word[verticalIndex].toUpperCase() !== word[i].toUpperCase()) {
                  return false;
                }
              }
            }
          }
        }
      } else {
        // Verificar esquerda
        if (currentCol > 0) {
          const cellLeft = grid[currentRow][currentCol - 1];
          if (!cellLeft.isBlocked && cellLeft.letter !== '') {
            const belongsToHorizontalWord = cellLeft.belongsToWords?.across;
            if (!belongsToHorizontalWord) return false;
            
            const horizontalWord = placedWords.find(pw => 
              pw.direction === 'across' && 
              pw.number === belongsToHorizontalWord &&
              pw.col <= currentCol - 1 && 
              pw.col + pw.word.length > currentCol - 1 &&
              pw.row === currentRow
            );
            
            if (horizontalWord) {
              const horizontalIndex = currentCol - horizontalWord.col;
              if (horizontalIndex >= 0 && horizontalIndex < horizontalWord.word.length) {
                if (horizontalWord.word[horizontalIndex].toUpperCase() !== word[i].toUpperCase()) {
                  return false;
                }
              }
            }
          }
        }
        
        // Verificar direita
        if (currentCol < size - 1) {
          const cellRight = grid[currentRow][currentCol + 1];
          if (!cellRight.isBlocked && cellRight.letter !== '') {
            const belongsToHorizontalWord = cellRight.belongsToWords?.across;
            if (!belongsToHorizontalWord) return false;
            
            const horizontalWord = placedWords.find(pw => 
              pw.direction === 'across' && 
              pw.number === belongsToHorizontalWord &&
              pw.col <= currentCol + 1 && 
              pw.col + pw.word.length > currentCol + 1 &&
              pw.row === currentRow
            );
            
            if (horizontalWord) {
              const horizontalIndex = currentCol - horizontalWord.col;
              if (horizontalIndex >= 0 && horizontalIndex < horizontalWord.word.length) {
                if (horizontalWord.word[horizontalIndex].toUpperCase() !== word[i].toUpperCase()) {
                  return false;
                }
              }
            }
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
