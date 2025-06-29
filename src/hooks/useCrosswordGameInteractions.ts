
import { useEffect } from 'react';
import { CrosswordPuzzle } from '@/types/crossword';
import { useCrosswordCellNavigation } from './useCrosswordCellNavigation';
import { useCrosswordInputHandling } from './useCrosswordInputHandling';

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

  const { moveToNextCell, moveToPreviousCell, moveWithArrows } = useCrosswordCellNavigation({
    puzzle,
    setSelectedCell,
    selectedCell
  });

  const { handleKeyDown, handleInputChange } = useCrosswordInputHandling({
    puzzle,
    setPuzzle,
    selectedCell,
    selectedDirection,
    hasGameStarted,
    setHasGameStarted,
    setCompletedWords,
    setIsCompleted,
    isCompleted,
    checkWordCompletion,
    moveToNextCell,
    moveToPreviousCell,
    setSelectedCell
  });

  // Navegação com setas do teclado
  useEffect(() => {
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        
        switch (event.key) {
          case 'ArrowUp':
            moveWithArrows('up');
            break;
          case 'ArrowDown':
            moveWithArrows('down');
            break;
          case 'ArrowLeft':
            moveWithArrows('left');
            break;
          case 'ArrowRight':
            moveWithArrows('right');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
  }, [moveWithArrows]);

  const handleCellClick = (row: number, col: number) => {
    if (!puzzle || puzzle.grid[row][col].isBlocked) return;
    
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      setSelectedDirection(selectedDirection === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
  };

  return {
    handleCellClick,
    handleInputChange,
    handleKeyDown
  };
};
