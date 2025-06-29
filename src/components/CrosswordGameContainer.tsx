
import { useCrosswordGameState } from '@/hooks/useCrosswordGameState';
import { useCrosswordGameInteractions } from '@/hooks/useCrosswordGameInteractions';
import { CrosswordHeader } from './CrosswordHeader';
import { CrosswordGrid } from './CrosswordGrid';
import { CrosswordClues } from './CrosswordClues';

export const CrosswordGameContainer = () => {
  const {
    puzzle,
    setPuzzle,
    selectedCell,
    setSelectedCell,
    selectedDirection,
    setSelectedDirection,
    isCompleted,
    setIsCompleted,
    completedWords,
    setCompletedWords,
    hasGameStarted,
    setHasGameStarted,
    generateNewPuzzle,
    countCompletedWords,
    getTotalWords,
    checkWordCompletion
  } = useCrosswordGameState();

  const { handleCellClick, handleInputChange, handleKeyDown } = useCrosswordGameInteractions({
    puzzle,
    setPuzzle,
    selectedCell,
    setSelectedCell,
    selectedDirection,
    setSelectedDirection,
    hasGameStarted,
    setHasGameStarted,
    setCompletedWords,
    setIsCompleted,
    isCompleted,
    checkWordCompletion
  });

  const handleVirtualKeyPress = (key: string) => {
    if (!selectedCell || !puzzle) return;
    
    const { row, col } = selectedCell;
    handleInputChange(row, col, key);
  };

  const handleVirtualDelete = () => {
    if (!selectedCell || !puzzle) return;
    
    const { row, col } = selectedCell;
    handleInputChange(row, col, '');
  };

  if (!puzzle) {
    return <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 bg-gray-100 dark:text-white text-gray-900">Carregando...</div>;
  }

  const completedWordsCount = countCompletedWords(puzzle);
  const totalWords = getTotalWords();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-white">
      <CrosswordHeader completedWords={completedWordsCount} totalWords={totalWords} />

      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <CrosswordGrid 
            puzzle={puzzle}
            selectedCell={selectedCell}
            isCompleted={isCompleted}
            onCellClick={handleCellClick}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onNewGame={generateNewPuzzle}
            onVirtualKeyPress={handleVirtualKeyPress}
            onVirtualDelete={handleVirtualDelete}
          />

          <CrosswordClues puzzle={puzzle} />
        </div>
      </div>
    </div>
  );
};
