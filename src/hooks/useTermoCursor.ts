
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

  // Função para lidar com cliques nas células
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus === 'playing' && row === currentRow) {
      // Permitir clicar apenas na linha atual e até onde há letras + 1
      const maxCol = Math.min(currentGuess.length, 4);
      const targetCol = Math.min(col, maxCol);
      setCursorPosition({ row, col: targetCol });
      return true;
    }
    return false;
  }, [currentRow, currentGuess.length, gameStatus]);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick
  };
};
