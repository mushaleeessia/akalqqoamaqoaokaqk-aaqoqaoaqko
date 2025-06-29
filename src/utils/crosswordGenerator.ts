
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { CROSSWORD_WORDS } from '@/data/crosswordWords';
import { PlacedWord } from '@/types/crosswordGenerator';
import { placeWordOnGrid } from '@/utils/crosswordPlacement';
import { findIntersections } from '@/utils/crosswordIntersection';
import { canPlaceWord } from '@/utils/crosswordValidation';

const GRID_SIZE = 15;
const MAX_PLACEMENT_ATTEMPTS = 50;

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
  let clueNumber = 1;

  // Place first word horizontally in the center - GARANTIR que receba número 1
  const firstWord = availableWords[0];
  const centerRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - firstWord.word.length) / 2);
  
  console.log(`Placing first word: "${firstWord.word}" at row ${centerRow}, col ${startCol} with number ${clueNumber}`);
  
  // Place the first word and ensure it gets number 1
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

  console.log(`After placing first word, grid[${centerRow}][${startCol}].number =`, grid[centerRow][startCol].number);

  // Try to place remaining words
  for (let i = 1; i < availableWords.length && placedWords.length < 12; i++) {
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
        const randomIntersection = allIntersections[Math.floor(Math.random() * allIntersections.length)];
        
        if (canPlaceWord(wordDef.word, randomIntersection.row, randomIntersection.col, randomIntersection.direction, grid, placedWords, GRID_SIZE)) {
          console.log(`Placing word: "${wordDef.word}" at row ${randomIntersection.row}, col ${randomIntersection.col} with number ${clueNumber}`);
          
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
      if (grid[i][j].letter === '') {
        grid[i][j].isBlocked = true;
      }
    }
  }

  // Sort clues by number
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);

  console.log('Generated clues:', clues);
  console.log('Grid with numbers:', grid.map(row => row.map(cell => cell.number || '.')));

  return {
    grid,
    clues,
    size: GRID_SIZE
  };
};
