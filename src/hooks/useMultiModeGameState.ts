import { useState, useEffect, useCallback, useRef } from "react";
import { GameMode } from "@/components/GameModeSelector";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { useMultiModePlayerSession } from "@/hooks/useMultiModePlayerSession";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { toast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface MultiModeGameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export const useMultiModeGameState = (targetWords: string[], mode: GameMode) => {
  const { canPlay, sessionInfo, saveGameProgress, markGameStartLogged } = useMultiModePlayerSession(mode);
  const { sessionExists, saveGameSession } = useSupabaseGameSession(mode, targetWords);
  const { logGameStarted, logGameEnded } = useActivityLogger();
  
  const [gameState, setGameState] = useState<MultiModeGameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const gameStartedRef = useRef(false);
  
  const maxGuesses = mode === 'solo' ? 6 : mode === 'duo' ? 8 : mode === 'trio' ? 9 : 10;

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

  const updateKeyStatesForGuess = (guess: string, evaluation: LetterState[]) => {
    setKeyStates(prevKeyStates => {
      const newKeyStates = { ...prevKeyStates };
      
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i].toLowerCase();
        const state = evaluation[i];
        
        if (!newKeyStates[letter] || 
            (newKeyStates[letter] === 'absent' && state !== 'absent') ||
            (newKeyStates[letter] === 'present' && state === 'correct')) {
          newKeyStates[letter] = state;
        }
      }
      
      return newKeyStates;
    });
  };

  const checkWinCondition = (guesses: string[]): boolean => {
    return targetWords.every(targetWord => 
      guesses.some(guess => guess.toLowerCase() === targetWord.toLowerCase())
    );
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
      updateKeyStatesForGuess(gameState.currentGuess, bestEvaluation);
      
      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      
      const isWin = checkWinCondition(newGuesses);
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
        await saveGameSession(newGuesses, isWin);
      }

      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameStatus);
      
    } catch (error) {
      toast({
        title: "Erro de validação",
        description: "Não foi possível validar a palavra. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  }, [gameState.currentGuess, gameState.guesses, targetWords, saveGameProgress, maxGuesses, saveGameSession]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing' || isValidating) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      if (gameState.currentGuess.length > 0) {
        const newGuess = gameState.currentGuess.slice(0, -1);
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      }
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      if (gameState.currentGuess.length < 5) {
        const newGuess = gameState.currentGuess + key.toLowerCase();
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      }
    }
  }, [gameState, isValidating, submitGuess, saveGameProgress]);

  useEffect(() => {
    if (sessionInfo && sessionInfo.mode === mode && !isSessionLoaded) {
      const loadedGameState = {
        guesses: sessionInfo.guesses || [],
        currentGuess: sessionInfo.currentGuess || '',
        gameStatus: sessionInfo.gameStatus || 'playing',
        currentRow: (sessionInfo.guesses || []).length
      };

      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const shouldHaveWon = checkWinCondition(sessionInfo.guesses);
        if (shouldHaveWon && loadedGameState.gameStatus === 'playing') {
          loadedGameState.gameStatus = 'won';
        }
      }
      
      setGameState(loadedGameState);

      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const newKeyStates: Record<string, LetterState> = {};
        
        sessionInfo.guesses.forEach(guess => {
          const evaluations = evaluateGuessForAllWords(guess);
          const bestEvaluation = getBestEvaluationForKeyboard(evaluations);
          
          for (let i = 0; i < guess.length; i++) {
            const letter = guess[i].toLowerCase();
            const state = bestEvaluation[i];
            
            if (!newKeyStates[letter] || 
                (newKeyStates[letter] === 'absent' && state !== 'absent') ||
                (newKeyStates[letter] === 'present' && state === 'correct')) {
              newKeyStates[letter] = state;
            }
          }
        });
        
        setKeyStates(newKeyStates);
      } else {
        setKeyStates({});
      }
      
      setIsSessionLoaded(true);
    }
  }, [sessionInfo, mode, targetWords, isSessionLoaded]);

  useEffect(() => {
    setIsSessionLoaded(false);
    setShowingFreshGameOver(false);
    gameStartedRef.current = false;
  }, [mode]);

  // Log game start when first guess is made
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && 
        gameState.guesses.length > 0 && 
        !gameStartedRef.current && 
        !sessionInfo?.gameStartLogged) {
      logGameStarted(mode);
      markGameStartLogged();
      gameStartedRef.current = true;
    }
  }, [gameState.guesses.length, gameState.gameStatus, logGameStarted, mode, sessionInfo?.gameStartLogged, markGameStartLogged]);

  // Log game end when game finishes
  useEffect(() => {
    if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && gameStartedRef.current) {
      logGameEnded(mode);
      gameStartedRef.current = false;
    }
  }, [gameState.gameStatus, logGameEnded, mode]);

  return {
    gameState,
    setGameState,
    keyStates,
    isValidating,
    showingFreshGameOver,
    setShowingFreshGameOver,
    maxGuesses,
    handleKeyPress,
    canPlay: canPlay && !sessionExists,
    sessionInfo,
    saveGameProgress
  };
};
