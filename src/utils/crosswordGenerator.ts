
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { crosswordWords } from '@/data/crosswordWords';
import { PlacedWord } from '@/types/crosswordGenerator';
import { placeWordOnGrid } from '@/utils/crosswordPlacement';
import { findIntersectionPositions } from '@/utils/crosswordIntersection';
import { canPlaceWord, validatePlacement } from '@/utils/crosswordValidation';

const GRID_SIZE = 15;
const MAX_PLACEMENT_ATTEMPTS = 50;

export const generateCrosswordPuzzle = (): CrosswordPuzzle => {
  const grid: CrosswordCell[][] = [];
  const placedWords: PlacedWord[] = [];
  const clues = { across: [] as CrosswordClue[], down: [] as CrosswordClue[] };
  
  // Initialize grid with blocked cells
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[i] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      grid[i][j] = {
        letter: '',
        isBlocked: true,
        userInput: '',
        belongsToWords: {}
      };
    }
  }

  // Get shuffled word list
  const availableWords = [...crosswordWords].sort(() => Math.random() - 0.5);
  let clueNumber = 1;

  // Place first word horizontally in the center
  const firstWord = availableWords[0];
  const centerRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - firstWord.word.length) / 2);
  
  clueNumber = placeWordOnGrid(
    firstWord,
    centerRow,
    startCol,
    'across',
    grid,
    placedWords,
    clues,
    clueNumber
  );

  // Try to place remaining words
  for (let i = 1; i < availableWords.length && placedWords.length < 12; i++) {
    const wordDef = availableWords[i];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < MAX_PLACEMENT_ATTEMPTS) {
      attempts++;
      
      const intersections = findIntersectionPositions(wordDef.word, placedWords, grid);
      
      if (intersections.length > 0) {
        const randomIntersection = intersections[Math.floor(Math.random() * intersections.length)];
        
        if (canPlaceWord(wordDef.word, randomIntersection.row, randomIntersection.col, randomIntersection.direction, grid)) {
          clueNumber = placeWordOnGrid(
            wordDef,
            randomIntersection.row,
            randomIntersection.col,
            randomIntersection.direction,
            grid,
            placedWords,
            clues,
            clueNumber
          );
          placed = true;
        }
      }
    }
  }

  // Block all remaining cells that don't belong to any word
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j].isBlocked && !grid[i][j].letter) {
        grid[i][j].isBlocked = true;
      }
    }
  }

  // Sort clues by number
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);

  return {
    grid,
    clues,
    size: GRID_SIZE
  };
};
