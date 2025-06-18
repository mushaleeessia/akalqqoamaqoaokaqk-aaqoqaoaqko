
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
    <div className="flex-1">
      <h3 className={cn(
        "text-lg font-bold mb-3",
        isDarkMode ? "text-white" : "text-gray-900"
      )}>
        {title}
      </h3>
      <div className="space-y-2">
        {words.map(word => {
          const isSelected = selectedWord?.id === word.id;
          const isCompleted = completedWords.has(word.id);
          
          return (
            <div
              key={word.id}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-200",
                isDarkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-50",
                isSelected && "ring-2 ring-yellow-400",
                isCompleted && (isDarkMode ? "bg-green-800" : "bg-green-100"),
                "border border-white/20"
              )}
              onClick={() => onClueClick(word.id)}
            >
              <div className="flex items-start gap-3">
                <span className={cn(
                  "text-sm font-bold min-w-[24px]",
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                )}>
                  {word.number}
                </span>
                <span className={cn(
                  "text-sm flex-1",
                  isDarkMode ? "text-gray-300" : "text-gray-700",
                  isCompleted && (isDarkMode ? "text-green-200" : "text-green-800")
                )}>
                  {word.clue}
                </span>
                {isCompleted && (
                  <span className="text-xs text-green-500 font-bold">✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderCluesList(horizontalWords, "Horizontais")}
      {renderCluesList(verticalWords, "Verticais")}
    </div>
  );
};
