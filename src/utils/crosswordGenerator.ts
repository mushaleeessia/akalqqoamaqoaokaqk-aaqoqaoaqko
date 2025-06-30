
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { CROSSWORD_WORDS } from '@/data/crosswordWords';
import { PlacedWord } from '@/types/crosswordGenerator';
import { placeWordOnGrid } from '@/utils/crosswordPlacement';
import { findIntersections } from '@/utils/crosswordIntersection';
import { canPlaceWord } from '@/utils/crosswordValidation';

const GRID_SIZE = 15;
const MAX_PLACEMENT_ATTEMPTS = 30;

export const generateCrosswordPuzzle = (): CrosswordPuzzle => {
  const grid: CrosswordCell[][] = [];
  const placedWords: PlacedWord[] = [];
  const clues = { across: [] as CrosswordClue[], down: [] as CrosswordClue[] };
  
  // Initialize grid with properly structured blocked cells
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[i] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      grid[i][j] = {
        letter: '',
        isBlocked: true,
        userInput: '',
        belongsToWords: {},
        number: undefined
      };
    }
  }

  // Get shuffled word list
  const availableWords = [...CROSSWORD_WORDS].sort(() => Math.random() - 0.5);
  let nextClueNumber = 1;

  // Place first word horizontally in the center
  const firstWord = availableWords[0];
  const centerRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - firstWord.word.length) / 2);
  
  console.log(`Generating puzzle - placing first word: "${firstWord.word}" at [${centerRow}, ${startCol}]`);
  
  nextClueNumber = placeWordOnGrid(
    firstWord,
    centerRow,
    startCol,
    'across',
    grid,
    placedWords,
    clues,
    nextClueNumber
  );

  console.log(`After placing first word, nextClueNumber is now: ${nextClueNumber}`);

  // Try to place remaining words
  for (let i = 1; i < availableWords.length && placedWords.length < 10; i++) {
    const wordDef = availableWords[i];
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < MAX_PLACEMENT_ATTEMPTS) {
      attempts++;
      
      // Find intersections with all placed words
      const allIntersections = [];
      for (const placedWord of placedWords) {
        const intersections = findIntersections(wordDef.word, placedWord, GRID_SIZE);
        allIntersections.push(...intersections);
      }
      
      if (allIntersections.length > 0) {
        // Embaralhar as intersecções para variedade
        const shuffledIntersections = allIntersections.sort(() => Math.random() - 0.5);
        
        for (const intersection of shuffledIntersections) {
          if (canPlaceWord(wordDef.word, intersection.row, intersection.col, intersection.direction, grid, placedWords, GRID_SIZE)) {
            console.log(`Placing word: "${wordDef.word}" at [${intersection.row}, ${intersection.col}] with number ${nextClueNumber}`);
            
            nextClueNumber = placeWordOnGrid(
              wordDef,
              intersection.row,
              intersection.col,
              intersection.direction,
              grid,
              placedWords,
              clues,
              nextClueNumber
            );
            placed = true;
            break;
          }
        }
      }
    }
  }

  // Block all remaining cells that don't belong to any word
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j].letter === '') {
        grid[i][j].isBlocked = true;
      }
    }
  }

  // Sort clues by number
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);

  console.log('Final grid numbers check:');
  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      if (grid[i][j].number) {
        console.log(`Grid[${i}][${j}].number = ${grid[i][j].number}`);
      }
    }
  }

  console.log('Final clues:', {
    across: clues.across.map(c => `${c.number}: ${c.clue}`),
    down: clues.down.map(c => `${c.number}: ${c.clue}`)
  });

  return {
    grid,
    clues,
    size: GRID_SIZE
  };
};
