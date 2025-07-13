
import { useEffect } from "react";
import { TermoGrid } from "./TermoGrid";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { useTermoGameState } from "@/hooks/useTermoGameState";
import { useTermoKeyboardHandler } from "@/hooks/useTermoKeyboardHandler";
import { useDiscordNotification } from "@/hooks/useDiscordNotification";
import { generateShareText } from "@/utils/shareUtils";
import { GameState } from "./TermoGame";

interface TermoGameLogicProps {
  targetWord: string;
  isDarkMode: boolean;
  onGameComplete?: (gameState: GameState) => void;
  isInfinityMode?: boolean;
  gameState?: GameState;
  keyStates?: Record<string, any>;
  handleKeyPress?: (key: string) => void;
  isValidating?: boolean;
  maxAttempts?: number;
  isHardMode?: boolean;
}

export const TermoGameLogic = ({ 
  targetWord, 
  isDarkMode, 
  onGameComplete, 
  isInfinityMode = false,
  gameState: externalGameState,
  keyStates: externalKeyStates,
  handleKeyPress: externalHandleKeyPress,
  isValidating: externalIsValidating,
  maxAttempts = 6,
  isHardMode = false
}: TermoGameLogicProps) => {
  // Use external state for Infinity mode, internal for Solo
  const soloGameState = useTermoGameState(targetWord);
  
  const gameState = externalGameState || soloGameState.gameState;
  const keyStates = externalKeyStates || soloGameState.keyStates;
  const handleKeyPress = externalHandleKeyPress || soloGameState.handleKeyPress;
  const isValidating = externalIsValidating !== undefined ? externalIsValidating : soloGameState.isValidating;
  const showingFreshGameOver = soloGameState.showingFreshGameOver;
  const canPlay = soloGameState.canPlay;
  const sessionInfo = soloGameState.sessionInfo;

  useTermoKeyboardHandler(handleKeyPress);

  // Gerar texto de compartilhamento quando o jogo termina (apenas para Solo)
  const shareText = !isInfinityMode && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') 
    ? generateShareText(
        gameState, 
        'solo',
        gameState.gameStatus === 'won',
        gameState.currentRow,
        [targetWord]
      )
    : '';

  // Hook para enviar resultado automaticamente para Discord (apenas para Solo)
  useDiscordNotification(isInfinityMode ? { gameStatus: 'playing', guesses: [] } : gameState, shareText, 'solo');

  const maxGuesses = maxAttempts;

  // Carregar progresso salvo ao inicializar (apenas para Solo)
  useEffect(() => {
    if (isInfinityMode || !sessionInfo) return;
    
    const newGameState = {
      guesses: sessionInfo.guesses || [],
      currentGuess: sessionInfo.currentGuess || '',
      gameStatus: sessionInfo.gameStatus || 'playing',
      currentRow: sessionInfo.guesses?.length || 0
    };
    
    soloGameState.setGameState(prevState => {
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
        const evaluation = soloGameState.evaluateGuess(guess);
        soloGameState.updateKeyStatesForGuess(guess, evaluation, newKeyStates);
      });
      soloGameState.setKeyStates(newKeyStates);
    }
  }, [sessionInfo, targetWord, showingFreshGameOver, isInfinityMode]);

  // PRIORIDADE 1: Se o jogo terminou na sessão atual, mostrar game over
  if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && showingFreshGameOver && !isInfinityMode) {
    return (
      <TermoGameOver
        gameState={gameState}
        targetWord={targetWord}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Para modo Infinity, chamar callback quando jogo termina
  if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && isInfinityMode && onGameComplete) {
    onGameComplete(gameState);
    return null;
  }

  if (!canPlay && sessionInfo && (sessionInfo.completed || sessionInfo.failed) && !isInfinityMode) {
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

  return (
    <div className="flex flex-col items-center space-y-6">
      {isHardMode && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 text-center">
          <div className="text-red-200 font-bold text-sm flex items-center justify-center gap-2">
            🔥 MODO DIFÍCIL ATIVO 🔥
          </div>
          <div className="text-red-300 text-xs mt-1">
            Apenas {maxAttempts} tentativas disponíveis!
          </div>
        </div>
      )}
      
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
