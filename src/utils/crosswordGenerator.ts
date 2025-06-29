
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';
import { getBalancedWords, WordDefinition } from '@/data/crosswordWords';

interface PlacedWord {
  word: string;
  clue: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  number: number;
}

export const generateCrosswordPuzzle = (): CrosswordPuzzle => {
  const size = 15; // Reduzido para 15x15 para ter mais densidade
  const words = getBalancedWords();
  
  // Inicializar grade vazia
  const grid: CrosswordCell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isBlocked: true,
      userInput: '',
      belongsToWords: {}
    }))
  );

  const placedWords: PlacedWord[] = [];
  const clues: { across: CrosswordClue[]; down: CrosswordClue[] } = {
    across: [],
    down: []
  };

  let clueNumber = 1;

  // Função para verificar se uma palavra pode ser colocada
  const canPlaceWord = (word: string, row: number, col: number, direction: 'across' | 'down'): boolean => {
    const len = word.length;
    
    // Verificar limites
    if (direction === 'across' && col + len > size) return false;
    if (direction === 'down' && row + len > size) return false;
    
    // Verificar conflitos e intersecções
    for (let i = 0; i < len; i++) {
      const currentRow = direction === 'across' ? row : row + i;
      const currentCol = direction === 'across' ? col + i : col;
      const currentCell = grid[currentRow][currentCol];
      
      // Se a célula já tem uma letra, deve ser a mesma
      if (!currentCell.isBlocked && currentCell.letter !== '' && currentCell.letter !== word[i]) {
        return false;
      }
    }
    
    return true;
  };

  // Função para colocar uma palavra
  const placeWord = (wordDef: WordDefinition, row: number, col: number, direction: 'across' | 'down'): boolean => {
    const word = wordDef.word;
    if (!canPlaceWord(word, row, col, direction)) return false;
    
    // Marcar células como não bloqueadas e colocar letras
    for (let i = 0; i < word.length; i++) {
      const currentRow = direction === 'across' ? row : row + i;
      const currentCol = direction === 'across' ? col + i : col;
      
      grid[currentRow][currentCol] = {
        letter: word[i],
        isBlocked: false,
        userInput: '',
        number: i === 0 ? clueNumber : grid[currentRow][currentCol].number,
        belongsToWords: {
          ...grid[currentRow][currentCol].belongsToWords,
          [direction]: clueNumber
        }
      };
    }

    // Adicionar à lista de palavras colocadas
    placedWords.push({
      word,
      clue: wordDef.clue,
      row,
      col,
      direction,
      number: clueNumber
    });

    // Criar a pista
    const clueObj: CrosswordClue = {
      number: clueNumber,
      clue: wordDef.clue,
      answer: word,
      startRow: row,
      startCol: col,
      direction,
      length: word.length
    };

    clues[direction].push(clueObj);
    clueNumber++;
    
    return true;
  };

  // Encontrar intersecções possíveis
  const findIntersections = (word: string, placedWord: PlacedWord): Array<{row: number, col: number, direction: 'across' | 'down'}> => {
    const intersections = [];
    
    for (let i = 0; i < word.length; i++) {
      for (let j = 0; j < placedWord.word.length; j++) {
        if (word[i] === placedWord.word[j]) {
          // Calcular posição para intersecção
          let newRow, newCol, newDirection: 'across' | 'down';
          
          if (placedWord.direction === 'across') {
            // Nova palavra será vertical
            newDirection = 'down';
            newRow = placedWord.row - i;
            newCol = placedWord.col + j;
          } else {
            // Nova palavra será horizontal
            newDirection = 'across';
            newRow = placedWord.row + j;
            newCol = placedWord.col - i;
          }
          
          // Verificar se a posição é válida
          if (newRow >= 0 && newCol >= 0) {
            intersections.push({ row: newRow, col: newCol, direction: newDirection });
          }
        }
      }
    }
    
    return intersections;
  };

  // Colocar a primeira palavra no centro
  if (words.length > 0) {
    const firstWord = words[0];
    const startRow = Math.floor(size / 2);
    const startCol = Math.floor((size - firstWord.word.length) / 2);
    placeWord(firstWord, startRow, startCol, 'across');
  }

  // Tentar colocar as outras palavras
  for (let i = 1; i < words.length && i < 12; i++) {
    const currentWord = words[i];
    let placed = false;
    
    // Tentar intersecções com palavras já colocadas
    for (const placedWord of placedWords) {
      if (placed) break;
      
      const intersections = findIntersections(currentWord.word, placedWord);
      
      for (const intersection of intersections) {
        if (canPlaceWord(currentWord.word, intersection.row, intersection.col, intersection.direction)) {
          placeWord(currentWord, intersection.row, intersection.col, intersection.direction);
          placed = true;
          break;
        }
      }
    }
    
    // Se não conseguiu intersecção, tentar colocar em posição livre
    if (!placed) {
      for (let attempts = 0; attempts < 50 && !placed; attempts++) {
        const direction = Math.random() < 0.5 ? 'across' : 'down';
        const row = Math.floor(Math.random() * (size - (direction === 'down' ? currentWord.word.length : 0)));
        const col = Math.floor(Math.random() * (size - (direction === 'across' ? currentWord.word.length : 0)));
        
        if (canPlaceWord(currentWord.word, row, col, direction)) {
          placeWord(currentWord, row, col, direction);
          placed = true;
        }
      }
    }
  }

  // Ordenar pistas por número
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);

  return {
    grid,
    clues,
    size
  };
};
