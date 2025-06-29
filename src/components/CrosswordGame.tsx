
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateCrosswordPuzzle } from '@/utils/crosswordGenerator';
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { useSupabaseGameSession } from '@/hooks/useSupabaseGameSession';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { UserDropdown } from '@/components/UserDropdown';
import { GuestModeDropdown } from '@/components/GuestModeDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const CrosswordGame = () => {
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

  useEffect(() => {
    generateNewPuzzle();
  }, []);

  if (!puzzle) {
    return <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-900">Carregando...</div>;
  }

  const completedWords = countCompletedWords(puzzle);
  const totalWords = getTotalWords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
      {/* Header with theme switch and user dropdown */}
      <div className="flex justify-between items-center p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Palavras Cruzadas</h1>
          <div className="text-lg font-semibold text-blue-300 dark:text-blue-400">
            Palavras {completedWords}/{totalWords}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeSwitch />
          {user && !isGuestMode ? (
            <UserDropdown 
              nickname={user.user_metadata?.nickname || user.email?.split('@')[0] || 'Usuário'} 
              currentMode="solo"
            />
          ) : isGuestMode ? (
            <GuestModeDropdown />
          ) : null}
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Grid */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-white/20 dark:border-gray-700">
              <div 
                className="grid gap-1 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                  width: 'fit-content'
                }}
              >
                {puzzle.grid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-8 h-8 border border-gray-400 dark:border-gray-600 relative cursor-pointer
                        ${cell.isBlocked 
                          ? 'bg-black dark:bg-gray-900' 
                          : selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                          ? 'bg-blue-400 dark:bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-black dark:text-white'
                        }
                      `}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {!cell.isBlocked && (
                        <>
                          {cell.number && (
                            <span className="absolute top-0 left-0 text-xs font-bold leading-none p-0.5 text-black dark:text-white">
                              {cell.number}
                            </span>
                          )}
                          <Input
                            value={cell.userInput}
                            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                            className="w-full h-full border-none bg-transparent text-center text-sm font-bold p-0 focus:outline-none focus:ring-0 text-black dark:text-white"
                            maxLength={1}
                          />
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-center">
                <Button onClick={generateNewPuzzle} className="bg-green-600 hover:bg-green-700">
                  Novo Jogo
                </Button>
              </div>
              
              {isCompleted && (
                <div className="mt-4 text-center">
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-green-400">Parabéns!</h2>
                    <p className="text-green-300">Você completou o jogo!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clues */}
          <div className="lg:w-80">
            <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-white/20 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">Definições</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300 dark:text-blue-400">Horizontais</h3>
                  <div className="space-y-2">
                    {puzzle.clues.across.map((clue) => (
                      <div key={`across-${clue.number}`} className="text-sm">
                        <span className="font-bold">{clue.number}.</span> {clue.clue} ({clue.length} letras)
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-green-300 dark:text-green-400">Verticais</h3>
                  <div className="space-y-2">
                    {puzzle.clues.down.map((clue) => (
                      <div key={`down-${clue.number}`} className="text-sm">
                        <span className="font-bold">{clue.number}.</span> {clue.clue} ({clue.length} letras)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
