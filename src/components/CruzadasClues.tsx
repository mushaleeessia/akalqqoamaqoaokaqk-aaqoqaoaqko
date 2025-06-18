
import { CruzadasPuzzle } from '@/hooks/useCruzadasData';
import { GameProgress } from '@/hooks/useCruzadasGameState';
import { cn } from '@/lib/utils';

interface CruzadasCluesProps {
  puzzle: CruzadasPuzzle;
  gameProgress: GameProgress;
  onClueClick: (wordId: number) => void;
  isDarkMode: boolean;
}

export const CruzadasClues = ({ puzzle, gameProgress, onClueClick, isDarkMode }: CruzadasCluesProps) => {
  const { selectedWord, completedWords } = gameProgress;

  const horizontalWords = puzzle.words.filter(w => w.direction === 'horizontal').sort((a, b) => a.number - b.number);
  const verticalWords = puzzle.words.filter(w => w.direction === 'vertical').sort((a, b) => a.number - b.number);

  const renderCluesList = (words: typeof horizontalWords, title: string) => (
    <div className="flex-1 space-y-3">
      <h3 className={cn(
        "text-xl font-bold pb-2 border-b-2",
        isDarkMode ? "text-white border-gray-600" : "text-gray-900 border-gray-300"
      )}>
        {title}
      </h3>
      <div className="space-y-1">
        {words.map(word => {
          const isSelected = selectedWord?.id === word.id;
          const isCompleted = completedWords.has(word.id);
          
          return (
            <div
              key={word.id}
              className={cn(
                "flex items-start gap-3 p-2 rounded cursor-pointer transition-all duration-200 hover:shadow-sm",
                isDarkMode 
                  ? "hover:bg-gray-700/50" 
                  : "hover:bg-gray-50",
                isSelected && (isDarkMode ? "bg-blue-800/50 ring-1 ring-blue-400" : "bg-blue-50 ring-1 ring-blue-300"),
                isCompleted && (isDarkMode ? "bg-green-800/30" : "bg-green-50")
              )}
              onClick={() => onClueClick(word.id)}
            >
              <span className={cn(
                "text-sm font-bold min-w-[20px] text-center",
                isDarkMode ? "text-blue-300" : "text-blue-700"
              )}>
                {word.number}
              </span>
              <span className={cn(
                "text-sm flex-1 leading-relaxed",
                isDarkMode ? "text-gray-200" : "text-gray-800",
                isCompleted && (isDarkMode ? "text-green-300" : "text-green-700")
              )}>
                {word.clue}
              </span>
              {isCompleted && (
                <span className="text-green-500 text-sm font-bold">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "grid md:grid-cols-2 gap-8 p-6 rounded-lg border",
      isDarkMode 
        ? "bg-gray-800/50 border-gray-600" 
        : "bg-white/80 border-gray-200 shadow-sm"
    )}>
      {renderCluesList(horizontalWords, "Horizontais")}
      {renderCluesList(verticalWords, "Verticais")}
    </div>
  );
};
