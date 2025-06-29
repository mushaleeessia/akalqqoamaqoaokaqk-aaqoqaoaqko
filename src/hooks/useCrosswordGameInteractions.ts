
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
    if (!puzzle) return;
    
    let nextRow = currentRow;
    let nextCol = currentCol;
    
    if (direction === 'across') {
      nextCol = currentCol + 1;
    } else {
      nextRow = currentRow + 1;
    }
    
    // Verificar se a próxima célula está dentro dos limites e não é bloqueada
    if (nextRow < puzzle.size && nextCol < puzzle.size && !puzzle.grid[nextRow][nextCol].isBlocked) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!puzzle) return;
    
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
    if (value.trim() !== '' && selectedCell) {
      moveToNextCell(row, col, selectedDirection);
    }
  };

  return {
    handleCellClick,
    handleInputChange
  };
};
