
export interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

export interface IntersectionPosition {
  row: number;
  col: number;
  direction: 'across' | 'down';
}
