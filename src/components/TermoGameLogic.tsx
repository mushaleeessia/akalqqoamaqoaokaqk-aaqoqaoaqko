
import { useEffect } from "react";
import { TermoGrid } from "./TermoGrid";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { useTermoGameState } from "@/hooks/useTermoGameState";
import { useTermoKeyboardHandler } from "@/hooks/useTermoKeyboardHandler";
import { useDiscordNotification } from "@/hooks/useDiscordNotification";
import { generateShareText } from "@/utils/shareUtils";

interface TermoGameLogicProps {
  targetWord: string;
  isDarkMode: boolean;
}

export const TermoGameLogic = ({ targetWord, isDarkMode }: TermoGameLogicProps) => {
  const {
    gameState,
    setGameState,
    keyStates,
    setKeyStates,
    isValidating,
    showingFreshGameOver,
    setShowingFreshGameOver,
    canPlay,
    sessionInfo,
    handleKeyPress,
    evaluateGuess,
    updateKeyStatesForGuess
  } = useTermoGameState(targetWord);

  useTermoKeyboardHandler(handleKeyPress);

  // Gerar texto de compartilhamento quando o jogo termina
  const shareText = (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') 
    ? generateShareText(gameState, targetWord, 'solo')
    : '';

  // Hook para enviar resultado automaticamente para Discord
  useDiscordNotification(gameState, shareText);

  const maxGuesses = 6;

  // Carregar progresso salvo ao inicializar
  useEffect(() => {
    if (sessionInfo) {
      const newGameState = {
        guesses: sessionInfo.guesses || [],
        currentGuess: sessionInfo.currentGuess || '',
        gameStatus: sessionInfo.gameStatus || 'playing',
        currentRow: sessionInfo.guesses?.length || 0
      };
      
      setGameState(prevState => {
        if (showingFreshGameOver) {
          return prevState;
        }
        if (prevState.gameStatus === 'won' || prevState.gameStatus === 'lost') {
          return prevState;
        }
        return newGameState;
      });

      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const newKeyStates: Record<string, any> = {};
        sessionInfo.guesses.forEach(guess => {
          const evaluation = evaluateGuess(guess);
          updateKeyStatesForGuess(guess, evaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
      }
    }
  }, [sessionInfo, targetWord, showingFreshGameOver]);

  // PRIORIDADE 1: Se o jogo terminou na sessão atual, mostrar game over
  if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && showingFreshGameOver) {
    return (
      <TermoGameOver
        gameState={gameState}
        targetWord={targetWord}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (!canPlay && sessionInfo && (sessionInfo.completed || sessionInfo.failed)) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {sessionInfo.completed ? '✅ Você já jogou hoje!' : '❌ Tentativas esgotadas!'}
          </h2>
          <p className="text-white/80 mb-2">
            {sessionInfo.completed 
              ? `Parabéns! Você completou o Termo de hoje.`
              : `Você esgotou suas tentativas para hoje.`
            }
          </p>
          <p className="text-white/60 text-sm">
            Uma nova palavra estará disponível amanhã!
          </p>
          <div className="mt-4 text-white/50 text-xs">
            Tentativas realizadas: {sessionInfo.attempts}
          </div>
        </div>
      </div>
    );
  }

  const handleCursorMove = (position: any) => {
    // Cursor position is handled internally by the grid
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      {isValidating && (
        <div className="text-white text-sm opacity-70">
          Validando palavra...
        </div>
      )}
      
      <TermoGrid
        guesses={gameState.guesses}
        currentGuess={gameState.currentGuess}
        targetWord={targetWord}
        currentRow={gameState.currentRow}
        maxGuesses={maxGuesses}
        isDarkMode={isDarkMode}
        onCursorMove={handleCursorMove}
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
