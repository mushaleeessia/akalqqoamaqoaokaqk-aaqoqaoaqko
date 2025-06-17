
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
  const getGridLayout = () => {
    switch (targetWords.length) {
      case 1:
        return 'grid-cols-1 justify-items-center max-w-md mx-auto';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto';
      case 3:
        return 'grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-7xl mx-auto';
      default:
        return 'grid-cols-1 gap-6 max-w-md mx-auto';
    }
  };

  return (
    <div className="w-full px-2">
      <div className={`grid ${getGridLayout()}`}>
        {targetWords.map((targetWord, index) => (
          <div key={index} className="flex flex-col items-center min-w-0">
            <div className="text-white/60 text-xs sm:text-sm mb-2 text-center">
              Palavra {index + 1}
            </div>
            <div className="transform scale-75 sm:scale-90 md:scale-100 origin-center">
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
