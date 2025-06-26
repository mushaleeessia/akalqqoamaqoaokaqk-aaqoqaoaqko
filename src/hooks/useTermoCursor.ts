
import { useState, useCallback } from 'react';

export interface CursorPosition {
  row: number;
  col: number;
}

export const useTermoCursor = (currentRow: number, currentGuess: string, gameStatus: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ row: currentRow, col: 0 });

  const updateCursorFromGuess = useCallback(() => {
    if (gameStatus === 'playing') {
      setCursorPosition({ row: currentRow, col: currentGuess.length });
    }
  }, [currentRow, currentGuess, gameStatus]);

  const handleCellClick = useCallback((row: number, col: number, hasLetter: boolean) => {
    // Só permite clicar na linha atual e em células vazias
    if (gameStatus !== 'playing' || row !== currentRow || hasLetter) {
      return false;
    }
    
    // Só permite clicar em posições válidas (até onde já tem letras + 1)
    if (col <= currentGuess.length) {
      setCursorPosition({ row, col });
      return true;
    }
    
    return false;
  }, [gameStatus, currentRow, currentGuess]);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick,
    updateCursorFromGuess
  };
};
