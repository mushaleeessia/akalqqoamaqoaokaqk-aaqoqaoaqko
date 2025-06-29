import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCrosswordPuzzle } from '@/utils/crosswordGenerator';
import { CrosswordPuzzle, CrosswordCell } from '@/types/crossword';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { useSupabaseGameSession } from '@/hooks/useSupabaseGameSession';
import { useToast } from '@/hooks/use-toast';

export const CrosswordGame = () => {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(() => generateCrosswordPuzzle());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [isComplete, setIsComplete] = useState(false);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Preparar dados para o sistema de sessão
  const targetWords = puzzle.clues.across.concat(puzzle.clues.down).map(clue => clue.answer);
  const { saveGameSession, sessionExists, loading } = useSupabaseGameSession('cruzadas', targetWords);

  const resetGame = () => {
    const newPuzzle = generateCrosswordPuzzle();
    setPuzzle(newPuzzle);
    setSelectedCell(null);
    setIsComplete(false);
    setCompletedWords(new Set());
  };

  const checkWordCompletion = useCallback((currentPuzzle: CrosswordPuzzle) => {
    const newCompletedWords = new Set<string>();
    let hasNewCompletion = false;

    // Verificar cada palavra nas pistas
    [...currentPuzzle.clues.across, ...currentPuzzle.clues.down].forEach(clue => {
      const wordKey = `${clue.direction}-${clue.number}`;
      let userWord = '';
      
      // Construir a palavra do usuário
      for (let i = 0; i < clue.length; i++) {
        const row = clue.direction === 'across' ? clue.startRow : clue.startRow + i;
        const col = clue.direction === 'across' ? clue.startCol + i : clue.startCol;
        userWord += currentPuzzle.grid[row][col].userInput || '';
      }

      // Verificar se a palavra está completa e correta
      if (userWord.length === clue.length && userWord.toUpperCase() === clue.answer.toUpperCase()) {
        newCompletedWords.add(wordKey);
        
        // Se é uma nova palavra completa, marcar como nova
        if (!completedWords.has(wordKey)) {
          hasNewCompletion = true;
        }
      }
    });

    if (hasNewCompletion) {
      // Mostrar toast para nova palavra completada
      const newWords = [...newCompletedWords].filter(word => !completedWords.has(word));
      if (newWords.length > 0) {
        toast({
          title: "Palavra completada! 🎉",
          description: `Parabéns! Você completou ${newWords.length} palavra(s).`,
          duration: 2000,
        });
      }
    }

    setCompletedWords(newCompletedWords);
    return newCompletedWords;
  }, [completedWords, toast]);

  const updateCell = useCallback((row: number, col: number, letter: string) => {
    if (puzzle.grid[row][col].isBlocked || puzzle.grid[row][col].isLocked) return;

    const newPuzzle = { ...puzzle };
    newPuzzle.grid = puzzle.grid.map((gridRow, r) =>
      gridRow.map((cell, c) => {
        if (r === row && c === col) {
          return { ...cell, userInput: letter.toUpperCase() };
        }
        return cell;
      })
    );

    setPuzzle(newPuzzle);
    
    // Verificar completude das palavras
    const newCompletedWords = checkWordCompletion(newPuzzle);
    
    // Marcar células das palavras completadas como corretas e bloqueadas
    newPuzzle.grid = newPuzzle.grid.map((gridRow, r) =>
      gridRow.map((cell, c) => {
        if (cell.isBlocked) return cell;
        
        let isPartOfCompletedWord = false;
        
        // Verificar se faz parte de alguma palavra completada
        if (cell.belongsToWords.across) {
          const wordKey = `across-${cell.belongsToWords.across}`;
          if (newCompletedWords.has(wordKey)) {
            isPartOfCompletedWord = true;
          }
        }
        
        if (cell.belongsToWords.down) {
          const wordKey = `down-${cell.belongsToWords.down}`;
          if (newCompletedWords.has(wordKey)) {
            isPartOfCompletedWord = true;
          }
        }
        
        if (isPartOfCompletedWord) {
          return { ...cell, isCorrect: true, isLocked: true };
        }
        
        return cell;
      })
    );

    setPuzzle(newPuzzle);
    checkFullCompletion(newPuzzle, newCompletedWords);
  }, [puzzle, checkWordCompletion]);

  const checkFullCompletion = (currentPuzzle: CrosswordPuzzle, completedWords: Set<string>) => {
    const totalWords = currentPuzzle.clues.across.length + currentPuzzle.clues.down.length;
    const completedCount = completedWords.size;
    
    if (completedCount === totalWords) {
      setIsComplete(true);
      
      // Salvar sessão do jogo
      const allGuesses = currentPuzzle.grid.flat()
        .filter(cell => !cell.isBlocked && cell.userInput)
        .map(cell => cell.userInput);
      
      saveGameSession(allGuesses, true);
      
      toast({
        title: "Parabéns! 🎊",
        description: "Você completou todas as palavras cruzadas!",
        duration: 5000,
      });
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const cell = puzzle.grid[row][col];
    if (cell.isBlocked || cell.isLocked) return;

    // Se já está selecionada, alternar direção
    if (selectedCell?.row === row && selectedCell?.col === col) {
      if (cell.belongsToWords.across && cell.belongsToWords.down) {
        setSelectedDirection(selectedDirection === 'across' ? 'down' : 'across');
      }
    } else {
      setSelectedCell({ row, col });
      // Definir direção baseada nas palavras disponíveis
      if (cell.belongsToWords.across && !cell.belongsToWords.down) {
        setSelectedDirection('across');
      } else if (cell.belongsToWords.down && !cell.belongsToWords.across) {
        setSelectedDirection('down');
      }
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    
    if (e.key.match(/^[a-zA-Z]$/)) {
      updateCell(row, col, e.key);
      moveToNextCell();
    } else if (e.key === 'Backspace') {
      updateCell(row, col, '');
      moveToPreviousCell();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || 
               e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      handleArrowKey(e.key);
    }
  }, [selectedCell, updateCell]);

  const moveToNextCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    let nextRow = row;
    let nextCol = col;

    if (selectedDirection === 'across') {
      nextCol = col + 1;
    } else {
      nextRow = row + 1;
    }

    if (nextRow < puzzle.size && nextCol < puzzle.size && 
        !puzzle.grid[nextRow][nextCol].isBlocked && 
        !puzzle.grid[nextRow][nextCol].isLocked) {
      setSelectedCell({ row: nextRow, col: nextCol });
    }
  };

  const moveToPreviousCell = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    let prevRow = row;
    let prevCol = col;

    if (selectedDirection === 'across') {
      prevCol = col - 1;
    } else {
      prevRow = row - 1;
    }

    if (prevRow >= 0 && prevCol >= 0 && 
        !puzzle.grid[prevRow][prevCol].isBlocked &&
        !puzzle.grid[prevRow][prevCol].isLocked) {
      setSelectedCell({ row: prevRow, col: prevCol });
    }
  };

  const handleArrowKey = (key: string) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    let newRow = row;
    let newCol = col;

    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(puzzle.size - 1, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(puzzle.size - 1, col + 1);
        break;
    }

    if (!puzzle.grid[newRow][newCol].isBlocked && !puzzle.grid[newRow][newCol].isLocked) {
      setSelectedCell({ row: newRow, col: newCol });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const getCellStyle = (row: number, col: number, cell: CrosswordCell) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSelectedWord = selectedCell && !cell.isBlocked && (
      (selectedDirection === 'across' && cell.belongsToWords.across === 
        puzzle.grid[selectedCell.row][selectedCell.col].belongsToWords.across) ||
      (selectedDirection === 'down' && cell.belongsToWords.down === 
        puzzle.grid[selectedCell.row][selectedCell.col].belongsToWords.down)
    );

    let className = 'w-6 h-6 border border-gray-400 flex items-center justify-center text-xs font-bold relative transition-colors ';
    
    if (cell.isBlocked) {
      className += 'bg-gray-900 cursor-default';
    } else if (cell.isCorrect && cell.isLocked) {
      className += 'bg-green-200/60 border-green-400 cursor-default';
    } else if (isSelected) {
      className += 'bg-blue-200 border-blue-500 cursor-pointer';
    } else if (isInSelectedWord) {
      className += 'bg-blue-50 cursor-pointer';
    } else {
      className += 'bg-white hover:bg-gray-50 cursor-pointer';
    }

    return className;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (sessionExists && !isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Você já jogou hoje!</h2>
            <p className="text-gray-600 mb-4">
              Volte amanhã para um novo desafio de palavras cruzadas.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Palavras Cruzadas
          </h1>
          <div className="flex justify-center gap-4 mb-4">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Novo Jogo
            </Button>
            {isComplete && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Parabéns! Puzzle completo!
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Palavras completadas: {completedWords.size} / {puzzle.clues.across.length + puzzle.clues.down.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade de palavras cruzadas */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div 
                  ref={gridRef}
                  className="grid gap-0 mx-auto w-fit border-2 border-gray-400"
                  style={{ 
                    gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                    fontSize: '10px'
                  }}
                >
                  {puzzle.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(rowIndex, colIndex, cell)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell.number && (
                          <span className="absolute top-0 left-0.5 text-xs leading-none font-normal">
                            {cell.number}
                          </span>
                        )}
                        <span className="text-center">
                          {cell.userInput || (cell.isBlocked ? '' : '')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Clique numa célula e digite as letras. Use as setas para navegar.
                  <br />
                  Palavras corretas ficam verdes e são bloqueadas.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pistas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Horizontais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {puzzle.clues.across.map((clue) => {
                  const isCompleted = completedWords.has(`across-${clue.number}`);
                  return (
                    <div key={`across-${clue.number}`} className={`text-sm ${isCompleted ? 'text-green-600 line-through' : ''}`}>
                      <span className="font-semibold">{clue.number}.</span> {clue.clue}
                      {isCompleted && <span className="ml-2">✓</span>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verticais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {puzzle.clues.down.map((clue) => {
                  const isCompleted = completedWords.has(`down-${clue.number}`);
                  return (
                    <div key={`down-${clue.number}`} className={`text-sm ${isCompleted ? 'text-green-600 line-through' : ''}`}>
                      <span className="font-semibold">{clue.number}.</span> {clue.clue}
                      {isCompleted && <span className="ml-2">✓</span>}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
