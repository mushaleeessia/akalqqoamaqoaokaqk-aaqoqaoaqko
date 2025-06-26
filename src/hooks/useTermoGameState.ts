import { useState, useCallback } from "react";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { toast } from "@/hooks/use-toast";

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
  
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showingFreshGameOver, setShowingFreshGameOver] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const evaluateGuess = (guess: string): LetterState[] => {
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

      const evaluation = evaluateGuess(gameState.currentGuess);
      updateKeyStates(gameState.currentGuess, evaluation);
      
      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const isWin = gameState.currentGuess.toLowerCase() === targetWord.toLowerCase();
      const isGameOver = isWin || newGuesses.length >= 6;
      
      const newGameStatus = isWin ? 'won' : (isGameOver ? 'lost' : 'playing');
      
      const newGameState = {
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus as 'playing' | 'won' | 'lost',
        currentRow: newGuesses.length
      };
      
      setGameState(newGameState);
      setCursorPosition(0);

      if (isGameOver) {
        setShowingFreshGameOver(true);
        await saveGameSession(newGuesses, isWin);
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
  }, [gameState.currentGuess, gameState.guesses, targetWord, keyStates, saveGameProgress, saveGameSession]);

  const insertCharacterAtCursor = (char: string, position: number, currentWord: string): string => {
    if (currentWord.length >= 5) return currentWord;
    
    const before = currentWord.slice(0, position);
    const after = currentWord.slice(position);
    return before + char + after;
  };

  const removeCharacterAtCursor = (position: number, currentWord: string): { newWord: string, newPosition: number } => {
    if (position === 0) return { newWord: currentWord, newPosition: 0 };
    
    const before = currentWord.slice(0, position - 1);
    const after = currentWord.slice(position);
    return { newWord: before + after, newPosition: position - 1 };
  };

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing' || isValidating) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      const { newWord, newPosition } = removeCharacterAtCursor(cursorPosition, gameState.currentGuess);
      const newGameState = {
        ...gameState,
        currentGuess: newWord
      };
      setGameState(newGameState);
      setCursorPosition(newPosition);
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    } else if (key.length === 1 && gameState.currentGuess.length < 5) {
      const newWord = insertCharacterAtCursor(key.toLowerCase(), cursorPosition, gameState.currentGuess);
      const newGameState = {
        ...gameState,
        currentGuess: newWord
      };
      setGameState(newGameState);
      setCursorPosition(Math.min(cursorPosition + 1, 5));
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    }
  }, [gameState, isValidating, submitGuess, saveGameProgress, cursorPosition]);

  useState(() => {
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
        const newKeyStates: Record<string, any> = {};
        sessionInfo.guesses.forEach(guess => {
          const evaluation = evaluateGuess(guess);
          updateKeyStatesForGuess(guess, evaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
      }
    }
  });

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
    evaluateGuess,
    updateKeyStatesForGuess,
    cursorPosition,
    setCursorPosition
  };
};
