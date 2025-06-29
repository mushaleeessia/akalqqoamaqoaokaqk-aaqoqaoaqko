
import { CrosswordPuzzle } from '@/types/crossword';
import { updateCellCorrectness, checkCompletion } from '@/utils/crosswordCellUtils';

interface UseCrosswordGameInteractionsProps {
  puzzle: CrosswordPuzzle | null;
  setPuzzle: (puzzle: CrosswordPuzzle) => void;
  selectedCell: { row: number; col: number } | null;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
  selectedDirection: 'across' | 'down';
  setSelectedDirection: (direction: 'across' | 'down') => void;
  hasGameStarted: boolean;
  setHasGameStarted: (started: boolean) => void;
  setCompletedWords: (words: Set<string>) => void;
  setIsCompleted: (completed: boolean) => void;
  isCompleted: boolean;
  checkWordCompletion: (puzzle: CrosswordPuzzle) => Set<string>;
}

export const useCrosswordGameInteractions = ({
  puzzle,
  setPuzzle,
  selectedCell,
  setSelectedCell,
  selectedDirection,
  setSelectedDirection,
  hasGameStarted,
  setHasGameStarted,
  setCompletedWords,
  setIsCompleted,
  isCompleted,
  checkWordCompletion
}: UseCrosswordGameInteractionsProps) => {

  const handleCellClick = (row: number, col: number) => {
    if (!puzzle || puzzle.grid[row][col].isBlocked) return;
    
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setSelectedDirection(selectedDirection === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
  };

  const moveToNextCell = (currentRow: number, currentCol: number, direction: 'across' | 'down') => {
    if (!puzzle) {
      console.log('No puzzle available');
      return;
    }
    
    console.log(`Moving from (${currentRow}, ${currentCol}) in direction: ${direction}`);
    
    let nextRow = currentRow;
    let nextCol = currentCol;
    
    if (direction === 'across') {
      nextCol = currentCol + 1;
    } else {
      nextRow = currentRow + 1;
    }
    
    console.log(`Next cell would be: (${nextRow}, ${nextCol})`);
    
    // Verificar limites
    if (nextRow >= puzzle.size || nextCol >= puzzle.size) {
      console.log('Next cell is out of bounds');
      return;
    }
    
    // Verificar se a célula é realmente bloqueada (preta) ou apenas uma interseção
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
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!puzzle) return;
    
    console.log(`Input change at (${row}, ${col}): "${value}"`);
    
    // Mark game as started when first input is made
    if (!hasGameStarted && value.trim() !== '') {
      setHasGameStarted(true);
      localStorage.setItem('crossword_game_started', 'true');
    }
    
    const newGrid = [...puzzle.grid];
    newGrid[row][col] = { ...newGrid[row][col], userInput: value.toUpperCase() };
    
    let newPuzzle = { ...puzzle, grid: newGrid };
    
    // Verificar palavras completadas
    const completed = checkWordCompletion(newPuzzle);
    setCompletedWords(completed);
    
    // Atualizar células com estado de correção
    newPuzzle = updateCellCorrectness(newPuzzle, completed);
    
    setPuzzle(newPuzzle);
    
    const allCellsCorrect = checkCompletion(newPuzzle);
    if (allCellsCorrect && !isCompleted) {
      setIsCompleted(true);
    }
    
    // Mover para a próxima célula se uma letra foi digitada
    if (value.trim() !== '' && selectedCell && value.length === 1) {
      console.log(`Attempting to move from selected cell: (${selectedCell.row}, ${selectedCell.col}) in direction: ${selectedDirection}`);
      moveToNextCell(selectedCell.row, selectedCell.col, selectedDirection);
    }
  };

  return {
    handleCellClick,
    handleInputChange
  };
};
