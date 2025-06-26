
import { useEffect } from "react";
import { LetterState } from "@/hooks/useTermoGameState";
import { useTermoCursor, CursorPosition } from "@/hooks/useTermoCursor";

interface TermoGridProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  currentRow: number;
  maxGuesses: number;
  isDarkMode: boolean;
  isWordCompleted?: boolean;
  onCursorMove?: (position: CursorPosition) => void;
}

export const TermoGrid = ({ 
  guesses, 
  currentGuess, 
  targetWord, 
  currentRow, 
  maxGuesses,
  isDarkMode,
  isWordCompleted = false,
  onCursorMove
}: TermoGridProps) => {
  
  const { cursorPosition, handleCellClick } = useTermoCursor(
    currentRow, 
    currentGuess, 
    isWordCompleted ? 'completed' : 'playing'
  );

  useEffect(() => {
    if (onCursorMove) {
      onCursorMove(cursorPosition);
    }
  }, [cursorPosition, onCursorMove]);
  
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

  const getLetterClass = (state: LetterState, isDark: boolean, isActive: boolean, isClickable: boolean): string => {
    const baseClass = "w-14 h-14 border-2 flex items-center justify-center text-xl font-bold rounded transition-all duration-200 relative";
    const cursorClass = isClickable ? "cursor-pointer hover:scale-105 hover:border-blue-400" : "cursor-default";
    
    if (isDark) {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-600 border-green-600 text-white ${cursorClass}`;
        case 'present':
          return `${baseClass} bg-yellow-600 border-yellow-600 text-white ${cursorClass}`;
        case 'absent':
          return `${baseClass} bg-gray-700 border-gray-700 text-white ${cursorClass}`;
        default:
          return `${baseClass} bg-gray-800 border-gray-600 text-white ${isActive ? 'ring-2 ring-blue-400' : ''} ${isClickable ? 'hover:border-blue-400' : ''} ${cursorClass}`;
      }
    } else {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-500 border-green-500 text-white ${cursorClass}`;
        case 'present':
          return `${baseClass} bg-yellow-500 border-yellow-500 text-white ${cursorClass}`;
        case 'absent':
          return `${baseClass} bg-gray-500 border-gray-500 text-white ${cursorClass}`;
        default:
          return `${baseClass} bg-white border-gray-300 text-gray-800 ${isActive ? 'ring-2 ring-blue-500' : ''} ${isClickable ? 'hover:border-blue-400' : ''} ${cursorClass}`;
      }
    }
  };

  // Encontrar em qual tentativa a palavra foi acertada
  const findCompletedRow = (): number => {
    for (let i = 0; i < guesses.length; i++) {
      if (guesses[i].toLowerCase() === targetWord.toLowerCase()) {
        return i;
      }
    }
    return -1;
  };

  const completedRow = findCompletedRow();

  const renderRow = (rowIndex: number) => {
    let letters: string[] = [];
    let states: LetterState[] = [];

    if (rowIndex < guesses.length) {
      // Se a palavra já foi acertada e esta linha é posterior ao acerto, mostrar vazia
      if (completedRow !== -1 && rowIndex > completedRow) {
        letters = new Array(5).fill('');
        states = new Array(5).fill('empty');
      } else {
        // Linha com guess já feito
        letters = guesses[rowIndex].split('');
        states = evaluateGuess(guesses[rowIndex]);
      }
    } else if (rowIndex === currentRow) {
      // Linha atual - se a palavra já foi acertada, não mostrar currentGuess
      if (completedRow !== -1) {
        letters = new Array(5).fill('');
        states = new Array(5).fill('empty');
      } else {
        // Preencher array com 5 posições
        letters = new Array(5).fill('');
        for (let i = 0; i < currentGuess.length && i < 5; i++) {
          letters[i] = currentGuess[i];
        }
        states = new Array(5).fill('empty');
      }
    } else {
      // Linha vazia
      letters = new Array(5).fill('');
      states = new Array(5).fill('empty');
    }

    return (
      <div key={rowIndex} className="flex space-x-2">
        {Array.from({ length: 5 }, (_, colIndex) => {
          const isCurrentRow = rowIndex === currentRow;
          const isActive = cursorPosition.row === rowIndex && cursorPosition.col === colIndex;
          const isClickable = isCurrentRow && !isWordCompleted && states[colIndex] === 'empty';
          
          return (
            <div
              key={colIndex}
              className={getLetterClass(states[colIndex], isDarkMode, isActive, isClickable)}
              onClick={() => {
                if (isClickable) {
                  handleCellClick(rowIndex, colIndex);
                }
              }}
            >
              {letters[colIndex]?.toUpperCase() || ''}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-0.5 h-8 bg-blue-500 animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: maxGuesses }, (_, index) => renderRow(index))}
    </div>
  );
};
