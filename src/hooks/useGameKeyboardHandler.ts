
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
      // Deletar letra na posição à esquerda do cursor
      if (cursorPosition.col > 0) {
        // Criar array de 5 posições representando o estado atual
        const lettersArray = new Array(5).fill('');
        for (let i = 0; i < gameState.currentGuess.length && i < 5; i++) {
          lettersArray[i] = gameState.currentGuess[i];
        }
        
        // Deletar letra na posição à esquerda do cursor
        const deletePosition = cursorPosition.col - 1;
        if (lettersArray[deletePosition]) {
          lettersArray[deletePosition] = '';
          
          // Reconstruir string removendo espaços vazios
          const newGuess = lettersArray.filter(letter => letter !== '').join('');
          
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
      }
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      // Inserir letra na posição do cursor
      if (gameState.currentGuess.length < 5) {
        // Criar array de 5 posições representando o estado atual
        const lettersArray = new Array(5).fill('');
        for (let i = 0; i < gameState.currentGuess.length && i < 5; i++) {
          lettersArray[i] = gameState.currentGuess[i];
        }
        
        // Inserir letra na posição do cursor
        if (cursorPosition.col < 5 && !lettersArray[cursorPosition.col]) {
          lettersArray[cursorPosition.col] = key.toLowerCase();
          
          // Reconstruir string removendo espaços vazios
          const newGuess = lettersArray.filter(letter => letter !== '').join('');
          
          const newGameState = {
            ...gameState,
            currentGuess: newGuess
          };
          
          setGameState(newGameState);
          saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
          
          // Mover cursor para a direita
          setCursorPosition({ 
            row: cursorPosition.row, 
            col: Math.min(4, cursorPosition.col + 1)
          });
        }
      }
    }
  }, [gameState, cursorPosition, submitGuess, saveGameProgress, setCursorPosition]);

  return { handleKeyPress };
};
