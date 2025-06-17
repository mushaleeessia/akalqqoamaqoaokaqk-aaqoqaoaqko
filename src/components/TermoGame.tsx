
import { TermoGameLogic } from "./TermoGameLogic";

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
  return (
    <TermoGameLogic 
      targetWord={targetWord} 
      isDarkMode={isDarkMode}
    />
  );
};
