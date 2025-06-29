
import { CrosswordPuzzle, CrosswordCell, CrosswordClue } from '@/types/crossword';

// Dados expandidos para uma palavra cruzada 20x20
const SAMPLE_CROSSWORD_DATA = {
  words: [
    // Palavras horizontais
    { word: 'BRASIL', clue: 'País onde ficam as Cataratas do Iguaçu', row: 1, col: 2, direction: 'across' as const },
    { word: 'CASA', clue: 'Local onde moramos', row: 3, col: 0, direction: 'across' as const },
    { word: 'TERRA', clue: 'Planeta onde vivemos', row: 5, col: 8, direction: 'across' as const },
    { word: 'SOL', clue: 'Estrela do nosso sistema solar', row: 7, col: 4, direction: 'across' as const },
    { word: 'FLOR', clue: 'Parte colorida da planta', row: 9, col: 1, direction: 'across' as const },
    { word: 'CARRO', clue: 'Veículo de quatro rodas', row: 11, col: 10, direction: 'across' as const },
    { word: 'MUSICA', clue: 'Arte dos sons organizados', row: 13, col: 5, direction: 'across' as const },
    { word: 'PAPEL', clue: 'Material feito de celulose', row: 15, col: 2, direction: 'across' as const },
    { word: 'ESCOLA', clue: 'Local de ensino', row: 17, col: 7, direction: 'across' as const },
    { word: 'TEMPO', clue: 'Duração dos acontecimentos', row: 19, col: 0, direction: 'across' as const },
    
    // Palavras verticais
    { word: 'AMOR', clue: 'Sentimento profundo de afeto', row: 1, col: 2, direction: 'down' as const },
    { word: 'AGUA', clue: 'Líquido essencial para a vida', row: 3, col: 3, direction: 'down' as const },
    { word: 'LIVRO', clue: 'Objeto usado para leitura', row: 0, col: 6, direction: 'down' as const },
    { word: 'VERDE', clue: 'Cor da natureza', row: 2, col: 12, direction: 'down' as const },
    { word: 'AMIGO', clue: 'Pessoa querida e próxima', row: 6, col: 1, direction: 'down' as const },
    { word: 'CIDADE', clue: 'Área urbana populated', row: 8, col: 14, direction: 'down' as const },
    { word: 'PONTE', clue: 'Estrutura que atravessa obstáculos', row: 4, col: 16, direction: 'down' as const },
    { word: 'JANELA', clue: 'Abertura na parede para luz', row: 10, col: 8, direction: 'down' as const },
    { word: 'MESA', clue: 'Móvel com tampo horizontal', row: 12, col: 18, direction: 'down' as const },
    { word: 'NOITE', clue: 'Período de escuridão', row: 15, col: 5, direction: 'down' as const }
  ]
};

export const generateCrosswordPuzzle = (): CrosswordPuzzle => {
  const size = 20;
  
  // Inicializar grade vazia
  const grid: CrosswordCell[][] = Array(size).fill(null).map(() =>
    Array(size).fill(null).map(() => ({
      letter: '',
      isBlocked: true, // Começar tudo bloqueado
      userInput: '',
      belongsToWords: {}
    }))
  );

  const clues: { across: CrosswordClue[]; down: CrosswordClue[] } = {
    across: [],
    down: []
  };

  let clueNumber = 1;
  const numberedCells = new Set<string>();

  // Processar cada palavra
  SAMPLE_CROSSWORD_DATA.words.forEach((wordData) => {
    const { word, clue, row, col, direction } = wordData;
    
    // Verificar se precisa numerar a célula inicial
    const cellKey = `${row}-${col}`;
    let number: number | undefined;
    
    if (!numberedCells.has(cellKey)) {
      number = clueNumber++;
      numberedCells.add(cellKey);
    } else {
      // Encontrar o número já atribuído
      for (const existingClue of [...clues.across, ...clues.down]) {
        if (existingClue.startRow === row && existingClue.startCol === col) {
          number = existingClue.number;
          break;
        }
      }
    }

    // Colocar as letras na grade
    for (let i = 0; i < word.length; i++) {
      const currentRow = direction === 'across' ? row : row + i;
      const currentCol = direction === 'across' ? col + i : col;
      
      if (currentRow < size && currentCol < size) {
        grid[currentRow][currentCol] = {
          letter: word[i],
          isBlocked: false,
          userInput: '',
          number: i === 0 ? number : undefined,
          belongsToWords: {
            ...grid[currentRow][currentCol].belongsToWords,
            [direction]: number
          }
        };
      }
    }

    // Adicionar pista
    const clueObj: CrosswordClue = {
      number: number!,
      clue,
      answer: word,
      startRow: row,
      startCol: col,
      direction,
      length: word.length
    };

    clues[direction].push(clueObj);
  });

  // Ordenar pistas por número
  clues.across.sort((a, b) => a.number - b.number);
  clues.down.sort((a, b) => a.number - b.number);

  return {
    grid,
    clues,
    size
  };
};
