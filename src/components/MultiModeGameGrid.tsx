
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
  return (
    <div className={`grid gap-6 w-full ${
      targetWords.length === 1 
        ? 'grid-cols-1 justify-items-center max-w-md' 
        : targetWords.length === 2 
          ? 'grid-cols-2 max-w-2xl' 
          : targetWords.length === 3 
            ? 'grid-cols-3 max-w-4xl' 
            : 'grid-cols-2 lg:grid-cols-4 max-w-6xl'
    }`}>
      {targetWords.map((targetWord, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-white/60 text-sm mb-2">
            Palavra {index + 1}
          </div>
          <TermoGrid
            guesses={gameState.guesses}
            currentGuess={gameState.currentGuess}
            targetWord={targetWord}
            currentRow={gameState.currentRow}
            maxGuesses={maxGuesses}
            isDarkMode={isDarkMode}
          />
        </div>
      ))}
    </div>
  );
};
