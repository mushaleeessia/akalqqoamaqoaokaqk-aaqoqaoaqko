
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
        return 'grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 w-full max-w-none';
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
        return 'scale-50 lg:scale-65';
      default:
        return 'scale-100';
    }
  };

  const getItemClass = () => {
    switch (targetWords.length) {
      case 4:
        return 'flex flex-col items-center space-y-1';
      default:
        return 'flex flex-col items-center space-y-2';
    }
  };

  return (
    <div className={`w-full ${targetWords.length === 4 ? 'px-2' : 'p-4'}`}>
      <div className={getContainerClass()}>
        {targetWords.map((targetWord, index) => (
          <div key={index} className={getItemClass()}>
            <div className={`text-white/60 font-medium text-center ${
              targetWords.length === 4 ? 'text-xs' : 'text-xs'
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
