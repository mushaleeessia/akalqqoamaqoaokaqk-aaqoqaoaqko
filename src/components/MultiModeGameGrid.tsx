
import { TermoGrid } from "./TermoGrid";
import { MultiModeGameState } from "@/hooks/useMultiModeGameState";

interface MultiModeGameGridProps {
  targetWords: string[];
  gameState: MultiModeGameState;
  maxGuesses: number;
  isDarkMode: boolean;
}

export const MultiModeGameGrid = ({ 
  targetWords, 
  gameState, 
  maxGuesses, 
  isDarkMode 
}: MultiModeGameGridProps) => {
  const getContainerClass = () => {
    switch (targetWords.length) {
      case 1:
        return 'flex justify-center';
      case 2:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8 place-items-center';
      case 3:
        return 'grid grid-cols-1 xl:grid-cols-3 gap-6 place-items-center';
      case 4:
        return 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 place-items-center';
      default:
        return 'flex justify-center';
    }
  };

  const getGridScale = () => {
    switch (targetWords.length) {
      case 1:
        return 'scale-100';
      case 2:
        return 'scale-90 lg:scale-95';
      case 3:
        return 'scale-75 xl:scale-85';
      case 4:
        return 'scale-65 lg:scale-75 xl:scale-80';
      default:
        return 'scale-100';
    }
  };

  return (
    <div className="w-full p-4">
      <div className={getContainerClass()}>
        {targetWords.map((targetWord, index) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="text-white/60 text-xs font-medium text-center">
              Palavra {index + 1}
            </div>
            <div className={`transform origin-center ${getGridScale()}`}>
              <TermoGrid
                guesses={gameState.guesses}
                currentGuess={gameState.currentGuess}
                targetWord={targetWord}
                currentRow={gameState.currentRow}
                maxGuesses={maxGuesses}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
