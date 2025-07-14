import { useState, useCallback, useEffect, useRef } from "react";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { useSupabaseGameStats } from "@/hooks/useSupabaseGameStats";
import { useGameKeyboardHandler } from "./useGameKeyboardHandler";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

// Hook específico para modo Infinity com persistência por palavra
export const useInfinityGameState = (targetWord: string, maxAttempts: number = 6) => {
  const { user } = useAuth();
  const { saveGameSession } = useSupabaseGameSession('infinity', [targetWord]);
  const { winstreak: dbWinstreak, loading: statsLoading } = useSupabaseGameStats('infinity');
  const { logGameStarted, logGameEnded } = useActivityLogger();
  
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const [gameSessionExists, setGameSessionExists] = useState(false);
  const gameStartedRef = useRef(false);
  
  const winstreak = !statsLoading && dbWinstreak !== undefined ? dbWinstreak : 0;


  // Verificar se já existe progresso para esta palavra
  const checkWordProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('infinity_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_word', targetWord)
        .maybeSingle();

      if (data) {
        setGameSessionExists(true);
        // Carregar progresso da sessão existente
        setGameState({
          guesses: data.guesses,
          currentGuess: data.current_guess,
          gameStatus: data.game_status as 'playing' | 'won' | 'lost',
          currentRow: data.current_row
        });

        // Reconstruir keyStates baseado nas tentativas
        const newKeyStates: Record<string, LetterState> = {};
        data.guesses.forEach((guess: string) => {
          const evaluation = evaluateGuess(guess, targetWord);
          updateKeyStatesForGuess(guess, evaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
      } else {
        setGameSessionExists(false);
      }
    } catch (error) {
      setGameSessionExists(false);
    }
  }, [user, targetWord]);

  // Estado do jogo - inicializa vazio e carrega do Supabase
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  // Verificar progresso existente quando a palavra muda
  useEffect(() => {
    if (user && targetWord) {
      checkWordProgress();
    }
  }, [user, targetWord, checkWordProgress]);

  // Salvar progresso na nova tabela infinity_progress
  const saveProgress = useCallback(async (newGameState: GameState) => {
    if (!user) return;

    try {
      const progressData = {
        user_id: user.id,
        target_word: targetWord,
        guesses: newGameState.guesses,
        current_guess: newGameState.currentGuess,
        game_status: newGameState.gameStatus,
        current_row: newGameState.currentRow
      };

      await supabase
        .from('infinity_progress')
        .upsert(progressData, {
          onConflict: 'user_id,target_word'
        });
    } catch (error) {
      // Silent error
    }
  }, [user, targetWord]);

  const { handleKeyPress } = useGameKeyboardHandler({
    gameState,
    setGameState: (newState: GameState) => {
      setGameState(newState);
      saveProgress(newState);
    },
    keyStates,
    setKeyStates,
    targetWord,
    saveGameProgress: () => {}, // Não usado no infinity
    saveGameSession,
    setIsValidating,
    setShowingFreshGameOver,
    maxAttempts
  });

  const updateWinstreak = useCallback((won: boolean) => {
    // Database winstreak is updated automatically via useSupabaseGameSession
    // when saveGameSession is called
  }, []);

  const resetGame = useCallback(async () => {
    setGameState({
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      currentRow: 0
    });
    setKeyStates({});
    setShowingFreshGameOver(false);
    setGameSessionExists(false);

    // Limpar progresso da palavra específica
    if (user) {
      try {
        await supabase
          .from('infinity_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('target_word', targetWord);
      } catch (error) {
        // Silent error
      }
    }
  }, [user, targetWord]);

  // Log game start when first guess is made
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.guesses.length > 0 && !gameStartedRef.current) {
      logGameStarted('infinity');
      gameStartedRef.current = true;
    }
  }, [gameState.guesses.length, gameState.gameStatus, logGameStarted]);

  // Log game end when game finishes
  useEffect(() => {
    if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && gameStartedRef.current) {
      logGameEnded('infinity');
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
    handleKeyPress,
    resetGame,
    winstreak,
    updateWinstreak,
    evaluateGuess: (guess: string) => evaluateGuess(guess, targetWord),
    updateKeyStatesForGuess
  };
};