import { useState, useCallback, useEffect } from "react";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { useSupabaseGameStats } from "@/hooks/useSupabaseGameStats";
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
export const useInfinityGameState = (targetWord: string, maxAttempts: number = 6) => {
  const { saveGameSession } = useSupabaseGameSession('infinity', [targetWord]);
  const { winstreak: dbWinstreak, loading: statsLoading } = useSupabaseGameStats('infinity');
  
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  
  // Use database winstreak if available, fallback to localStorage
  const [localWinstreak, setLocalWinstreak] = useState(() => {
    const saved = localStorage.getItem('termo-infinity-winstreak');
    return saved ? parseInt(saved, 10) : 0;
  });

  const winstreak = !statsLoading && dbWinstreak !== undefined ? dbWinstreak : localWinstreak;

  // Estado específico para infinity, carrega do localStorage se disponível
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('termo-infinity-game-state');
    const savedWord = localStorage.getItem('termo-infinity-word');
    
    if (savedState && savedWord) {
      try {
        const parsedState = JSON.parse(savedState);
        const parsedWordData = JSON.parse(savedWord);
        
        // Só restaura se for a mesma palavra
        if (parsedWordData.word === targetWord) {
          return parsedState;
        }
      } catch (error) {
        console.error('Erro ao carregar estado do infinity:', error);
      }
    }
    
    return {
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      currentRow: 0
    };
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>(() => {
    const savedKeys = localStorage.getItem('termo-infinity-key-states');
    const savedWord = localStorage.getItem('termo-infinity-word');
    
    if (savedKeys && savedWord) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        const parsedWordData = JSON.parse(savedWord);
        
        // Só restaura se for a mesma palavra
        if (parsedWordData.word === targetWord) {
          return parsedKeys;
        }
      } catch (error) {
        console.error('Erro ao carregar estados das teclas do infinity:', error);
      }
    }
    
    return {};
  });

  // Salvar estado do jogo automaticamente
  useEffect(() => {
    localStorage.setItem('termo-infinity-game-state', JSON.stringify(gameState));
  }, [gameState]);

  // Salvar estados das teclas automaticamente
  useEffect(() => {
    localStorage.setItem('termo-infinity-key-states', JSON.stringify(keyStates));
  }, [keyStates]);

  // Sincronizar localStorage com database quando database winstreak muda
  useEffect(() => {
    if (!statsLoading && dbWinstreak !== undefined) {
      setLocalWinstreak(dbWinstreak);
      localStorage.setItem('termo-infinity-winstreak', dbWinstreak.toString());
    }
  }, [dbWinstreak, statsLoading, localWinstreak]);

  const { handleKeyPress } = useGameKeyboardHandler({
    gameState,
    setGameState,
    keyStates,
    setKeyStates,
    targetWord,
    saveGameProgress: () => {}, // Infinity não precisa salvar progresso
    saveGameSession,
    setIsValidating,
    setShowingFreshGameOver,
    maxAttempts
  });

  const updateWinstreak = useCallback((won: boolean) => {
    // Always update local winstreak for immediate UI feedback
    if (won) {
      setLocalWinstreak(prev => prev + 1);
    } else {
      setLocalWinstreak(0);
    }
    
    // Database winstreak is updated automatically via useSupabaseGameSession
    // and will override local value via real-time updates
  }, [winstreak]);

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
    winstreak,
    updateWinstreak,
    evaluateGuess: (guess: string) => evaluateGuess(guess, targetWord),
    updateKeyStatesForGuess
  };
};