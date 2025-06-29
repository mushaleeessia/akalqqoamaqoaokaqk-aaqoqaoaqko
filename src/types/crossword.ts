
export interface CrosswordCell {
  letter: string;
  isBlocked: boolean;
  number?: number;
  userInput: string;
  belongsToWords: {
    across?: number;
    down?: number;
  };
  isCorrect?: boolean;
  isLocked?: boolean;
}

export interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  length: number;
  isCompleted?: boolean;
}

export interface CrosswordPuzzle {
  grid: CrosswordCell[][];
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
  size: number;
}
