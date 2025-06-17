import { useState, useEffect, useCallback } from "react";
import { TermoGrid } from "./TermoGrid";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { usePlayerSession } from "@/hooks/usePlayerSession";
import { toast } from "@/hooks/use-toast";

interface TermoGameProps {
  targetWord: string;
  isDarkMode: boolean;
}

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export const TermoGame = ({ targetWord, isDarkMode }: TermoGameProps) => {
  const { canPlay, sessionInfo, saveGameProgress } = usePlayerSession();
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const [isValidating, setIsValidating] = useState(false);
  const maxGuesses = 6;

  // Carregar progresso salvo ao inicializar
  useEffect(() => {
    if (sessionInfo) {
      setGameState({
        guesses: sessionInfo.guesses || [],
        currentGuess: sessionInfo.currentGuess || '',
        gameStatus: sessionInfo.gameStatus || 'playing',
        currentRow: sessionInfo.guesses?.length || 0
      });

      // Recalcular keyStates baseado nas tentativas salvas
      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const newKeyStates: Record<string, LetterState> = {};
        sessionInfo.guesses.forEach(guess => {
          const evaluation = evaluateGuess(guess);
          updateKeyStatesForGuess(guess, evaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
      }
    }
  }, [sessionInfo, targetWord]);

  const evaluateGuess = (guess: string): LetterState[] => {
    const result: LetterState[] = [];
    const targetArray = targetWord.toLowerCase().split('');
    const guessArray = guess.toLowerCase().split('');
    
    // Primeiro passo: marcar corretas
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = '#'; // Marcar como usado
      } else {
        result[i] = 'absent'; // Temporário
      }
    }
    
    // Segundo passo: marcar presentes
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'absent') {
        const letterIndex = targetArray.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
          result[i] = 'present';
          targetArray[letterIndex] = '#'; // Marcar como usado
        }
      }
    }
    
    return result;
  };

  const updateKeyStatesForGuess = (guess: string, evaluation: LetterState[], keyStatesObj: Record<string, LetterState>) => {
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i].toLowerCase();
      const state = evaluation[i];
      
      // Só atualizar se for um estado "melhor"
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
          description: "Esta palavra não existe no dicionário",
          variant: "destructive"
        });
        setIsValidating(false);
        return;
      }

      // Usar a forma correta da palavra (com acentos)
      const correctWord = validationResult.correctForm;
      
      // Mostrar toast com a forma correta se for diferente da digitada
      if (correctWord.toLowerCase() !== gameState.currentGuess.toLowerCase()) {
        toast({
          title: "Palavra aceita",
          description: `Forma correta: "${correctWord}"`,
          variant: "default"
        });
      }

      const evaluation = evaluateGuess(gameState.currentGuess);
      updateKeyStates(gameState.currentGuess, evaluation);
      
      const newGuesses = [...gameState.guesses, gameState.currentGuess];
      const isWin = gameState.currentGuess.toLowerCase() === targetWord.toLowerCase();
      const isGameOver = isWin || newGuesses.length >= maxGuesses;
      
      const newGameStatus = isWin ? 'won' : (isGameOver ? 'lost' : 'playing');
      
      const newGameState = {
        guesses: newGuesses,
        currentGuess: '',
        gameStatus: newGameStatus as 'playing' | 'won' | 'lost',
        currentRow: newGuesses.length
      };
      
      setGameState(newGameState);

      // Salvar o progresso imediatamente quando o jogo termina
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
  }, [gameState.currentGuess, gameState.guesses, targetWord, keyStates, saveGameProgress]);

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
      
      // Salvar progresso da digitação atual
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    } else if (key.length === 1 && gameState.currentGuess.length < 5) {
      const newGameState = {
        ...gameState,
        currentGuess: gameState.currentGuess + key.toLowerCase()
      };
      setGameState(newGameState);
      
      // Salvar progresso da digitação atual
      saveGameProgress(newGameState.guesses, newGameState.currentGuess, newGameState.gameStatus);
    }
  }, [gameState, isValidating, submitGuess, saveGameProgress]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        event.preventDefault();
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        event.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (/^[A-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const handlePlayAgain = () => {
    window.location.reload();
  };

  // Se o jogador não pode jogar, mostrar mensagem
  if (!canPlay && sessionInfo) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {sessionInfo.completed ? '✅ Você já jogou hoje!' : '❌ Tentativas esgotadas!'}
          </h2>
          <p className="text-white/80 mb-2">
            {sessionInfo.completed 
              ? `Parabéns! Você completou o Termo de hoje.`
              : `Você esgotou suas tentativas para hoje.`
            }
          </p>
          <p className="text-white/60 text-sm">
            Uma nova palavra estará disponível amanhã!
          </p>
          <div className="mt-4 text-white/50 text-xs">
            Tentativas realizadas: {sessionInfo.attempts}
          </div>
        </div>
      </div>
    );
  }

  if (gameState.gameStatus !== 'playing') {
    return (
      <TermoGameOver
        gameState={gameState}
        targetWord={targetWord}
        isDarkMode={isDarkMode}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {isValidating && (
        <div className="text-white text-sm opacity-70">
          Validando palavra...
        </div>
      )}
      
      <TermoGrid
        guesses={gameState.guesses}
        currentGuess={gameState.currentGuess}
        targetWord={targetWord}
        currentRow={gameState.currentRow}
        maxGuesses={maxGuesses}
        isDarkMode={isDarkMode}
      />
      
      <TermoKeyboard
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
        isDarkMode={isDarkMode}
        disabled={isValidating}
      />
    </div>
  );
};
