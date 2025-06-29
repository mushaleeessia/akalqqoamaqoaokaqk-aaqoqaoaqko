
import { CrosswordPuzzle } from '@/types/crossword';

interface UseCrosswordCellNavigationProps {
  puzzle: CrosswordPuzzle | null;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  selectedCell: { row: number; col: number } | null;
}

export const useCrosswordCellNavigation = ({
  puzzle,
  setSelectedCell,
  selectedCell
}: UseCrosswordCellNavigationProps) => {

  const moveToNextCell = (currentRow: number, currentCol: number, direction: 'across' | 'down') => {
    if (!puzzle) {
      return;
    }
    
    let nextRow = currentRow;
    let nextCol = currentCol;
    
    if (direction === 'across') {
      nextCol = currentCol + 1;
    } else {
      nextRow = currentRow + 1;
    }
    
    // Check bounds
    if (nextRow >= puzzle.size || nextCol >= puzzle.size) {
      return;
    }
    
    // Check if cell exists and is not blocked
    const nextCell = puzzle.grid[nextRow][nextCol];
    
    if (nextCell.isBlocked) {
      return;
    }
    
    // Check if cell belongs to current direction
    const belongsToCurrentDirection = direction === 'across' 
      ? nextCell.belongsToWords.across 
      : nextCell.belongsToWords.down;
    
    if (!belongsToCurrentDirection) {
      return;
    }
    
    setSelectedCell({ row: nextRow, col: nextCol });
    
    // Focus on next input automatically
    setTimeout(() => {
      const nextInput = document.querySelector(`input[data-cell="${nextRow}-${nextCol}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }, 50);
  };

  const moveToPreviousCell = (currentRow: number, currentCol: number, direction: 'across' | 'down') => {
    if (!puzzle) {
      return;
    }
    
    let prevRow = currentRow;
    let prevCol = currentCol;
    
    if (direction === 'across') {
      prevCol = currentCol - 1;
    } else {
      prevRow = currentRow - 1;
    }
    
    // Check bounds
    if (prevRow < 0 || prevCol < 0) {
      return;
    }
    
    // Check if cell exists and is not blocked
    const prevCell = puzzle.grid[prevRow][prevCol];
    
    if (prevCell.isBlocked) {
      return;
    }
    
    // Check if cell belongs to current direction
    const belongsToCurrentDirection = direction === 'across' 
      ? prevCell.belongsToWords.across 
      : prevCell.belongsToWords.down;
    
    if (!belongsToCurrentDirection) {
      return;
    }
    
    return { row: prevRow, col: prevCol };
  };

  // Navegação livre com as setas do teclado
  const moveWithArrows = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!puzzle || !selectedCell) {
      return;
    }

    let newRow = selectedCell.row;
    let newCol = selectedCell.col;

    switch (direction) {
      case 'up':
        newRow = selectedCell.row - 1;
        break;
      case 'down':
        newRow = selectedCell.row + 1;
        break;
      case 'left':
        newCol = selectedCell.col - 1;
        break;
      case 'right':
        newCol = selectedCell.col + 1;
        break;
    }

    // Check bounds
    if (newRow < 0 || newRow >= puzzle.size || newCol < 0 || newCol >= puzzle.size) {
      return;
    }

    // Check if cell is not blocked
    if (puzzle.grid[newRow][newCol].isBlocked) {
      return;
    }

    setSelectedCell({ row: newRow, col: newCol });

    // Focus on the new input
    setTimeout(() => {
      const newInput = document.querySelector(`input[data-cell="${newRow}-${newCol}"]`) as HTMLInputElement;
      if (newInput) {
        newInput.focus();
      }
    }, 50);
  };

  return {
    moveToNextCell,
    moveToPreviousCell,
    moveWithArrows
  };
};
