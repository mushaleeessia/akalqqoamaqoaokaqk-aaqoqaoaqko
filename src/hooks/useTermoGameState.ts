
import { useState, useCallback, useEffect, useRef } from "react";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { useGameStateManager } from "./useGameStateManager";
import { useGameKeyboardHandler } from "./useGameKeyboardHandler";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export const useTermoGameState = (targetWord: string) => {
  const { canPlay, sessionInfo, saveGameProgress, markGameStartLogged } = usePlayerSession();
  const { sessionExists, saveGameSession } = useSupabaseGameSession('solo', [targetWord]);
  const { logGameStarted, logGameEnded } = useActivityLogger();
  
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const gameStartedRef = useRef(false);

  const {
    gameState,
    setGameState,
    keyStates,
    setKeyStates
  } = useGameStateManager({
    sessionInfo,
    showingFreshGameOver,
    targetWord
  });

  const { handleKeyPress } = useGameKeyboardHandler({
    gameState,
    setGameState,
    keyStates,
    setKeyStates,
    targetWord,
    saveGameProgress,
    saveGameSession,
    setIsValidating,
    setShowingFreshGameOver
  });

  // Log game start when first guess is made
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && 
        gameState.guesses.length > 0 && 
        !gameStartedRef.current && 
        !sessionInfo?.gameStartLogged) {
      logGameStarted('solo');
      markGameStartLogged();
      gameStartedRef.current = true;
    }
  }, [gameState.guesses.length, gameState.gameStatus, logGameStarted, sessionInfo?.gameStartLogged, markGameStartLogged]);

  // Log game end when game finishes
  useEffect(() => {
    if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && gameStartedRef.current) {
      logGameEnded('solo');
      gameStartedRef.current = false;
    }
  }, [gameState.gameStatus, logGameEnded]);

  return {
    gameState,
    setGameState,
    keyStates,
    setKeyStates,
    isValidating,
    showingFreshGameOver,
    setShowingFreshGameOver,
    canPlay: canPlay && !sessionExists,
    sessionInfo,
    handleKeyPress,
    evaluateGuess: (guess: string) => evaluateGuess(guess, targetWord),
    updateKeyStatesForGuess
  };
};
