
import { useState, useCallback, useEffect } from 'react';

export interface CursorPosition {
  row: number;
  col: number;
}

export const useTermoCursor = (currentRow: number, currentGuess: string, gameStatus: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ 
    row: currentRow, 
    col: currentGuess.length 
  });

  // Sempre manter cursor na linha atual
  useEffect(() => {
    setCursorPosition(prev => ({ 
      row: currentRow, 
      col: Math.min(prev.col, currentGuess.length) 
    }));
  }, [currentRow, currentGuess.length]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Só permitir cliques na linha atual durante o jogo
    if (gameStatus === 'playing' && row === currentRow) {
      // Permitir clique em qualquer posição até o final da palavra atual + 1
      const maxClickableCol = Math.min(currentGuess.length, 4);
      const targetCol = Math.min(col, maxClickableCol);
      
      setCursorPosition({ row, col: targetCol });
      return true;
    }
    return false;
  }, [currentRow, gameStatus, currentGuess.length]);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick
  };
};
