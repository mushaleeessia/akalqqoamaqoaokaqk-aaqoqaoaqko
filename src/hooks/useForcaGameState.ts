
import { useState, useCallback } from "react";
import { getRandomWord, ForcaWord, validateWord } from "@/utils/forcaWords";
import { toast } from "@/hooks/use-toast";

export type LetterState = 'correct' | 'wrong' | 'unused';

export interface ForcaGameState {
  currentWord: ForcaWord;
  guessedLetters: string[];
  wrongGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  displayWord: string[];
}

export const useForcaGameState = () => {
  const maxWrongGuesses = 6;
  
  const initializeGame = (): ForcaGameState => {
    const word = getRandomWord();
    return {
      currentWord: word,
      guessedLetters: [],
      wrongGuesses: 0,
      gameStatus: 'playing',
      displayWord: word.word.split('').map(() => '_')
    };
  };

  const [gameState, setGameState] = useState<ForcaGameState>(initializeGame);
  const [keyStates, setKeyStates] = useState<Record<string, LetterState>>({});

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  };

  const checkWinCondition = (displayWord: string[]): boolean => {
    return !displayWord.includes('_');
  };

  const handleLetterGuess = useCallback((letter: string) => {
    if (gameState.gameStatus !== 'playing') return;

    const normalizedLetter = normalizeString(letter);
    const normalizedGuessedLetters = gameState.guessedLetters.map(l => normalizeString(l));
    
    if (normalizedGuessedLetters.includes(normalizedLetter)) {
      toast({
        title: "Letra já tentada",
        description: "Você já tentou esta letra",
        variant: "destructive"
      });
      return;
    }

    const normalizedWord = normalizeString(gameState.currentWord.word);
    const isCorrect = normalizedWord.includes(normalizedLetter);
    
    setGameState(prevState => {
      const newGuessedLetters = [...prevState.guessedLetters, letter];
      let newDisplayWord = [...prevState.displayWord];
      let newWrongGuesses = prevState.wrongGuesses;

      if (isCorrect) {
        // Revelar todas as ocorrências da letra
        for (let i = 0; i < normalizedWord.length; i++) {
          if (normalizedWord[i] === normalizedLetter) {
            newDisplayWord[i] = prevState.currentWord.word[i];
          }
        }
      } else {
        newWrongGuesses += 1;
      }

      const hasWon = checkWinCondition(newDisplayWord);
      const hasLost = newWrongGuesses >= maxWrongGuesses;
      const newGameStatus = hasWon ? 'won' : (hasLost ? 'lost' : 'playing');

      return {
        ...prevState,
        guessedLetters: newGuessedLetters,
        displayWord: newDisplayWord,
        wrongGuesses: newWrongGuesses,
        gameStatus: newGameStatus
      };
    });

    // Atualizar estado das teclas
    setKeyStates(prevKeyStates => ({
      ...prevKeyStates,
      [normalizedLetter]: isCorrect ? 'correct' : 'wrong'
    }));
  }, [gameState]);

  const startNewGame = useCallback(() => {
    const newGameState = initializeGame();
    setGameState(newGameState);
    setKeyStates({});
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState.gameStatus !== 'playing') return;

    if (key === 'NOVA') {
      startNewGame();
    } else if (validateWord(key) && key.length === 1) {
      handleLetterGuess(key);
    }
  }, [gameState.gameStatus, handleLetterGuess, startNewGame]);

  return {
    gameState,
    keyStates,
    maxWrongGuesses,
    handleKeyPress,
    startNewGame
  };
};
