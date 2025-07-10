
import { useCallback } from "react";
import { GameState, LetterState } from "./useTermoGameState";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { evaluateGuess, updateKeyStatesForGuess } from "@/utils/gameEvaluation";
import { toast } from "@/hooks/use-toast";

interface UseGameKeyboardHandlerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  keyStates: Record<string, LetterState>;
  setKeyStates: (states: Record<string, LetterState>) => void;
  targetWord: string;
  saveGameProgress: (guesses: string[], currentGuess: string, gameStatus: 'playing' | 'won' | 'lost') => void;
  saveGameSession: (guesses: string[], won: boolean) => Promise<void>;
  setIsValidating: (validating: boolean) => void;
  setShowingFreshGameOver: (showing: boolean) => void;
  startReveal: (rowIndex: number, wordLength: number) => void;
  isRevealing: boolean;
}

export const useGameKeyboardHandler = ({
  gameState,
  setGameState,
  keyStates,
  setKeyStates,
  targetWord,
  saveGameProgress,
  saveGameSession,
  setIsValidating,
  setShowingFreshGameOver,
  startReveal,
  isRevealing
}: UseGameKeyboardHandlerProps) => {

  const updateKeyStates = (guess: string, evaluation: LetterState[]) => {
    const newKeyStates = { ...keyStates };
    updateKeyStatesForGuess(guess, evaluation, newKeyStates);
    setKeyStates(newKeyStates);
  };

  const submitGuess = useCallback(async () => {
    if (gameState.currentGuess.length !== targetWord.length) {
      toast({
        title: "Palavra incompleta",
        description: `Digite uma palavra de ${targetWord.length} letras`,
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
      
      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const isWin = gameState.currentGuess.toLowerCase() === targetWord.toLowerCase();
      const isGameOver = isWin || newGuesses.length >= 6;
      
      const newGameStatus = isWin ? 'won' : (isGameOver ? 'lost' : 'playing');
      
      const newGameState = {
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: 'playing' as 'playing' | 'won' | 'lost', // Manter jogando durante animação
        currentRow: newGuesses.length
      };
      
      setGameState(newGameState);

      // Iniciar animação de revelação
      startReveal(gameState.currentRow, targetWord.length);
      
      // Aguardar a animação terminar antes de finalizar o jogo
      const totalAnimationTime = targetWord.length * 150 + 600;
      
      setTimeout(() => {
        // Atualizar estados do teclado após a animação
        updateKeyStates(gameState.currentGuess, evaluation);
        
        // Finalizar jogo se necessário
        if (isGameOver) {
          const finalGameState = {
            ...newGameState,
            gameStatus: newGameStatus as 'playing' | 'won' | 'lost'
          };
          setGameState(finalGameState);
          setShowingFreshGameOver(true);
          saveGameSession(newGuesses, isWin);
          saveGameProgress(finalGameState.guesses, finalGameState.currentGuess, finalGameState.gameStatus);
        } else {
          saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
        }
      }, totalAnimationTime);
      
      // Salvar progresso imediatamente para a nova tentativa
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
    if (gameState.gameStatus !== 'playing' || isRevealing) return;

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
      if (gameState.currentGuess.length < targetWord.length) {
        const newGuess = gameState.currentGuess + key.toLowerCase();
        const newGameState = {
          ...gameState,
          currentGuess: newGuess
        };
        setGameState(newGameState);
        saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
      }
    }
  }, [gameState, submitGuess, saveGameProgress, isRevealing]);

  return { handleKeyPress };
};
