import { useState, useCallback } from "react";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";
import { toast } from "@/hooks/use-toast";
import { CursorPosition } from "./useTermoCursor";

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
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ row: 0, col: 0 });

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
      setCursorPosition({ row: newGuesses.length, col: 0 });

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

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing' || isValidating) return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      // Deletar caractere na posição do cursor ou à esquerda dele
      if (gameState.currentGuess.length > 0) {
        const currentGuessArray = gameState.currentGuess.split('');
        
        // Se o cursor está numa posição válida e há caractere para deletar
        if (cursorPosition.col > 0 && cursorPosition.col <= currentGuessArray.length) {
          // Deletar o caractere à esquerda do cursor
          currentGuessArray.splice(cursorPosition.col - 1, 1);
          setCursorPosition(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
        } else if (cursorPosition.col === 0 && currentGuessArray.length > 0) {
          // Se cursor está no início mas há caracteres, deletar o primeiro
          currentGuessArray.splice(0, 1);
        } else if (currentGuessArray.length > 0) {
          // Fallback: deletar o último caractere
          currentGuessArray.splice(currentGuessArray.length - 1, 1);
          setCursorPosition(prev => ({ ...prev, col: Math.max(0, currentGuessArray.length) }));
        }
        
        const newGuess = currentGuessArray.join('');
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      }
    } else if (key.length === 1 && gameState.currentGuess.length < 5) {
      // Inserir caractere na posição do cursor
      const currentGuessArray = gameState.currentGuess.split('');
      const insertPosition = Math.min(cursorPosition.col, currentGuessArray.length);
      
      currentGuessArray.splice(insertPosition, 0, key.toLowerCase());
      const newGuess = currentGuessArray.join('');
      
      const newGameState = {
        ...gameState,
        currentGuess: newGuess
      };
      setGameState(newGameState);
      
      // Mover cursor para próxima posição livre após inserir
      setCursorPosition(prev => ({ ...prev, col: Math.min(5, insertPosition + 1) }));
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    }
  }, [gameState, isValidating, submitGuess, saveGameProgress, cursorPosition]);

  const handleCursorMove = useCallback((position: CursorPosition) => {
    setCursorPosition(position);
  }, []);

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
    handleCursorMove
  };
};
