
export interface CrosswordCell {
  letter: string;
  isBlocked: boolean;
  number?: number;
  userInput: string;
  belongsToWords: {
    across?: number;
    down?: number;
  };
}

export interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  startRow: number;
  startCol: number;
  direction: 'across' | 'down';
  length: number;
}

export interface CrosswordPuzzle {
  grid: CrosswordCell[][];
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
  size: number;
}
