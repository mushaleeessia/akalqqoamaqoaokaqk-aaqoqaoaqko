
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateCrosswordPuzzle } from '@/utils/crosswordGenerator';
import { CrosswordPuzzle, CrosswordCell } from '@/types/crossword';
import { CheckCircle, RotateCcw } from 'lucide-react';

export const CrosswordGame = () => {
  const [puzzle, setPuzzle] = useState<CrosswordPuzzle>(() => generateCrosswordPuzzle());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [isComplete, setIsComplete] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const resetGame = () => {
    const newPuzzle = generateCrosswordPuzzle();
    setPuzzle(newPuzzle);
    setSelectedCell(null);
    setIsComplete(false);
  };

  const updateCell = useCallback((row: number, col: number, letter: string) => {
    if (puzzle.grid[row][col].isBlocked) return;

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
    checkCompletion(newPuzzle);
  }, [puzzle]);

  const checkCompletion = (currentPuzzle: CrosswordPuzzle) => {
    const allCorrect = currentPuzzle.grid.every((row, r) =>
      row.every((cell, c) => {
        if (cell.isBlocked) return true;
        return cell.userInput === cell.letter;
      })
    );
    setIsComplete(allCorrect);
  };

  const handleCellClick = (row: number, col: number) => {
    const cell = puzzle.grid[row][col];
    if (cell.isBlocked) return;

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
        !puzzle.grid[nextRow][nextCol].isBlocked) {
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
        !puzzle.grid[prevRow][prevCol].isBlocked) {
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

    if (!puzzle.grid[newRow][newCol].isBlocked) {
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

    let className = 'w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold relative cursor-pointer transition-colors ';
    
    if (cell.isBlocked) {
      className += 'bg-gray-900 cursor-default';
    } else if (isSelected) {
      className += 'bg-blue-200 border-blue-500';
    } else if (isInSelectedWord) {
      className += 'bg-blue-50';
    } else {
      className += 'bg-white hover:bg-gray-50';
    }

    return className;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Grade de palavras cruzadas */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div 
                  ref={gridRef}
                  className="grid grid-cols-10 gap-0 mx-auto w-fit border-2 border-gray-400"
                  style={{ fontSize: '12px' }}
                >
                  {puzzle.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getCellStyle(rowIndex, colIndex, cell)}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {cell.number && (
                          <span className="absolute top-0 left-0 text-xs leading-none p-0.5">
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
              <CardContent className="space-y-2">
                {puzzle.clues.across.map((clue) => (
                  <div key={`across-${clue.number}`} className="text-sm">
                    <span className="font-semibold">{clue.number}.</span> {clue.clue}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verticais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {puzzle.clues.down.map((clue) => (
                  <div key={`down-${clue.number}`} className="text-sm">
                    <span className="font-semibold">{clue.number}.</span> {clue.clue}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
