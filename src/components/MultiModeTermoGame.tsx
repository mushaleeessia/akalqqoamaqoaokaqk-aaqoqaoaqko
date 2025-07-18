
import { useEffect } from "react";
import { GameMode } from "./GameModeSelector";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { MultiModeCompletedMessage } from "./MultiModeCompletedMessage";
import { MultiModeGameGrid } from "./MultiModeGameGrid";
import { useMultiModeGameState } from "@/hooks/useMultiModeGameState";
import { useDiscordNotification } from "@/hooks/useDiscordNotification";
import { generateShareText } from "@/utils/shareUtils";

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

  // Gerar texto de compartilhamento quando o jogo termina
  const shareText = (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') 
    ? generateShareText(
        gameState, 
        mode, 
        gameState.gameStatus === 'won',
        gameState.currentRow,
        targetWords
      )
    : '';

  // Hook para enviar resultado automaticamente para Discord
  useDiscordNotification(gameState, shareText, mode);

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
