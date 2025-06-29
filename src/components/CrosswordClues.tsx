
import { CrosswordPuzzle } from '@/types/crossword';

interface CrosswordCluesProps {
  puzzle: CrosswordPuzzle;
}

export const CrosswordClues = ({ puzzle }: CrosswordCluesProps) => {
  return (
    <div className="lg:w-80">
      <div className="bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 border border-white/20 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4">Definições</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 text-blue-300 dark:text-blue-400">Horizontais</h3>
            <div className="space-y-2">
              {puzzle.clues.across.map((clue) => (
                <div key={`across-${clue.number}`} className="text-sm">
                  <span className="font-bold">{clue.number}.</span> {clue.clue} ({clue.length} letras)
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 text-green-300 dark:text-green-400">Verticais</h3>
            <div className="space-y-2">
              {puzzle.clues.down.map((clue) => (
                <div key={`down-${clue.number}`} className="text-sm">
                  <span className="font-bold">{clue.number}.</span> {clue.clue} ({clue.length} letras)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
