import { useState, useEffect, useCallback } from "react";
import { GameMode } from "@/components/GameModeSelector";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { useMultiModePlayerSession } from "@/hooks/useMultiModePlayerSession";
import { toast } from "@/hooks/use-toast";

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface MultiModeGameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export const useMultiModeGameState = (targetWords: string[], mode: GameMode) => {
  const { canPlay, sessionInfo, saveGameProgress } = useMultiModePlayerSession(mode);
  const [gameState, setGameState] = useState<MultiModeGameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const [sessionLoadedForMode, setSessionLoadedForMode] = useState<string | null>(null);
  const maxGuesses = 6;

  const evaluateGuessForWord = (guess: string, targetWord: string): LetterState[] => {
    const result: LetterState[] = [];
    const targetArray = targetWord.toLowerCase().split('');
    const guessArray = guess.toLowerCase().split('');
    
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = '#';
      } else {
        result[i] = 'absent';
      }
    }
    
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'absent') {
        const letterIndex = targetArray.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
          result[i] = 'present';
          targetArray[letterIndex] = '#';
        }
      }
    }
    
    return result;
  };

  const evaluateGuessForAllWords = (guess: string): LetterState[][] => {
    return targetWords.map(word => evaluateGuessForWord(guess, word));
  };

  const getBestEvaluationForKeyboard = (evaluations: LetterState[][]): LetterState[] => {
    const result: LetterState[] = [];
    
    for (let i = 0; i < 5; i++) {
      let bestState: LetterState = 'absent';
      
      for (const evaluation of evaluations) {
        if (evaluation[i] === 'correct') {
          bestState = 'correct';
          break;
        } else if (evaluation[i] === 'present' && bestState === 'absent') {
          bestState = 'present';
        }
      }
      
      result[i] = bestState;
    }
    
    return result;
  };

  const updateKeyStatesForGuess = (guess: string, evaluation: LetterState[], keyStatesObj: Record<string, LetterState>) => {
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i].toLowerCase();
      const state = evaluation[i];
      
      if (!keyStatesObj[letter] || 
          (keyStatesObj[letter] === 'absent' && state !== 'absent') ||
          (keyStatesObj[letter] === 'present' && state === 'correct')) {
        keyStatesObj[letter] = state;
      }
    }
  };

  const updateKeyStates = (guess: string, evaluation: LetterState[]) => {
    const newKeyStates = { ...keyStates };
    updateKeyStatesForGuess(guess, evaluation, newKeyStates);
    setKeyStates(newKeyStates);
  };

  const checkWinCondition = (guess: string): boolean => {
    return targetWords.every(word => guess.toLowerCase() === word.toLowerCase());
  };

  const submitGuess = useCallback(async () => {
    if (gameState.currentGuess.length !== 5) {
      toast({
        title: "Palavra incompleta",
        description: "Digite uma palavra de 5 letras",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const validationResult = await validatePortugueseWord(gameState.currentGuess);
      
      if (!validationResult.isValid) {
        toast({
          title: "Palavra inválida",
          description: "Palavra inválida",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      const evaluations = evaluateGuessForAllWords(gameState.currentGuess);
      const bestEvaluation = getBestEvaluationForKeyboard(evaluations);
      updateKeyStates(gameState.currentGuess, bestEvaluation);
      
      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const isWin = checkWinCondition(gameState.currentGuess);
      const isGameOver = isWin || newGuesses.length >= maxGuesses;
      
      const newGameStatus = isWin ? 'won' : (isGameOver ? 'lost' : 'playing');
      
      const newGameState = {
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus as 'playing' | 'won' | 'lost',
        currentRow: newGuesses.length
      };
      
      setGameState(newGameState);

      if (isGameOver) {
        setShowingFreshGameOver(true);
      }

      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      
    } catch (error) {
      toast({
        title: "Erro de validação",
        description: "Não foi possível validar a palavra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  }, [gameState.currentGuess, gameState.guesses, targetWords, keyStates, saveGameProgress]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing' || isValidating) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      const newGameState = {
        ...gameState,
        currentGuess: gameState.currentGuess.slice(0, -1)
      };
      setGameState(newGameState);
      
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    } else if (key.length === 1 && gameState.currentGuess.length < 5) {
      const newGameState = {
        ...gameState,
        currentGuess: gameState.currentGuess + key.toLowerCase()
      };
      setGameState(newGameState);
      
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    }
  }, [gameState, isValidating, submitGuess, saveGameProgress]);

  // Carregar sessão inicial quando sessionInfo estiver disponível
  useEffect(() => {
    const modeKey = `${mode}-loaded`;
    
    if (sessionInfo && sessionInfo.mode === mode && sessionLoadedForMode !== modeKey) {
      console.log(`Carregando sessão inicial para modo ${mode}:`, sessionInfo);
      
      const loadedGameState = {
        guesses: sessionInfo.guesses || [],
        currentGuess: sessionInfo.currentGuess || '',
        gameStatus: sessionInfo.gameStatus || 'playing',
        currentRow: (sessionInfo.guesses || []).length
      };
      
      console.log(`Estado carregado:`, loadedGameState);
      setGameState(loadedGameState);

      // Reconstruir keyStates baseado nas tentativas salvas
      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const newKeyStates: Record<string, LetterState> = {};
        sessionInfo.guesses.forEach(guess => {
          const evaluation = evaluateGuessForAllWords(guess);
          const bestEvaluation = getBestEvaluationForKeyboard(evaluation);
          updateKeyStatesForGuess(guess, bestEvaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
        console.log(`KeyStates reconstruídos:`, newKeyStates);
      } else {
        setKeyStates({});
      }
      
      setSessionLoadedForMode(modeKey);
    }
  }, [sessionInfo, targetWords, mode, sessionLoadedForMode]);

  // Reset apenas showingFreshGameOver quando o modo muda
  useEffect(() => {
    console.log(`Modo mudou para: ${mode}, resetando apenas showingFreshGameOver`);
    setShowingFreshGameOver(false);
  }, [mode]);

  return {
    gameState,
    setGameState,
    keyStates,
    isValidating,
    showingFreshGameOver,
    setShowingFreshGameOver,
    maxGuesses,
    handleKeyPress,
    canPlay,
    sessionInfo,
    saveGameProgress
  };
};
