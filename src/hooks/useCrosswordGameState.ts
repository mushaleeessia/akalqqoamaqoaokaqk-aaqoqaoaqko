
import { useState, useEffect } from 'react';
import { generateCrosswordPuzzle } from '@/utils/crosswordGenerator';
import { CrosswordPuzzle, CrosswordCell } from '@/types/crossword';
import { useSupabaseGameSession } from '@/hooks/useSupabaseGameSession';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const useCrosswordGameState = () => {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [hasGameStarted, setHasGameStarted] = useState(false);
  
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const { saveGameSession, sessionExists } = useSupabaseGameSession('crossword', []);

  useEffect(() => {
    const savedPuzzle = localStorage.getItem('crossword_puzzle');
    const savedGameStarted = localStorage.getItem('crossword_game_started');
    
    if (savedPuzzle) {
      const parsedPuzzle = JSON.parse(savedPuzzle);
      setPuzzle(parsedPuzzle);
      setHasGameStarted(savedGameStarted === 'true');
      
      // Check if game was already completed
      const allCellsCorrect = parsedPuzzle.grid.every((row: CrosswordCell[]) =>
        row.every((cell: CrosswordCell) => {
          if (cell.isBlocked) return true;
          return cell.userInput.toUpperCase() === cell.letter.toUpperCase();
        })
      );
      
      if (allCellsCorrect) {
        setIsCompleted(true);
      }
    } else {
      generateNewPuzzle();
    }
  }, []);

  useEffect(() => {
    if (puzzle) {
      localStorage.setItem('crossword_puzzle', JSON.stringify(puzzle));
    }
  }, [puzzle]);

  // Only save game session when the game is actually completed
  useEffect(() => {
    if (puzzle && isCompleted && hasGameStarted && !sessionExists) {
      const completedCount = countCompletedWords(puzzle);
      saveGameSession([completedCount.toString()], true);
    }
  }, [isCompleted, hasGameStarted, sessionExists]);

  const countCompletedWords = (currentPuzzle: CrosswordPuzzle): number => {
    const completed = checkWordCompletion(currentPuzzle);
    return completed.size;
  };

  const getTotalWords = (): number => {
    if (!puzzle) return 0;
    return puzzle.clues.across.length + puzzle.clues.down.length;
  };

  const generateNewPuzzle = () => {
    const newPuzzle = generateCrosswordPuzzle();
    setPuzzle(newPuzzle);
    setSelectedCell(null);
    setIsCompleted(false);
    setCompletedWords(new Set());
    setHasGameStarted(false);
    
    // Clear localStorage
    localStorage.removeItem('crossword_puzzle');
    localStorage.removeItem('crossword_game_started');
  };

  const checkWordCompletion = (currentPuzzle: CrosswordPuzzle): Set<string> => {
    const completed = new Set<string>();
    
    // Verificar palavras horizontais
    currentPuzzle.clues.across.forEach(clue => {
      let isWordComplete = true;
      for (let i = 0; i < clue.length; i++) {
        const cell = currentPuzzle.grid[clue.startRow][clue.startCol + i];
        if (cell.userInput.toUpperCase() !== cell.letter.toUpperCase()) {
          isWordComplete = false;
          break;
        }
      }
      if (isWordComplete) {
        completed.add(`across-${clue.number}`);
      }
    });
    
    // Verificar palavras verticais
    currentPuzzle.clues.down.forEach(clue => {
      let isWordComplete = true;
      for (let i = 0; i < clue.length; i++) {
        const cell = currentPuzzle.grid[clue.startRow + i][clue.startCol];
        if (cell.userInput.toUpperCase() !== cell.letter.toUpperCase()) {
          isWordComplete = false;
          break;
        }
      }
      if (isWordComplete) {
        completed.add(`down-${clue.number}`);
      }
    });
    
    return completed;
  };

  return {
    puzzle,
    setPuzzle,
    selectedCell,
    setSelectedCell,
    selectedDirection,
    setSelectedDirection,
    isCompleted,
    setIsCompleted,
    completedWords,
    setCompletedWords,
    hasGameStarted,
    setHasGameStarted,
    generateNewPuzzle,
    countCompletedWords,
    getTotalWords,
    checkWordCompletion
  };
};
