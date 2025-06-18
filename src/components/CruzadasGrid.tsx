
import { CruzadasPuzzle } from '@/hooks/useCruzadasData';
import { GameProgress } from '@/hooks/useCruzadasGameState';
import { cn } from '@/lib/utils';

interface CruzadasGridProps {
  puzzle: CruzadasPuzzle;
  gameProgress: GameProgress;
  onCellClick: (row: number, col: number) => void;
  isDarkMode: boolean;
}

export const CruzadasGrid = ({ puzzle, gameProgress, onCellClick, isDarkMode }: CruzadasGridProps) => {
  const { grid, selectedCell, selectedWord, completedWords } = gameProgress;

  const isCellInSelectedWord = (row: number, col: number): boolean => {
    if (!selectedWord) return false;
    
    for (let i = 0; i < selectedWord.word.length; i++) {
      const wordRow = selectedWord.direction === 'horizontal' ? selectedWord.startRow : selectedWord.startRow + i;
      const wordCol = selectedWord.direction === 'horizontal' ? selectedWord.startCol + i : selectedWord.startCol;
      
      if (wordRow === row && wordCol === col) {
        return true;
      }
    }
    
    return false;
  };

  const getCellWordIds = (row: number, col: number): number[] => {
    return grid[row][col].wordIds || [];
  };

  const isCellInCompletedWord = (row: number, col: number): boolean => {
    const cellWordIds = getCellWordIds(row, col);
    return cellWordIds.some(id => completedWords.has(id));
  };

  return (
    <div className="flex justify-center mb-8">
      <div 
        className={cn(
          "grid gap-0 border-2 border-black bg-black rounded-sm shadow-lg",
          isDarkMode && "border-gray-600 bg-gray-600"
        )}
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
          maxWidth: '500px',
          aspectRatio: '1'
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isInSelectedWord = isCellInSelectedWord(rowIndex, colIndex);
            const isCompleted = isCellInCompletedWord(rowIndex, colIndex);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  "aspect-square flex items-center justify-center text-lg font-bold cursor-pointer relative border border-black",
                  cell.belongsToWord
                    ? cn(
                        "bg-white text-black transition-all duration-150",
                        isSelected && "bg-yellow-300 ring-2 ring-yellow-500",
                        isInSelectedWord && !isSelected && "bg-blue-100",
                        isCompleted && "bg-green-100 text-green-800",
                        isDarkMode && !isSelected && !isInSelectedWord && !isCompleted && "bg-gray-100",
                        isDarkMode && isInSelectedWord && !isSelected && "bg-blue-200",
                        isDarkMode && isCompleted && "bg-green-200 text-green-900"
                      )
                    : cn(
                        "bg-black cursor-default",
                        isDarkMode && "bg-gray-800"
                      )
                )}
                onClick={() => cell.belongsToWord && onCellClick(rowIndex, colIndex)}
              >
                {cell.belongsToWord && (
                  <>
                    {cell.number && (
                      <span className={cn(
                        "absolute top-0.5 left-0.5 text-xs font-bold leading-none",
                        isDarkMode ? "text-blue-700" : "text-blue-600"
                      )}>
                        {cell.number}
                      </span>
                    )}
                    <span className="text-lg font-bold select-none">
                      {cell.letter}
                    </span>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
