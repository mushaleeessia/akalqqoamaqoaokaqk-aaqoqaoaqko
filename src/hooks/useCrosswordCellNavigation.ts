
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
    
    console.log(`🔄 Moving from (${currentRow}, ${currentCol}) in direction: ${direction}`);
    
    let nextRow = currentRow;
    let nextCol = currentCol;
    
    // Correctly handle direction for movement
    if (direction === 'across') {
      nextCol = currentCol + 1;
      console.log(`➡️ Horizontal movement: ${currentCol} -> ${nextCol}`);
    } else { // direction === 'down'
      nextRow = currentRow + 1;
      console.log(`⬇️ Vertical movement: ${currentRow} -> ${nextRow}`);
    }
    
    console.log(`🎯 Target cell: (${nextRow}, ${nextCol})`);
    
    // Check bounds
    if (nextRow >= puzzle.size || nextCol >= puzzle.size) {
      console.log(`❌ Target cell (${nextRow}, ${nextCol}) is out of bounds (grid size: ${puzzle.size})`);
      return;
    }
    
    // Check if cell exists and is not blocked
    const nextCell = puzzle.grid[nextRow][nextCol];
    console.log(`🔍 Next cell info:`, {
      isBlocked: nextCell.isBlocked,
      letter: nextCell.letter,
      belongsToWords: nextCell.belongsToWords
    });
    
    if (nextCell.isBlocked) {
      console.log(`🚫 Next cell (${nextRow}, ${nextCol}) is blocked (black cell)`);
      return;
    }
    
    // Check if cell belongs to current direction
    const belongsToCurrentDirection = direction === 'across' 
      ? nextCell.belongsToWords.across 
      : nextCell.belongsToWords.down;
    
    console.log(`🧭 Cell belongs to ${direction}:`, belongsToCurrentDirection);
    
    if (!belongsToCurrentDirection) {
      console.log(`❌ Next cell (${nextRow}, ${nextCol}) doesn't belong to current ${direction} word`);
      return;
    }
    
    console.log(`✅ Moving to cell (${nextRow}, ${nextCol})`);
    setSelectedCell({ row: nextRow, col: nextCol });
    
    // Focus on next input automatically
    setTimeout(() => {
      const nextInput = document.querySelector(`input[data-cell="${nextRow}-${nextCol}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        console.log(`🎯 Focused on input at (${nextRow}, ${nextCol})`);
      } else {
        console.log(`❌ Could not find input for cell (${nextRow}, ${nextCol})`);
      }
    }, 50);
  };

  const moveToPreviousCell = (currentRow: number, currentCol: number, direction: 'across' | 'down') => {
    if (!puzzle) {
      console.log('No puzzle available for previous move');
      return;
    }
    
    console.log(`🔄 Moving backwards from (${currentRow}, ${currentCol}) in direction: ${direction}`);
    
    let prevRow = currentRow;
    let prevCol = currentCol;
    
    // Correctly handle direction for backward movement
    if (direction === 'across') {
      prevCol = currentCol - 1;
      console.log(`⬅️ Horizontal backward movement: ${currentCol} -> ${prevCol}`);
    } else { // direction === 'down'
      prevRow = currentRow - 1;
      console.log(`⬆️ Vertical backward movement: ${currentRow} -> ${prevRow}`);
    }
    
    console.log(`🎯 Previous target cell: (${prevRow}, ${prevCol})`);
    
    // Check bounds
    if (prevRow < 0 || prevCol < 0) {
      console.log(`❌ Previous cell (${prevRow}, ${prevCol}) is out of bounds`);
      return;
    }
    
    // Check if cell exists and is not blocked
    const prevCell = puzzle.grid[prevRow][prevCol];
    console.log(`🔍 Previous cell info:`, {
      isBlocked: prevCell.isBlocked,
      letter: prevCell.letter,
      belongsToWords: prevCell.belongsToWords
    });
    
    if (prevCell.isBlocked) {
      console.log(`🚫 Previous cell (${prevRow}, ${prevCol}) is blocked (black cell)`);
      return;
    }
    
    // Check if cell belongs to current direction
    const belongsToCurrentDirection = direction === 'across' 
      ? prevCell.belongsToWords.across 
      : prevCell.belongsToWords.down;
    
    console.log(`🧭 Previous cell belongs to ${direction}:`, belongsToCurrentDirection);
    
    if (!belongsToCurrentDirection) {
      console.log(`❌ Previous cell (${prevRow}, ${prevCol}) doesn't belong to current ${direction} word`);
      return;
    }
    
    return { row: prevRow, col: prevCol };
  };

  return {
    moveToNextCell,
    moveToPreviousCell
  };
};
