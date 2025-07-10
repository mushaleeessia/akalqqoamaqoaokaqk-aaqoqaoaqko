import { TermoRow } from "./TermoRow";
import { LetterState } from "@/hooks/useTermoGameState";
import { RevealState } from "@/hooks/useRevealAnimation";

interface TermoGridProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  currentRow: number;
  maxGuesses: number;
  isDarkMode: boolean;
  isWordCompleted?: boolean;
  revealState?: RevealState;
}

export const TermoGrid = ({ 
  guesses, 
  currentGuess, 
  targetWord, 
  currentRow, 
  maxGuesses,
  isDarkMode,
  isWordCompleted = false,
  revealState
}: TermoGridProps) => {
  
  const wordLength = targetWord.length;

  const evaluateGuess = (guess: string): LetterState[] => {
    const result: LetterState[] = [];
    const targetArray = targetWord.toLowerCase().split('');
    const guessArray = guess.toLowerCase().split('');
    
    // Primeiro passo: marcar corretas
    for (let i = 0; i < wordLength; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = '#';
      } else {
        result[i] = 'absent';
      }
    }
    
    // Segundo passo: marcar presentes
    for (let i = 0; i < wordLength; i++) {
      if (result[i] === 'absent') {
        const letterIndex = targetArray.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
          result[i] = 'present';
          targetArray[letterIndex] = '#';
        }
      }
    }
    
    return result;
  };

  // Encontrar em qual tentativa a palavra foi acertada
  const findCompletedRow = (): number => {
    for (let i = 0; i < guesses.length; i++) {
      if (guesses[i].toLowerCase() === targetWord.toLowerCase()) {
        return i;
      }
    }
    return -1;
  };

  const completedRow = findCompletedRow();

  const getRowData = (rowIndex: number) => {
    let letters: string[] = [];
    let states: LetterState[] = [];

    if (rowIndex < guesses.length) {
      // Se a palavra já foi acertada e esta linha é posterior ao acerto, mostrar vazia
      if (completedRow !== -1 && rowIndex > completedRow) {
        letters = new Array(wordLength).fill('');
        states = new Array(wordLength).fill('empty');
      } else {
        // Linha com guess já feito - preencher corretamente
        const guess = guesses[rowIndex];
        letters = new Array(wordLength).fill('');
        for (let i = 0; i < guess.length && i < wordLength; i++) {
          letters[i] = guess[i];
        }
        states = evaluateGuess(guess);
      }
    } else if (rowIndex === currentRow) {
      // Linha atual - se a palavra já foi acertada, não mostrar currentGuess
      if (completedRow !== -1) {
        letters = new Array(wordLength).fill('');
        states = new Array(wordLength).fill('empty');
      } else {
        // Mostrar currentGuess sequencialmente
        letters = new Array(wordLength).fill('');
        for (let i = 0; i < currentGuess.length && i < wordLength; i++) {
          letters[i] = currentGuess[i];
        }
        states = new Array(wordLength).fill('empty');
      }
    } else {
      // Linha vazia
      letters = new Array(wordLength).fill('');
      states = new Array(wordLength).fill('empty');
    }

    return { letters, states };
  };

  return (
    <div className="flex flex-col space-y-2">
      {Array.from({ length: maxGuesses }, (_, rowIndex) => {
        const { letters, states } = getRowData(rowIndex);
        
        const isRevealingThisRow = revealState?.isRevealing && revealState.revealingRowIndex === rowIndex;
        
        return (
          <TermoRow
            key={rowIndex}
            letters={letters}
            states={states}
            isDarkMode={isDarkMode}
            rowIndex={rowIndex}
            isCurrentRow={rowIndex === currentRow && !isWordCompleted}
            isRevealing={isRevealingThisRow}
            revealedCells={isRevealingThisRow ? revealState.revealedCells : []}
          />
        );
      })}
    </div>
  );
};