
import { CrosswordPuzzle } from '@/types/crossword';
import { updateCellCorrectness, checkCompletion } from '@/utils/crosswordCellUtils';

interface UseCrosswordInputHandlingProps {
  puzzle: CrosswordPuzzle | null;
  setPuzzle: (puzzle: CrosswordPuzzle) => void;
  selectedCell: { row: number; col: number } | null;
  selectedDirection: 'across' | 'down';
  hasGameStarted: boolean;
  setHasGameStarted: (started: boolean) => void;
  setCompletedWords: (words: Set<string>) => void;
  setIsCompleted: (completed: boolean) => void;
  isCompleted: boolean;
  checkWordCompletion: (puzzle: CrosswordPuzzle) => Set<string>;
  moveToNextCell: (row: number, col: number, direction: 'across' | 'down') => void;
  moveToPreviousCell: (row: number, col: number, direction: 'across' | 'down') => { row: number; col: number } | undefined;
  setSelectedCell: (cell: { row: number; col: number } | null) => void;
}

export const useCrosswordInputHandling = ({
  puzzle,
  setPuzzle,
  selectedCell,
  selectedDirection,
  hasGameStarted,
  setHasGameStarted,
  setCompletedWords,
  setIsCompleted,
  isCompleted,
  checkWordCompletion,
  moveToNextCell,
  moveToPreviousCell,
  setSelectedCell
}: UseCrosswordInputHandlingProps) => {

  const handleKeyDown = (row: number, col: number, event: React.KeyboardEvent) => {
    console.log(`KeyDown event: ${event.key} at (${row}, ${col})`);
    
    if (event.key === 'Backspace') {
      event.preventDefault();
      console.log('Backspace pressed!');
      
      if (!puzzle || !selectedCell) {
        console.log('No puzzle or selected cell');
        return;
      }
      
      const currentCell = puzzle.grid[row][col];
      console.log(`Current cell content: "${currentCell.userInput}"`);
      
      // Se a célula atual tem conteúdo, apaga e fica na mesma célula
      if (currentCell.userInput.trim() !== '') {
        console.log(`Clearing current cell (${row}, ${col})`);
        handleInputChange(row, col, '');
      } else {
        // Se a célula atual está vazia, move para a anterior e apaga
        console.log(`Current cell is empty, moving to previous cell`);
        const prevCellInfo = moveToPreviousCell(row, col, selectedDirection);
        
        if (prevCellInfo) {
          console.log(`Moving to previous cell (${prevCellInfo.row}, ${prevCellInfo.col}) and clearing it`);
          
          // Limpar a célula anterior primeiro
          const newGrid = [...puzzle.grid];
          newGrid[prevCellInfo.row][prevCellInfo.col] = { 
            ...newGrid[prevCellInfo.row][prevCellInfo.col], 
            userInput: '' 
          };
          
          let newPuzzle = { ...puzzle, grid: newGrid };
          
          // Verificar palavras completadas
          const completed = checkWordCompletion(newPuzzle);
          setCompletedWords(completed);
          
          // Atualizar células com estado de correção
          newPuzzle = updateCellCorrectness(newPuzzle, completed);
          
          setPuzzle(newPuzzle);
          
          // Verificar se o jogo ainda está completo
          const allCellsCorrect = checkCompletion(newPuzzle);
          if (!allCellsCorrect && isCompleted) {
            setIsCompleted(false);
          }
          
          // Mover para a célula anterior
          setSelectedCell({ row: prevCellInfo.row, col: prevCellInfo.col });
          
          // Focar no input anterior automaticamente
          setTimeout(() => {
            const prevInput = document.querySelector(`input[data-cell="${prevCellInfo.row}-${prevCellInfo.col}"]`) as HTMLInputElement;
            if (prevInput) {
              prevInput.focus();
              console.log(`Focused on previous input at (${prevCellInfo.row}, ${prevCellInfo.col})`);
            } else {
              console.log(`Could not find input for cell (${prevCellInfo.row}, ${prevCellInfo.col})`);
            }
          }, 50);
        }
      }
    }
  };

  const handleInputChange = (row: number, col: number, value: string) => {
    if (!puzzle) return;
    
    console.log(`Input change at (${row}, ${col}): "${value}"`);
    
    // Mark game as started when first input is made
    if (!hasGameStarted && value.trim() !== '') {
      setHasGameStarted(true);
      localStorage.setItem('crossword_game_started', 'true');
    }
    
    const newGrid = [...puzzle.grid];
    newGrid[row][col] = { ...newGrid[row][col], userInput: value.toUpperCase() };
    
    let newPuzzle = { ...puzzle, grid: newGrid };
    
    // Verificar palavras completadas
    const completed = checkWordCompletion(newPuzzle);
    setCompletedWords(completed);
    
    // Atualizar células com estado de correção
    newPuzzle = updateCellCorrectness(newPuzzle, completed);
    
    setPuzzle(newPuzzle);
    
    const allCellsCorrect = checkCompletion(newPuzzle);
    if (allCellsCorrect && !isCompleted) {
      setIsCompleted(true);
    }
    
    // Mover para a próxima célula se uma letra foi digitada
    if (value.trim() !== '' && selectedCell && value.length === 1) {
      console.log(`Attempting to move from selected cell: (${selectedCell.row}, ${selectedCell.col}) in direction: ${selectedDirection}`);
      moveToNextCell(selectedCell.row, selectedCell.col, selectedDirection);
    }
  };

  return {
    handleKeyDown,
    handleInputChange
  };
};
