
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CrosswordPuzzle } from '@/types/crossword';
import { CrosswordVirtualKeyboard } from './CrosswordVirtualKeyboard';
import { useIsMobile } from '@/hooks/useIsMobile';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  selectedCell: { row: number; col: number } | null;
  isCompleted: boolean;
  onCellClick: (row: number, col: number) => void;
  onInputChange: (row: number, col: number, value: string) => void;
  onKeyDown: (row: number, col: number, event: React.KeyboardEvent) => void;
  onNewGame: () => void;
  onVirtualKeyPress?: (key: string) => void;
  onVirtualDelete?: () => void;
}

export const CrosswordGrid = ({ 
  puzzle, 
  selectedCell, 
  isCompleted, 
  onCellClick, 
  onInputChange,
  onKeyDown,
  onNewGame,
  onVirtualKeyPress,
  onVirtualDelete
}: CrosswordGridProps) => {
  const isMobile = useIsMobile();

  // Calcular tamanho da célula baseado no tamanho do grid
  const getCellSize = (gridSize: number) => {
    if (gridSize <= 15) return 'w-12 h-12';
    if (gridSize <= 19) return 'w-10 h-10';
    if (gridSize <= 23) return 'w-8 h-8';
    return 'w-7 h-7';
  };

  const getTextSize = (gridSize: number) => {
    if (gridSize <= 15) return 'text-lg';
    if (gridSize <= 19) return 'text-base';
    if (gridSize <= 23) return 'text-sm';
    return 'text-xs';
  };

  const getNumberSize = (gridSize: number) => {
    if (gridSize <= 15) return 'text-xs';
    if (gridSize <= 19) return 'text-[10px]';
    return 'text-[8px]';
  };

  const cellSize = getCellSize(puzzle.size);
  const textSize = getTextSize(puzzle.size);
  const numberSize = getNumberSize(puzzle.size);

  return (
    <div className="flex-1 flex flex-col items-center space-y-6">
      <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 border border-white/20 dark:border-gray-700 max-w-full overflow-auto">
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
                  ${cellSize} border-2 border-gray-400 dark:border-gray-600 relative cursor-pointer rounded-sm
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
                      <span className={`absolute top-0 left-0.5 ${numberSize} font-bold leading-none text-black dark:text-white z-10 bg-white/80 dark:bg-gray-800/80 px-0.5 rounded-br`}>
                        {cell.number}
                      </span>
                    )}
                    <Input
                      value={cell.userInput}
                      onChange={(e) => onInputChange(rowIndex, colIndex, e.target.value)}
                      onKeyDown={(e) => onKeyDown(rowIndex, colIndex, e)}
                      className={`w-full h-full border-none bg-transparent text-center ${textSize} font-bold p-0 focus:outline-none focus:ring-0 text-black dark:text-white pt-3`}
                      maxLength={1}
                      data-cell={`${rowIndex}-${colIndex}`}
                      readOnly={isMobile}
                    />
                  </>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-300 dark:text-gray-400">
            Use as setas do teclado para se mover entre os espaços
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Grade {puzzle.size}×{puzzle.size} • {puzzle.clues.across.length + puzzle.clues.down.length} palavras
          </p>
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

      {/* Teclado virtual para dispositivos móveis */}
      {isMobile && onVirtualKeyPress && onVirtualDelete && (
        <CrosswordVirtualKeyboard 
          onKeyPress={onVirtualKeyPress}
          onDelete={onVirtualDelete}
          isDarkMode
        />
      )}
    </div>
  );
};
