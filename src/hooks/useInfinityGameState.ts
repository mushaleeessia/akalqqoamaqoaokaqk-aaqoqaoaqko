import { useState, useCallback } from "react";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { useGameStateManager } from "./useGameStateManager";
import { useGameKeyboardHandler } from "./useGameKeyboardHandler";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

// Hook específico para modo Infinity que NÃO interfere com Solo
export const useInfinityGameState = (targetWord: string) => {
  const { saveGameSession } = useSupabaseGameSession('infinity', [targetWord]);
  
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);

  // Estado específico para infinity, não usa sessionInfo do Solo
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  const { handleKeyPress } = useGameKeyboardHandler({
    gameState,
    setGameState,
    keyStates,
    setKeyStates,
    targetWord,
    saveGameProgress: () => {}, // Infinity não precisa salvar progresso
    saveGameSession,
    setIsValidating,
    setShowingFreshGameOver
  });

  const resetGame = useCallback(() => {
    setGameState({
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      currentRow: 0
    });
    setKeyStates({});
    setShowingFreshGameOver(false);
  }, []);

  return {
    gameState,
    setGameState,
    keyStates,
    setKeyStates,
    isValidating,
    showingFreshGameOver,
    setShowingFreshGameOver,
    handleKeyPress,
    resetGame,
    evaluateGuess: (guess: string) => evaluateGuess(guess, targetWord),
    updateKeyStatesForGuess
  };
};