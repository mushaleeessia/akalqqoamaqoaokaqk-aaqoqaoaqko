
import { useEffect } from "react";
import { TermoRow } from "./TermoRow";
import { LetterState } from "@/hooks/useTermoGameState";

interface TermoGridProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  currentRow: number;
  maxGuesses: number;
  isDarkMode: boolean;
  isWordCompleted?: boolean;
  onCursorMove?: (position: { row: number; col: number }) => void;
  cursorPosition?: { row: number; col: number };
  onCellClick?: (row: number, col: number) => boolean;
}

export const TermoGrid = ({ 
  guesses, 
  currentGuess, 
  targetWord, 
  currentRow, 
  maxGuesses,
  isDarkMode,
  isWordCompleted = false,
  onCursorMove,
  cursorPosition,
  onCellClick
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

  const getRowData = (rowIndex: number) => {
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

    return { letters, states };
  };

  const handleCellClick = (row: number, col: number) => {
    if (onCellClick) {
      const success = onCellClick(row, col);
      if (success && onCursorMove) {
        onCursorMove({ row, col });
      }
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: maxGuesses }, (_, rowIndex) => {
        const { letters, states } = getRowData(rowIndex);
        const isCurrentRow = rowIndex === currentRow && !isWordCompleted;
        
        return (
          <TermoRow
            key={rowIndex}
            letters={letters}
            states={states}
            isDarkMode={isDarkMode}
            rowIndex={rowIndex}
            activeCell={isCurrentRow && cursorPosition ? cursorPosition.col : undefined}
            onCellClick={handleCellClick}
            isCurrentRow={isCurrentRow}
          />
        );
      })}
    </div>
  );
};
