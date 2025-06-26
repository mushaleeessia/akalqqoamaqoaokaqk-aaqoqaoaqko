
import { useState, useCallback, useEffect } from 'react';

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

  // Atualizar automaticamente quando a linha atual muda
  useEffect(() => {
    setCursorPosition(prev => ({ ...prev, row: currentRow }));
  }, [currentRow]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Só permite clicar na linha atual durante o jogo
    if (gameStatus !== 'playing' || row !== currentRow) {
      return false;
    }
    
    // Permite clicar em qualquer posição até o final da palavra atual
    if (col <= currentGuess.length) {
      setCursorPosition({ row, col });
      return true;
    }
    
    return false;
  }, [gameStatus, currentRow, currentGuess.length]);

  const moveCursorToEnd = useCallback(() => {
    if (gameStatus === 'playing') {
      setCursorPosition({ row: currentRow, col: currentGuess.length });
    }
  }, [gameStatus, currentRow, currentGuess.length]);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick,
    updateCursorFromGuess,
    moveCursorToEnd
  };
};
