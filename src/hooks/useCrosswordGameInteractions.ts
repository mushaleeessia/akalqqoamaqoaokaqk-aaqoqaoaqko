
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
  };

  return {
    handleCellClick,
    handleInputChange
  };
};
