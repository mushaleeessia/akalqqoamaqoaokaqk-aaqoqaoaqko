
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

  // Função vazia para manter compatibilidade
  const handleCellClick = useCallback(() => {
    return false;
  }, []);

  return {
    cursorPosition,
    setCursorPosition,
    handleCellClick
  };
};
