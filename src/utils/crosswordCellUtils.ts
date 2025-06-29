
import { CrosswordPuzzle } from '@/types/crossword';

export const updateCellCorrectness = (currentPuzzle: CrosswordPuzzle, completedWordsSet: Set<string>): CrosswordPuzzle => {
  const newGrid = currentPuzzle.grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (cell.isBlocked) return cell;
      
      // Verificar se esta célula pertence a alguma palavra completada
      let isPartOfCompletedWord = false;
      
      if (cell.belongsToWords.across) {
        if (completedWordsSet.has(`across-${cell.belongsToWords.across}`)) {
          isPartOfCompletedWord = true;
        }
      }
      
      if (cell.belongsToWords.down) {
        if (completedWordsSet.has(`down-${cell.belongsToWords.down}`)) {
          isPartOfCompletedWord = true;
        }
      }
      
      return {
        ...cell,
        isCorrect: isPartOfCompletedWord
      };
    })
  );
  
  return { ...currentPuzzle, grid: newGrid };
};

export const checkCompletion = (currentPuzzle: CrosswordPuzzle): boolean => {
  return currentPuzzle.grid.every((row) =>
    row.every((cell) => {
      if (cell.isBlocked) return true;
      return cell.userInput.toUpperCase() === cell.letter.toUpperCase();
    })
  );
};
