
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
    <div className="flex justify-center mb-6">
      <div 
        className="grid gap-1 p-4 bg-white/10 rounded-lg backdrop-blur-sm"
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
          maxWidth: '600px',
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
                  "aspect-square flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 relative",
                  cell.belongsToWord
                    ? cn(
                        "border-2 border-white/30",
                        isDarkMode ? "bg-gray-700" : "bg-white",
                        isSelected && "ring-2 ring-yellow-400",
                        isInSelectedWord && !isSelected && (isDarkMode ? "bg-blue-800" : "bg-blue-200"),
                        isCompleted && (isDarkMode ? "bg-green-800 text-green-200" : "bg-green-200 text-green-800"),
                        isDarkMode ? "text-white" : "text-gray-900"
                      )
                    : "bg-transparent"
                )}
                onClick={() => cell.belongsToWord && onCellClick(rowIndex, colIndex)}
              >
                {cell.belongsToWord && (
                  <>
                    {cell.number && (
                      <span className="absolute top-0.5 left-0.5 text-xs font-bold text-blue-600">
                        {cell.number}
                      </span>
                    )}
                    <span className="text-lg font-bold">
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
