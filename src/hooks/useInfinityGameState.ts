import { useState, useCallback, useEffect } from "react";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { useSupabaseGameStats } from "@/hooks/useSupabaseGameStats";
import { useGameKeyboardHandler } from "./useGameKeyboardHandler";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const [gameSessionExists, setGameSessionExists] = useState(false);
  
  const winstreak = !statsLoading && dbWinstreak !== undefined ? dbWinstreak : 0;

  // Criar chave única para a palavra atual
  const getWordKey = () => `infinity_${targetWord.toLowerCase()}`;

  // Verificar se já existe uma sessão para esta palavra
  const checkWordSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', 'infinity')
        .contains('target_words', [targetWord])
        .maybeSingle();

      if (data) {
        setGameSessionExists(true);
        // Carregar progresso da sessão existente
        setGameState({
          guesses: data.guesses,
          currentGuess: '',
          gameStatus: data.won ? 'won' : (data.guesses.length >= maxAttempts ? 'lost' : 'playing'),
          currentRow: data.guesses.length
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
  }, [user, targetWord, maxAttempts]);

  // Estado do jogo - inicializa vazio e carrega do Supabase
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  // Verificar sessão existente quando a palavra muda
  useEffect(() => {
    if (user && targetWord) {
      checkWordSession();
    }
  }, [user, targetWord, checkWordSession]);

  // Salvar progresso no Supabase a cada mudança
  const saveProgress = useCallback(async (newGameState: GameState) => {
    if (!user || newGameState.gameStatus === 'won' || newGameState.gameStatus === 'lost') return;

    try {
      // Buscar sessão existente
      const { data: existingSession } = await supabase
        .from('game_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('game_mode', 'infinity')
        .contains('target_words', [targetWord])
        .maybeSingle();

      if (existingSession) {
        // Atualizar sessão existente
        await supabase
          .from('game_sessions')
          .update({
            guesses: newGameState.guesses,
            attempts: newGameState.guesses.length,
            completed_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        // Criar nova sessão
        await supabase
          .from('game_sessions')
          .insert({
            user_id: user.id,
            game_mode: 'infinity',
            target_words: [targetWord],
            guesses: newGameState.guesses,
            attempts: newGameState.guesses.length,
            won: false,
            completed_at: new Date().toISOString()
          });
      }
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

    // Limpar sessão do Supabase para esta palavra específica
    if (user) {
      try {
        await supabase
          .from('game_sessions')
          .delete()
          .eq('user_id', user.id)
          .eq('game_mode', 'infinity')
          .contains('target_words', [targetWord]);
      } catch (error) {
        // Silent error
      }
    }
  }, [user, targetWord]);

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