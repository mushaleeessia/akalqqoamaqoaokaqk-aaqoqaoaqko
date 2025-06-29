
import { useState, useEffect } from 'react';
import { generateCrosswordPuzzle } from '@/utils/crosswordGenerator';
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { useSupabaseGameSession } from '@/hooks/useSupabaseGameSession';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { CrosswordHeader } from './CrosswordHeader';
import { CrosswordGrid } from './CrosswordGrid';
import { CrosswordClues } from './CrosswordClues';

export const CrosswordGameContainer = () => {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  // Use "crossword" mode instead of "solo"
  const { saveGameSession } = useSupabaseGameSession('crossword', []);

  useEffect(() => {
    const savedPuzzle = localStorage.getItem('crossword_puzzle');
    if (savedPuzzle) {
      setPuzzle(JSON.parse(savedPuzzle));
    } else {
      generateNewPuzzle();
    }
  }, []);

  useEffect(() => {
    if (puzzle) {
      localStorage.setItem('crossword_puzzle', JSON.stringify(puzzle));
    }
  }, [puzzle]);

  useEffect(() => {
    if (puzzle && user && !isGuestMode) {
      const completedCount = countCompletedWords(puzzle);
      saveGameSession([completedCount.toString()], isCompleted);
    }
  }, [puzzle, user, isGuestMode, saveGameSession, isCompleted]);

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

  const updateCellCorrectness = (currentPuzzle: CrosswordPuzzle, completedWordsSet: Set<string>): CrosswordPuzzle => {
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
  };

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
    
    const newGrid = [...puzzle.grid];
    newGrid[row][col] = { ...newGrid[row][col], userInput: value.toUpperCase() };
    
    let newPuzzle = { ...puzzle, grid: newGrid };
    
    // Verificar palavras completadas
    const completed = checkWordCompletion(newPuzzle);
    setCompletedWords(completed);
    
    // Atualizar células com estado de correção
    newPuzzle = updateCellCorrectness(newPuzzle, completed);
    
    setPuzzle(newPuzzle);
    
    checkCompletion(newPuzzle);
  };

  const checkCompletion = (currentPuzzle: CrosswordPuzzle) => {
    const allCellsCorrect = currentPuzzle.grid.every((row) =>
      row.every((cell) => {
        if (cell.isBlocked) return true;
        return cell.userInput.toUpperCase() === cell.letter.toUpperCase();
      })
    );
    
    if (allCellsCorrect) {
      setIsCompleted(true);
    }
  };

  if (!puzzle) {
    return <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-900">Carregando...</div>;
  }

  const completedWordsCount = countCompletedWords(puzzle);
  const totalWords = getTotalWords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
      <CrosswordHeader completedWords={completedWordsCount} totalWords={totalWords} />

      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <CrosswordGrid 
            puzzle={puzzle}
            selectedCell={selectedCell}
            isCompleted={isCompleted}
            onCellClick={handleCellClick}
            onInputChange={handleInputChange}
            onNewGame={generateNewPuzzle}
          />

          <CrosswordClues puzzle={puzzle} />
        </div>
      </div>
    </div>
  );
};
