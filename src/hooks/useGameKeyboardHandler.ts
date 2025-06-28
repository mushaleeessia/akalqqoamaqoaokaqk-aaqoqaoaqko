
import { useCallback } from "react";
import { GameState, LetterState } from "./useTermoGameState";
import { CursorPosition } from "./useTermoCursor";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";
import { toast } from "@/hooks/use-toast";

interface UseGameKeyboardHandlerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  keyStates: Record<string, LetterState>;
  setKeyStates: (states: Record<string, LetterState>) => void;
  cursorPosition: CursorPosition;
  setCursorPosition: (position: CursorPosition) => void;
  targetWord: string;
  saveGameProgress: (guesses: string[], currentGuess: string, gameStatus: 'playing' | 'won' | 'lost') => void;
  saveGameSession: (guesses: string[], won: boolean) => Promise<void>;
  setIsValidating: (validating: boolean) => void;
  setShowingFreshGameOver: (showing: boolean) => void;
}

export const useGameKeyboardHandler = ({
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
}: UseGameKeyboardHandlerProps) => {

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

      const evaluation = evaluateGuess(gameState.currentGuess, targetWord);
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
    if (gameState.gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      // Create array representation of current guess
      const currentGuessArray = new Array(5).fill('');
      for (let i = 0; i < gameState.currentGuess.length; i++) {
        currentGuessArray[i] = gameState.currentGuess[i];
      }
      
      // Delete from cursor position
      if (currentGuessArray[cursorPosition.col]) {
        currentGuessArray[cursorPosition.col] = '';
        const newGuess = currentGuessArray.filter(char => char !== '').join('');
        
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      }
    } else if (key.length === 1) {
      // Create array representation of current guess
      const currentGuessArray = new Array(5).fill('');
      for (let i = 0; i < gameState.currentGuess.length; i++) {
        currentGuessArray[i] = gameState.currentGuess[i];
      }
      
      // Insert at cursor position if empty and we haven't reached max length
      if (!currentGuessArray[cursorPosition.col] && gameState.currentGuess.length < 5) {
        currentGuessArray[cursorPosition.col] = key.toLowerCase();
        
        // Create new string without gaps
        const newGuess = currentGuessArray.filter(char => char !== '').join('');
        
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        setGameState(newGameState);
        
        // Move cursor to next empty position
        let nextPos = cursorPosition.col + 1;
        while (nextPos < 5 && currentGuessArray[nextPos]) {
          nextPos++;
        }
        setCursorPosition({ row: cursorPosition.row, col: Math.min(4, nextPos) });
        
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      }
    }
  }, [gameState, submitGuess, saveGameProgress, cursorPosition]);

  return { handleKeyPress };
};
