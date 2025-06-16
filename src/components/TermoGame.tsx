
import { useState, useEffect, useCallback } from "react";
import { TermoGrid } from "./TermoGrid";
import { TermoKeyboard } from "./TermoKeyboard";
import { TermoGameOver } from "./TermoGameOver";
import { validatePortugueseWord } from "@/utils/portugueseWords";
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
  const [gameState, setGameState] = useState<GameState>({
    guesses: [],
    currentGuess: '',
    gameStatus: 'playing',
    currentRow: 0
  });

  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});
  const maxGuesses = 6;

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

  const updateKeyStates = (guess: string, evaluation: LetterState[]) => {
    const newKeyStates = { ...keyStates };
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i].toLowerCase();
      const state = evaluation[i];
      
      // Só atualizar se for um estado "melhor"
      if (!newKeyStates[letter] || 
          (newKeyStates[letter] === 'absent' && state !== 'absent') ||
          (newKeyStates[letter] === 'present' && state === 'correct')) {
        newKeyStates[letter] = state;
      }
    }
    
    setKeyStates(newKeyStates);
  };

  const submitGuess = useCallback(() => {
    if (gameState.currentGuess.length !== 5) {
      toast({
        title: "Palavra incompleta",
        description: "Digite uma palavra de 5 letras",
        variant: "destructive"
      });
      return;
    }

    if (!validatePortugueseWord(gameState.currentGuess)) {
      toast({
        title: "Palavra inválida",
        description: "Esta palavra não existe no dicionário",
        variant: "destructive"
      });
      return;
    }

    const evaluation = evaluateGuess(gameState.currentGuess);
    updateKeyStates(gameState.currentGuess, evaluation);
    
    const newGuesses = [...gameState.guesses, gameState.currentGuess];
    const isWin = gameState.currentGuess.toLowerCase() === targetWord.toLowerCase();
    const isGameOver = isWin || newGuesses.length >= maxGuesses;
    
    setGameState({
      guesses: newGuesses,
      currentGuess: '',
      gameStatus: isWin ? 'won' : (isGameOver ? 'lost' : 'playing'),
      currentRow: newGuesses.length
    });
  }, [gameState.currentGuess, gameState.guesses, targetWord, keyStates]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      }));
    } else if (key.length === 1 && gameState.currentGuess.length < 5) {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key.toLowerCase()
      }));
    }
  }, [gameState.gameStatus, gameState.currentGuess, submitGuess]);

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

  if (gameState.gameStatus !== 'playing') {
    return (
      <TermoGameOver
        gameState={gameState}
        targetWord={targetWord}
        isDarkMode={isDarkMode}
        onPlayAgain={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
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
      />
    </div>
  );
};
