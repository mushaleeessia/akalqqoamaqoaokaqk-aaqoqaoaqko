
import { PlacedWord, IntersectionPosition } from '@/types/crosswordGenerator';

export const findIntersections = (
  word: string,
  placedWord: PlacedWord,
  size: number
): IntersectionPosition[] => {
  const intersections: IntersectionPosition[] = [];
  const upperWord = word.toUpperCase();
  const upperPlacedWord = placedWord.word.toUpperCase();
  
  // Encontrar todas as letras em comum
  for (let i = 0; i < upperWord.length; i++) {
    for (let j = 0; j < upperPlacedWord.length; j++) {
      if (upperWord[i] === upperPlacedWord[j]) {
        let newRow: number, newCol: number, newDirection: 'across' | 'down';
        
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
        
        // Verificar se a posição é válida dentro dos limites
        if (newRow >= 0 && newCol >= 0) {
          if (newDirection === 'across' && newCol + upperWord.length <= size) {
            intersections.push({ row: newRow, col: newCol, direction: newDirection });
          } else if (newDirection === 'down' && newRow + upperWord.length <= size) {
            intersections.push({ row: newRow, col: newCol, direction: newDirection });
          }
        }
      }
    }
  }
  
  return intersections;
};

// Função auxiliar para encontrar posições de intersecção (mantida para compatibilidade)
export const findIntersectionPositions = (
  word: string,
  placedWords: PlacedWord[],
  grid: any
): IntersectionPosition[] => {
  const allIntersections: IntersectionPosition[] = [];
  
  for (const placedWord of placedWords) {
    const intersections = findIntersections(word, placedWord, grid.length);
    allIntersections.push(...intersections);
  }
  
  return allIntersections;
};
