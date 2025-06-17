
import { LetterState } from "@/hooks/useMultiModeGameState";

interface TermoGridProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  currentRow: number;
  maxGuesses: number;
  isDarkMode: boolean;
}

export const TermoGrid = ({ 
  guesses, 
  currentGuess, 
  targetWord, 
  currentRow, 
  maxGuesses,
  isDarkMode 
}: TermoGridProps) => {
  
  const evaluateGuess = (guess: string): LetterState[] => {
    const result: LetterState[] = [];
    const targetArray = targetWord.toLowerCase().split('');
    const guessArray = guess.toLowerCase().split('');
    
    // Primeiro passo: marcar corretas
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = '#';
      } else {
        result[i] = 'absent';
      }
    }
    
    // Segundo passo: marcar presentes
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

  const getLetterClass = (state: LetterState, isDark: boolean): string => {
    const baseClass = "w-14 h-14 border-2 flex items-center justify-center text-xl font-bold rounded transition-all duration-300";
    
    if (isDark) {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-600 border-green-600 text-white`;
        case 'present':
          return `${baseClass} bg-yellow-600 border-yellow-600 text-white`;
        case 'absent':
          return `${baseClass} bg-gray-700 border-gray-700 text-white`;
        default:
          return `${baseClass} bg-gray-800 border-gray-600 text-white`;
      }
    } else {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-500 border-green-500 text-white`;
        case 'present':
          return `${baseClass} bg-yellow-500 border-yellow-500 text-white`;
        case 'absent':
          return `${baseClass} bg-gray-500 border-gray-500 text-white`;
        default:
          return `${baseClass} bg-white border-gray-300 text-gray-800`;
      }
    }
  };

  const renderRow = (rowIndex: number) => {
    let letters: string[] = [];
    let states: LetterState[] = [];

    if (rowIndex < guesses.length) {
      // Linha com guess já feito
      letters = guesses[rowIndex].split('');
      states = evaluateGuess(guesses[rowIndex]);
    } else if (rowIndex === currentRow) {
      // Linha atual
      letters = currentGuess.split('');
      states = new Array(5).fill('empty');
    } else {
      // Linha vazia
      letters = new Array(5).fill('');
      states = new Array(5).fill('empty');
    }

    return (
      <div key={rowIndex} className="flex space-x-2">
        {Array.from({ length: 5 }, (_, colIndex) => (
          <div
            key={colIndex}
            className={getLetterClass(states[colIndex], isDarkMode)}
          >
            {letters[colIndex]?.toUpperCase() || ''}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: maxGuesses }, (_, index) => renderRow(index))}
    </div>
  );
};
