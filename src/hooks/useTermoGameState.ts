
import { useState, useCallback } from "react";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { CursorPosition } from "./useTermoCursor";
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

export const useTermoGameState = (targetWord: string) => {
  const { canPlay, sessionInfo, saveGameProgress } = usePlayerSession();
  const { sessionExists, saveGameSession } = useSupabaseGameSession('solo', [targetWord]);
  
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ row: 0, col: 0 });

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
    cursorPosition,
    setCursorPosition,
    targetWord,
    saveGameProgress,
    saveGameSession,
    setIsValidating,
    setShowingFreshGameOver
  });

  const handleCursorMove = useCallback((position: CursorPosition) => {
    setCursorPosition(position);
  }, []);

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
    updateKeyStatesForGuess,
    handleCursorMove
  };
};
