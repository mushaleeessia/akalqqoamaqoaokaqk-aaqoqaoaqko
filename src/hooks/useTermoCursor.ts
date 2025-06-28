
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

  // Função para lidar com cliques nas células
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus === 'playing' && row === currentRow) {
      // Permitir clicar em qualquer posição de 0 a 4 (5 colunas)
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
