
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
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8 place-items-center w-full';
      case 3:
        return 'grid grid-cols-1 lg:grid-cols-3 gap-12 place-items-center w-full';
      case 4:
        return 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 w-full justify-items-center';
      default:
        return 'flex justify-center';
    }
  };

  const getGridScale = () => {
    switch (targetWords.length) {
      case 1:
        return 'scale-100';
      case 2:
        return 'scale-90 lg:scale-100';
      case 3:
        return 'scale-80 lg:scale-90';
      case 4:
        return 'scale-85 lg:scale-100';
      default:
        return 'scale-100';
    }
  };

  const getItemClass = () => {
    switch (targetWords.length) {
      case 4:
        return 'flex flex-col items-center space-y-1 min-w-0';
      default:
        return 'flex flex-col items-center space-y-2';
    }
  };

  return (
    <div className="w-full max-w-none px-2 lg:px-4">
      <div className={getContainerClass()}>
        {targetWords.map((targetWord, index) => (
          <div key={index} className={getItemClass()}>
            <div className={`text-white/60 font-medium text-center ${
              targetWords.length === 4 ? 'text-xs' : 'text-sm'
            }`}>
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
