
import { useState, useEffect } from "react";
import { GameState, LetterState } from "./useTermoGameState";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";

interface UseGameStateManagerProps {
  sessionInfo: any;
  showingFreshGameOver: boolean;
  targetWord: string;
}

export const useGameStateManager = ({ 
  sessionInfo, 
  showingFreshGameOver, 
  targetWord 
}: UseGameStateManagerProps) => {
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  useEffect(() => {
    if (sessionInfo) {
      const loadedGameState = {
        guesses: sessionInfo.guesses || [],
        currentGuess: sessionInfo.currentGuess || '',
        gameStatus: sessionInfo.gameStatus || 'playing',
        currentRow: sessionInfo.guesses?.length || 0
      };
      
      if (!showingFreshGameOver && 
          !(gameState.gameStatus === 'won' || gameState.gameStatus === 'lost')) {
        setGameState(loadedGameState);
      }

      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const newKeyStates: Record<string, LetterState> = {};
        sessionInfo.guesses.forEach((guess: string) => {
          const evaluation = evaluateGuess(guess, targetWord);
          updateKeyStatesForGuess(guess, evaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
      }
    }
  }, [sessionInfo, targetWord, showingFreshGameOver]);

  return {
    gameState,
    setGameState,
    keyStates,
    setKeyStates
  };
};
