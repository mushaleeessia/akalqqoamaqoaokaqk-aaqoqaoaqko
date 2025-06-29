
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CrosswordPuzzle } from '@/types/crossword';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  selectedCell: { row: number; col: number } | null;
  isCompleted: boolean;
  onCellClick: (row: number, col: number) => void;
  onInputChange: (row: number, col: number, value: string) => void;
  onNewGame: () => void;
}

export const CrosswordGrid = ({ 
  puzzle, 
  selectedCell, 
  isCompleted, 
  onCellClick, 
  onInputChange, 
  onNewGame 
}: CrosswordGridProps) => {
  return (
    <div className="flex-1 flex justify-center">
      <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 border border-white/20 dark:border-gray-700">
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
                  w-12 h-12 border-2 border-gray-400 dark:border-gray-600 relative cursor-pointer rounded-sm
                  ${cell.isBlocked 
                    ? 'bg-black dark:bg-gray-900' 
                    : cell.isCorrect
                    ? 'bg-green-400/30 dark:bg-green-600/30 text-black dark:text-white'
                    : selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                    ? 'bg-blue-400 dark:bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-black dark:text-white'
                  }
                  transition-colors duration-200
                `}
                onClick={() => onCellClick(rowIndex, colIndex)}
              >
                {!cell.isBlocked && (
                  <>
                    {cell.number && (
                      <span className="absolute top-0.5 left-1 text-xs font-bold leading-none text-black dark:text-white">
                        {cell.number}
                      </span>
                    )}
                    <Input
                      value={cell.userInput}
                      onChange={(e) => onInputChange(rowIndex, colIndex, e.target.value)}
                      className="w-full h-full border-none bg-transparent text-center text-lg font-bold p-0 focus:outline-none focus:ring-0 text-black dark:text-white"
                      maxLength={1}
                      data-cell={`${rowIndex}-${colIndex}`}
                    />
                  </>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Button onClick={onNewGame} className="bg-green-600 hover:bg-green-700 px-6 py-2">
            Novo Jogo
          </Button>
        </div>
        
        {isCompleted && (
          <div className="mt-6 text-center">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-400">Parabéns!</h2>
              <p className="text-green-300 mt-2">Você completou o jogo!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
