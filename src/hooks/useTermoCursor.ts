
import { useState, useCallback, useEffect } from 'react';

export interface CursorPosition {
  row: number;
  col: number;
}

export const useTermoCursor = (currentRow: number, currentGuess: string, gameStatus: string) => {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ row: currentRow, col: 0 });

  // Sempre manter o cursor na linha atual
  useEffect(() => {
    setCursorPosition(prev => ({ ...prev, row: currentRow }));
  }, [currentRow]);

  // Atualizar cursor quando a palavra muda (digitação normal)
  useEffect(() => {
    if (gameStatus === 'playing') {
      setCursorPosition(prev => ({ ...prev, col: currentGuess.length }));
    }
  }, [currentGuess.length, gameStatus]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Só permite clicar na linha atual durante o jogo
    if (gameStatus !== 'playing' || row !== currentRow) {
      return false;
    }
    
    // Permite clicar em qualquer posição da linha atual (0 a 4)
    if (col >= 0 && col <= 4) {
      setCursorPosition({ row, col });
      return true;
    }
    
    return false;
  }, [gameStatus, currentRow]);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick
  };
};
