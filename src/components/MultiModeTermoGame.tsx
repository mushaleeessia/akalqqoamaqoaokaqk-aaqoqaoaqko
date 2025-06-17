import { useState, useEffect, useCallback } from "react";
import { GameMode } from "./GameModeSelector";
import { TermoGrid } from "./TermoGrid";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { validatePortugueseWord } from "@/utils/portugueseWords";
import { useMultiModePlayerSession } from "@/hooks/useMultiModePlayerSession";
import { toast } from "@/hooks/use-toast";

interface MultiModeTermoGameProps {
  targetWords: string[];
  mode: GameMode;
  isDarkMode: boolean;
}

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface MultiModeGameState {
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  currentRow: number;
}

export const MultiModeTermoGame = ({ targetWords, mode, isDarkMode }: MultiModeTermoGameProps) => {
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
  const maxGuesses = 6;

  // Reset keyboard states when mode changes
  useEffect(() => {
    setKeyStates({});
  }, [mode]);

  useEffect(() => {
    if (sessionInfo) {
      const newGameState = {
        guesses: sessionInfo.guesses || [],
        currentGuess: sessionInfo.currentGuess || '',
        gameStatus: sessionInfo.gameStatus || 'playing',
        currentRow: (sessionInfo.guesses || []).length
      };
      
      setGameState(prevState => {
        if (showingFreshGameOver) {
          return prevState;
        }
        if (prevState.gameStatus === 'won' || prevState.gameStatus === 'lost') {
          return prevState;
        }
        return newGameState;
      });

      if (sessionInfo.guesses && sessionInfo.guesses.length > 0) {
        const newKeyStates: Record<string, LetterState> = {};
        sessionInfo.guesses.forEach(guess => {
          const evaluation = evaluateGuessForAllWords(guess);
          const bestEvaluation = getBestEvaluationForKeyboard(evaluation);
          updateKeyStatesForGuess(guess, bestEvaluation, newKeyStates);
        });
        setKeyStates(newKeyStates);
      }
    }
  }, [sessionInfo, targetWords, showingFreshGameOver]);

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
    setShowingFreshGameOver(false);
    window.location.reload();
  };

  if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && showingFreshGameOver) {
    return (
      <TermoGameOver
        gameState={{
          guesses: gameState.guesses,
          currentGuess: gameState.currentGuess,
          gameStatus: gameState.gameStatus,
          currentRow: gameState.currentRow
        }}
        targetWord={targetWords[0]}
        isDarkMode={isDarkMode}
        onPlayAgain={handlePlayAgain}
        mode={mode}
        allTargetWords={targetWords}
      />
    );
  }

  if (!canPlay && sessionInfo && (sessionInfo.completed || sessionInfo.failed)) {
    const modeLabels = {
      solo: 'Solo',
      duo: 'Duo', 
      trio: 'Trio',
      quarteto: 'Quarteto'
    };

    return (
      <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {sessionInfo.completed ? '✅ Você já jogou hoje!' : '❌ Tentativas esgotadas!'}
          </h2>
          <p className="text-white/80 mb-2">
            {sessionInfo.completed 
              ? `Parabéns! Você completou o Termo ${modeLabels[mode]} de hoje.`
              : `Você esgotou suas tentativas para o modo ${modeLabels[mode]} hoje.`
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

  return (
    <div className="flex flex-col items-center space-y-6">
      {isValidating && (
        <div className="text-white text-sm opacity-70">
          Validando palavra...
        </div>
      )}
      
      {/* Grid layout otimizado para cada modo */}
      <div className={`grid gap-6 w-full ${
        targetWords.length === 1 
          ? 'grid-cols-1 justify-items-center max-w-md' 
          : targetWords.length === 2 
            ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' 
            : targetWords.length === 3 
              ? 'grid-cols-1 md:grid-cols-3 max-w-4xl' 
              : 'grid-cols-2 md:grid-cols-4 max-w-6xl'
      }`}>
        {targetWords.map((targetWord, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-white/60 text-sm mb-2">
              Palavra {index + 1}
            </div>
            <TermoGrid
              guesses={gameState.guesses}
              currentGuess={gameState.currentGuess}
              targetWord={targetWord}
              currentRow={gameState.currentRow}
              maxGuesses={maxGuesses}
              isDarkMode={isDarkMode}
            />
          </div>
        ))}
      </div>
      
      <TermoKeyboard
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
        isDarkMode={isDarkMode}
        disabled={isValidating}
      />
    </div>
  );
};
