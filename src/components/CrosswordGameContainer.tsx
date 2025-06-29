
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
  
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const { saveGameSession } = useSupabaseGameSession('cruzadas', []);

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
      // Para palavras cruzadas, vamos contar quantas palavras foram completadas corretamente
      const completedWords = countCompletedWords(puzzle);
      saveGameSession([completedWords.toString()], isCompleted);
    }
  }, [puzzle, user, isGuestMode, saveGameSession, isCompleted]);

  const countCompletedWords = (currentPuzzle: CrosswordPuzzle): number => {
    let completedCount = 0;
    
    // Verificar palavras horizontais
    currentPuzzle.clues.across.forEach(clue => {
      let isWordComplete = true;
      for (let i = 0; i < clue.length; i++) {
        const cell = currentPuzzle.grid[clue.startRow][clue.startCol + i];
        if (cell.userInput !== cell.letter) {
          isWordComplete = false;
          break;
        }
      }
      if (isWordComplete) completedCount++;
    });
    
    // Verificar palavras verticais
    currentPuzzle.clues.down.forEach(clue => {
      let isWordComplete = true;
      for (let i = 0; i < clue.length; i++) {
        const cell = currentPuzzle.grid[clue.startRow + i][clue.startCol];
        if (cell.userInput !== cell.letter) {
          isWordComplete = false;
          break;
        }
      }
      if (isWordComplete) completedCount++;
    });
    
    return completedCount;
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
    
    const newPuzzle = { ...puzzle, grid: newGrid };
    setPuzzle(newPuzzle);
    
    checkCompletion(newPuzzle);
  };

  const checkCompletion = (currentPuzzle: CrosswordPuzzle) => {
    const allCellsCorrect = currentPuzzle.grid.every((row, rowIndex) =>
      row.every((cell, colIndex) => {
        if (cell.isBlocked) return true;
        return cell.userInput === cell.letter;
      })
    );
    
    if (allCellsCorrect) {
      setIsCompleted(true);
    }
  };

  const getClueForCell = (row: number, col: number, direction: 'across' | 'down'): CrosswordClue | null => {
    if (!puzzle) return null;
    
    const cell = puzzle.grid[row][col];
    const clueNumber = cell.belongsToWords?.[direction];
    
    if (!clueNumber) return null;
    
    return puzzle.clues[direction].find(clue => clue.number === clueNumber) || null;
  };

  if (!puzzle) {
    return <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-900">Carregando...</div>;
  }

  const completedWords = countCompletedWords(puzzle);
  const totalWords = getTotalWords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
      {/* Header with theme switch and user dropdown */}
      <CrosswordHeader completedWords={completedWords} totalWords={totalWords} />

      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Grid */}
          <CrosswordGrid 
            puzzle={puzzle}
            selectedCell={selectedCell}
            isCompleted={isCompleted}
            onCellClick={handleCellClick}
            onInputChange={handleInputChange}
            onNewGame={generateNewPuzzle}
          />

          {/* Clues */}
          <CrosswordClues puzzle={puzzle} />
        </div>
      </div>
    </div>
  );
};
