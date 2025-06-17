
import { useEffect } from "react";
import { GameMode } from "./GameModeSelector";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { MultiModeCompletedMessage } from "./MultiModeCompletedMessage";
import { MultiModeGameGrid } from "./MultiModeGameGrid";
import { useMultiModeGameState } from "@/hooks/useMultiModeGameState";

interface MultiModeTermoGameProps {
  targetWords: string[];
  mode: GameMode;
  isDarkMode: boolean;
}

export const MultiModeTermoGame = ({ targetWords, mode, isDarkMode }: MultiModeTermoGameProps) => {
  const {
    gameState,
    keyStates,
    isValidating,
    showingFreshGameOver,
    setShowingFreshGameOver,
    maxGuesses,
    handleKeyPress,
    canPlay,
    sessionInfo
  } = useMultiModeGameState(targetWords, mode);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        event.preventDefault();
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        event.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (/^[A-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const handlePlayAgain = () => {
    setShowingFreshGameOver(false);
    window.location.reload();
  };

  if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && showingFreshGameOver) {
    return (
      <TermoGameOver
        gameState={{
          guesses: gameState.guesses,
          currentGuess: gameState.currentGuess,
          gameStatus: gameState.gameStatus,
          currentRow: gameState.currentRow
        }}
        targetWord={targetWords[0]}
        isDarkMode={isDarkMode}
        onPlayAgain={handlePlayAgain}
        mode={mode}
        allTargetWords={targetWords}
      />
    );
  }

  if (!canPlay && sessionInfo && (sessionInfo.completed || sessionInfo.failed)) {
    return (
      <MultiModeCompletedMessage 
        mode={mode} 
        sessionInfo={sessionInfo} 
      />
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {isValidating && (
        <div className="text-white text-sm opacity-70">
          Validando palavra...
        </div>
      )}
      
      <MultiModeGameGrid
        targetWords={targetWords}
        gameState={gameState}
        maxGuesses={maxGuesses}
        isDarkMode={isDarkMode}
      />
      
      <TermoKeyboard
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
        isDarkMode={isDarkMode}
        disabled={isValidating}
      />
    </div>
  );
};
