
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

  // Manter cursor na linha atual quando muda de linha
  useEffect(() => {
    if (currentRow !== cursorPosition.row) {
      setCursorPosition({ 
        row: currentRow, 
        col: 0 
      });
    }
  }, [currentRow]);

  // Ajustar posição do cursor se necessário quando a palavra muda
  useEffect(() => {
    setCursorPosition(prev => {
      const newCol = Math.min(prev.col, Math.max(currentGuess.length, 0));
      return {
        row: prev.row,
        col: newCol
      };
    });
  }, [currentGuess.length]);

  const handleCellClick = useCallback((row: number, col: number) => {
    console.log('Cell clicked:', row, col, 'Game status:', gameStatus, 'Current row:', currentRow);
    
    // Só permitir cliques na linha atual durante o jogo
    if (gameStatus === 'playing' && row === currentRow) {
      // Permitir clique em qualquer posição válida (0-4) ou no final da palavra atual
      const targetCol = Math.min(col, 4);
      
      console.log('Setting cursor to:', { row, col: targetCol });
      setCursorPosition({ row, col: targetCol });
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
