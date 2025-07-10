import { useState, useCallback } from "react";
import { LetterState } from "./useTermoGameState";

export interface RevealState {
  isRevealing: boolean;
  revealingRowIndex: number;
  revealedCells: boolean[];
}

export const useRevealAnimation = () => {
  const [revealState, setRevealState] = useState<RevealState>({
    isRevealing: false,
    revealingRowIndex: -1,
    revealedCells: []
  });

  const startReveal = useCallback((rowIndex: number, wordLength: number) => {
    setRevealState({
      isRevealing: true,
      revealingRowIndex: rowIndex,
      revealedCells: new Array(wordLength).fill(false)
    });

    // Revelar cada célula sequencialmente
    for (let i = 0; i < wordLength; i++) {
      setTimeout(() => {
        setRevealState(prev => ({
          ...prev,
          revealedCells: prev.revealedCells.map((revealed, index) => 
            index <= i ? true : revealed
          )
        }));
      }, i * 150);
    }

    // Finalizar revelação após todas as animações
    setTimeout(() => {
      setRevealState({
        isRevealing: false,
        revealingRowIndex: -1,
        revealedCells: []
      });
    }, wordLength * 150 + 600); // 600ms é a duração da animação flip
  }, []);

  return {
    revealState,
    startReveal
  };
};