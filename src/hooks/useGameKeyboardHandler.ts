
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

// Adicionar interface para posições das letras
interface LetterPositions {
  [position: number]: string;
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

  // Converter currentGuess para array de posições
  const getCurrentGuessAsPositions = (): LetterPositions => {
    const positions: LetterPositions = {};
    // Assumindo que currentGuess é uma string sequencial por enquanto
    for (let i = 0; i < gameState.currentGuess.length && i < 5; i++) {
      positions[i] = gameState.currentGuess[i];
    }
    return positions;
  };

  // Converter posições para string para validação
  const positionsToString = (positions: LetterPositions): string => {
    let result = '';
    for (let i = 0; i < 5; i++) {
      if (positions[i]) {
        result += positions[i];
      }
    }
    return result;
  };

  const submitGuess = useCallback(async () => {
    const positions = getCurrentGuessAsPositions();
    const wordString = positionsToString(positions);
    
    if (wordString.length !== 5) {
      toast({
        title: "Palavra incompleta",
        description: "Digite uma palavra de 5 letras",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const validationResult = await validatePortugueseWord(wordString);
      
      if (!validationResult.isValid) {
        toast({
          title: "Palavra inválida",  
          description: "Palavra inválida",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      const evaluation = evaluateGuess(wordString, targetWord);
      updateKeyStates(wordString, evaluation);
      
      const newGuesses = [...gameState.guesses, wordString];
      const isWin = wordString.toLowerCase() === targetWord.toLowerCase();
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
      if (cursorPosition.col > 0) {
        const positions = getCurrentGuessAsPositions();
        const deletePosition = cursorPosition.col - 1;
        
        // Remover letra da posição específica
        delete positions[deletePosition];
        
        // Reconstruir string sequencial (sem gaps)
        const newGuess = positionsToString(positions);
        
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
      const positions = getCurrentGuessAsPositions();
      const currentLength = positionsToString(positions).length;
      
      if (currentLength < 5) {
        // Se estamos no final ou numa posição vazia, adicionar letra
        if (cursorPosition.col >= currentLength) {
          positions[currentLength] = key.toLowerCase();
        } else {
          // Inserir na posição do cursor, empurrando as outras para frente
          const tempPositions: LetterPositions = {};
          let insertIndex = 0;
          
          for (let i = 0; i < 5; i++) {
            if (i === cursorPosition.col) {
              tempPositions[insertIndex] = key.toLowerCase();
              insertIndex++;
            }
            if (positions[i]) {
              tempPositions[insertIndex] = positions[i];
              insertIndex++;
            }
          }
          
          // Usar as novas posições
          Object.keys(positions).forEach(k => delete positions[parseInt(k)]);
          Object.assign(positions, tempPositions);
        }
        
        const newGuess = positionsToString(positions);
        
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
        
        // Mover cursor para a direita, mas não além do comprimento atual + 1
        const newLength = newGuess.length;
        setCursorPosition({ 
          row: cursorPosition.row, 
          col: Math.min(newLength, cursorPosition.col + 1)
        });
      }
    }
  }, [gameState, cursorPosition, submitGuess, saveGameProgress, setCursorPosition]);

  return { handleKeyPress };
};
