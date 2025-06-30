
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { CROSSWORD_WORDS } from '@/data/crosswordWords';
import { PlacedWord } from '@/types/crosswordGenerator';
import { placeWordOnGrid } from '@/utils/crosswordPlacement';
import { findIntersections } from '@/utils/crosswordIntersection';
import { canPlaceWord } from '@/utils/crosswordValidation';

const MAX_PLACEMENT_ATTEMPTS = 50;

// Configurações de dificuldade baseadas no número de palavras
const DIFFICULTY_CONFIGS = [
  { words: 10, gridSize: 15 },
  { words: 12, gridSize: 17 },
  { words: 14, gridSize: 19 },
  { words: 15, gridSize: 19 },
  { words: 18, gridSize: 21 },
  { words: 19, gridSize: 21 },
  { words: 20, gridSize: 23 },
  { words: 25, gridSize: 25 }
];

export const generateCrosswordPuzzle = (): CrosswordPuzzle => {
  // Escolher configuração aleatória
  const config = DIFFICULTY_CONFIGS[Math.floor(Math.random() * DIFFICULTY_CONFIGS.length)];
  const GRID_SIZE = config.gridSize;
  const TARGET_WORDS = config.words;
  
  console.log(`Generating puzzle with ${TARGET_WORDS} words on ${GRID_SIZE}x${GRID_SIZE} grid`);
  
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
  
  console.log(`Placing first word: "${firstWord.word}" at [${centerRow}, ${startCol}]`);
  
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

  // Try to place remaining words with increased attempts for larger puzzles
  const maxAttempts = Math.min(availableWords.length, TARGET_WORDS * 2);
  
  for (let i = 1; i < maxAttempts && placedWords.length < TARGET_WORDS; i++) {
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
        // Shuffle intersections for variety
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
    
    // Se não conseguiu colocar uma palavra após muitas tentativas, pular para a próxima
    if (!placed) {
      console.log(`Could not place word: "${wordDef.word}" after ${MAX_PLACEMENT_ATTEMPTS} attempts`);
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

  console.log(`Final puzzle stats: ${placedWords.length} words placed on ${GRID_SIZE}x${GRID_SIZE} grid`);
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
