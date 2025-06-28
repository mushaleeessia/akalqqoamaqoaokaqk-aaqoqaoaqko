
import { useState, useCallback, useEffect } from 'react';

export interface CursorPosition {
  row: number;
  col: number;
}

export const useTermoCursor = (currentRow: number, currentGuess: string, gameStatus: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ row: currentRow, col: 0 });

  // Manter cursor na linha atual
  useEffect(() => {
    setCursorPosition(prev => ({ ...prev, row: currentRow }));
  }, [currentRow]);

  // Ajustar cursor quando o currentGuess muda
  useEffect(() => {
    setCursorPosition(prev => {
      const maxCol = Math.min(currentGuess.length, 4);
      if (prev.col > maxCol) {
        return { ...prev, col: maxCol };
      }
      return prev;
    });
  }, [currentGuess]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Só permitir cliques na linha atual durante o jogo
    if (gameStatus === 'playing' && row === currentRow) {
      setCursorPosition({ row, col });
      return true;
    }
    return false;
  }, [currentRow, gameStatus]);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick
  };
};
