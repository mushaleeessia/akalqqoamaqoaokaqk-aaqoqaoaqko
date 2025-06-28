
import { useState, useCallback, useEffect } from 'react';

export interface CursorPosition {
  row: number;
  col: number;
}

export const useTermoCursor = (currentRow: number, currentGuess: string, gameStatus: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ 
    row: currentRow, 
    col: 0 
  });

  // Sincronizar cursor com a linha atual apenas quando muda de linha
  useEffect(() => {
    if (currentRow !== cursorPosition.row) {
      setCursorPosition({ 
        row: currentRow, 
        col: 0
      });
    }
  }, [currentRow]);

  const handleCellClick = useCallback((row: number, col: number) => {
    console.log('Cell clicked:', row, col, 'Game status:', gameStatus, 'Current row:', currentRow);
    
    // Só permitir cliques na linha atual durante o jogo
    if (gameStatus === 'playing' && row === currentRow) {
      // Permitir clique em qualquer posição válida (0 até length da palavra atual + 1)
      const maxCol = Math.min(currentGuess.length, 4);
      const targetCol = Math.max(0, Math.min(col, maxCol));
      
      console.log('Setting cursor to:', { row, col: targetCol });
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
