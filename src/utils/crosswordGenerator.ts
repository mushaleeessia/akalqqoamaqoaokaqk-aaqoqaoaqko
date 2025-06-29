
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
  const size = 15;
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
    
    // Verificar se há espaço antes e depois da palavra (para evitar palavras muito grudadas)
    if (direction === 'across') {
      // Verificar célula antes
      if (col > 0 && !grid[row][col - 1].isBlocked && grid[row][col - 1].letter !== '') return false;
      // Verificar célula depois
      if (col + len < size && !grid[row][col + len].isBlocked && grid[row][col + len].letter !== '') return false;
    } else {
      // Verificar célula antes
      if (row > 0 && !grid[row - 1][col].isBlocked && grid[row - 1][col].letter !== '') return false;
      // Verificar célula depois
      if (row + len < size && !grid[row + len][col].isBlocked && grid[row + len][col].letter !== '') return false;
    }
    
    // Verificar conflitos e intersecções
    let intersectionCount = 0;
    for (let i = 0; i < len; i++) {
      const currentRow = direction === 'across' ? row : row + i;
      const currentCol = direction === 'across' ? col + i : col;
      const currentCell = grid[currentRow][currentCol];
      
      // Se a célula já tem uma letra, deve ser a mesma
      if (!currentCell.isBlocked && currentCell.letter !== '') {
        if (currentCell.letter !== word[i]) {
          return false;
        }
        intersectionCount++;
      }
      
      // Verificar células adjacentes para evitar letras soltas
      const adjacentPositions = [
        [currentRow - 1, currentCol], [currentRow + 1, currentCol],
        [currentRow, currentCol - 1], [currentRow, currentCol + 1]
      ];
      
      for (const [adjRow, adjCol] of adjacentPositions) {
        if (adjRow >= 0 && adjRow < size && adjCol >= 0 && adjCol < size) {
          const adjCell = grid[adjRow][adjCol];
          if (!adjCell.isBlocked && adjCell.letter !== '') {
            // Se é uma intersecção válida, ok
            if ((direction === 'across' && (adjRow === row - 1 || adjRow === row + 1)) ||
                (direction === 'down' && (adjCol === col - 1 || adjCol === col + 1))) {
              // Só permitir se for exatamente no ponto de intersecção
              const isIntersectionPoint = (direction === 'across' && adjCol === currentCol) ||
                                        (direction === 'down' && adjRow === currentRow);
              if (!isIntersectionPoint) {
                return false;
              }
            }
          }
        }
      }
    }
    
    // Para palavras que não a primeira, deve ter pelo menos uma intersecção
    if (placedWords.length > 0 && intersectionCount === 0) {
      return false;
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

  // Tentar colocar as outras palavras com mais tentativas e estratégia melhor
  for (let i = 1; i < words.length && i < 20; i++) {
    const currentWord = words[i];
    let placed = false;
    
    // Tentar intersecções com palavras já colocadas
    const shuffledPlacedWords = [...placedWords].sort(() => 0.5 - Math.random());
    
    for (const placedWord of shuffledPlacedWords) {
      if (placed) break;
      
      const intersections = findIntersections(currentWord.word, placedWord);
      const shuffledIntersections = intersections.sort(() => 0.5 - Math.random());
      
      for (const intersection of shuffledIntersections) {
        if (canPlaceWord(currentWord.word, intersection.row, intersection.col, intersection.direction)) {
          placeWord(currentWord, intersection.row, intersection.col, intersection.direction);
          placed = true;
          break;
        }
      }
    }
    
    // Se não conseguiu intersecção, tentar colocar em posição livre com mais espaçamento
    if (!placed) {
      for (let attempts = 0; attempts < 100 && !placed; attempts++) {
        const direction = Math.random() < 0.5 ? 'across' : 'down';
        const maxRow = size - (direction === 'down' ? currentWord.word.length : 0);
        const maxCol = size - (direction === 'across' ? currentWord.word.length : 0);
        
        // Tentar posições mais espalhadas
        const row = Math.floor(Math.random() * maxRow);
        const col = Math.floor(Math.random() * maxCol);
        
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
