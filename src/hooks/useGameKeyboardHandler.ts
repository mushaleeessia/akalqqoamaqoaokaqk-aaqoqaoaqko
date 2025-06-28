
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
  }, [gameState.currentGuess, gameState.guesses, targetWord, keyStates, saveGameProgress, saveGameSession, setCursorPosition]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;

    console.log('Key pressed:', key, 'Current cursor position:', cursorPosition);
    console.log('Current guess:', gameState.currentGuess);

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      // Se o cursor está no meio da palavra, remover a letra na posição anterior ao cursor
      if (cursorPosition.col > 0) {
        const currentGuessArray = gameState.currentGuess.split('');
        currentGuessArray.splice(cursorPosition.col - 1, 1);
        const newGuess = currentGuessArray.join('');
        
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
        
        // Mover cursor para a esquerda
        setCursorPosition({ 
          row: cursorPosition.row, 
          col: Math.max(0, cursorPosition.col - 1)
        });
      }
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      // Inserir letra na posição do cursor se ainda há espaço
      if (gameState.currentGuess.length < 5) {
        const currentGuessArray = gameState.currentGuess.split('');
        
        // Se o cursor está no final ou além do final, adicionar no final
        if (cursorPosition.col >= currentGuessArray.length) {
          currentGuessArray.push(key.toLowerCase());
        } else {
          // Inserir na posição do cursor
          currentGuessArray.splice(cursorPosition.col, 0, key.toLowerCase());
        }
        
        const newGuess = currentGuessArray.join('');
        
        // Limitar a 5 letras
        if (newGuess.length <= 5) {
          const newGameState = {
            ...gameState,
            currentGuess: newGuess
          };
          
          setGameState(newGameState);
          saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
          
          // Mover cursor para a direita
          setCursorPosition({ 
            row: cursorPosition.row, 
            col: Math.min(5, cursorPosition.col + 1)
          });
        }
      }
    }
  }, [gameState, cursorPosition, submitGuess, saveGameProgress, setCursorPosition]);

  return { handleKeyPress };
};
