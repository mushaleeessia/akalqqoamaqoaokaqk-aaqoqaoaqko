
import { CrosswordPuzzle } from '@/types/crossword';

interface UseCrosswordCellNavigationProps {
  puzzle: CrosswordPuzzle | null;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
}

export const useCrosswordCellNavigation = ({
  puzzle,
  setSelectedCell
}: UseCrosswordCellNavigationProps) => {

  const moveToNextCell = (currentRow: number, currentCol: number, direction: 'across' | 'down') => {
    if (!puzzle) {
      console.log('No puzzle available');
      return;
    }
    
    console.log(`Moving from (${currentRow}, ${currentCol}) in direction: ${direction}`);
    
    let nextRow = currentRow;
    let nextCol = currentCol;
    
    // Fix: Correctly handle direction for movement
    if (direction === 'across') {
      nextCol = currentCol + 1;
    } else { // direction === 'down'
      nextRow = currentRow + 1;
    }
    
    console.log(`Next cell would be: (${nextRow}, ${nextCol})`);
    
    // Verificar limites
    if (nextRow >= puzzle.size || nextCol >= puzzle.size) {
      console.log('Next cell is out of bounds');
      return;
    }
    
    // Verificar se a célula é realmente bloqueada (preta)
    const nextCell = puzzle.grid[nextRow][nextCol];
    if (nextCell.isBlocked) {
      console.log('Next cell is blocked (black cell)');
      return;
    }
    
    // Verificar se a célula pertence à direção atual
    const belongsToCurrentDirection = direction === 'across' 
      ? nextCell.belongsToWords.across 
      : nextCell.belongsToWords.down;
    
    if (!belongsToCurrentDirection) {
      console.log(`Next cell doesn't belong to current ${direction} word`);
      return;
    }
    
    console.log(`Moving to cell (${nextRow}, ${nextCol})`);
    setSelectedCell({ row: nextRow, col: nextCol });
    
    // Focar no próximo input automaticamente
    setTimeout(() => {
      const nextInput = document.querySelector(`input[data-cell="${nextRow}-${nextCol}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        console.log(`Focused on input at (${nextRow}, ${nextCol})`);
      } else {
        console.log(`Could not find input for cell (${nextRow}, ${nextCol})`);
      }
    }, 50);
  };

  const moveToPreviousCell = (currentRow: number, currentCol: number, direction: 'across' | 'down') => {
    if (!puzzle) {
      console.log('No puzzle available for previous move');
      return;
    }
    
    console.log(`Moving backwards from (${currentRow}, ${currentCol}) in direction: ${direction}`);
    
    let prevRow = currentRow;
    let prevCol = currentCol;
    
    // Fix: Correctly handle direction for backward movement
    if (direction === 'across') {
      prevCol = currentCol - 1;
    } else { // direction === 'down'
      prevRow = currentRow - 1;
    }
    
    console.log(`Previous cell would be: (${prevRow}, ${prevCol})`);
    
    // Verificar limites
    if (prevRow < 0 || prevCol < 0) {
      console.log('Previous cell is out of bounds');
      return;
    }
    
    // Verificar se a célula é realmente bloqueada (preta)
    const prevCell = puzzle.grid[prevRow][prevCol];
    if (prevCell.isBlocked) {
      console.log('Previous cell is blocked (black cell)');
      return;
    }
    
    // Verificar se a célula pertence à direção atual
    const belongsToCurrentDirection = direction === 'across' 
      ? prevCell.belongsToWords.across 
      : prevCell.belongsToWords.down;
    
    if (!belongsToCurrentDirection) {
      console.log(`Previous cell doesn't belong to current ${direction} word`);
      return;
    }
    
    return { row: prevRow, col: prevCol };
  };

  return {
    moveToNextCell,
    moveToPreviousCell
  };
};
