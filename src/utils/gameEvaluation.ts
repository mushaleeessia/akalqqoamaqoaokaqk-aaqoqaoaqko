
import { LetterState } from "@/hooks/useTermoGameState";

export const evaluateGuess = (guess: string, targetWord: string): LetterState[] => {
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

export const updateKeyStatesForGuess = (
  guess: string, 
  evaluation: LetterState[], 
  keyStatesObj: Record<string, LetterState>
) => {
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
