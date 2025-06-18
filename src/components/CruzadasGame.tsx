
import { useEffect } from 'react';
import { CruzadasPuzzle } from '@/hooks/useCruzadasData';
import { useCruzadasGameState } from '@/hooks/useCruzadasGameState';
import { CruzadasGrid } from './CruzadasGrid';
import { CruzadasClues } from './CruzadasClues';
import { CruzadasKeyboard } from './CruzadasKeyboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CruzadasGameProps {
  puzzle: CruzadasPuzzle;
  isDarkMode: boolean;
}

export const CruzadasGame = ({ puzzle, isDarkMode }: CruzadasGameProps) => {
  const { gameProgress, insertLetter, deleteLetter, selectCell } = useCruzadasGameState(puzzle);

  // Manipular input do teclado físico
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameProgress.gameCompleted) return;
      
      const key = event.key.toLowerCase();
      
      if (key === 'backspace') {
        event.preventDefault();
        deleteLetter();
      } else if (/^[a-záéíóúâêîôûãõç]$/.test(key)) {
        event.preventDefault();
        insertLetter(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameProgress.gameCompleted, insertLetter, deleteLetter]);

  // Selecionar palavra por clique na dica
  const handleClueClick = (wordId: number) => {
    const word = puzzle.words.find(w => w.id === wordId);
    if (word) {
      selectCell(word.startRow, word.startCol);
    }
  };

  if (gameProgress.gameCompleted) {
    return (
      <div className="text-center space-y-6">
        <div className={cn(
          "p-8 rounded-xl border-2",
          isDarkMode ? "bg-green-900/50 border-green-500 text-green-200" : "bg-green-100 border-green-500 text-green-800"
        )}>
          <h2 className="text-3xl font-bold mb-4">🎉 Parabéns!</h2>
          <p className="text-lg mb-4">Você completou as palavras cruzadas de hoje!</p>
          <p className="text-sm opacity-80">
            Volte amanhã para um novo desafio.
          </p>
        </div>
        
        <Button
          onClick={() => window.location.reload()}
          className={cn(
            "px-6 py-3 font-bold",
            isDarkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          Ver Solução Completa
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="text-center">
        <div className={cn(
          "inline-flex items-center gap-4 px-4 py-2 rounded-lg",
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        )}>
          <span className="text-sm">
            Palavras: {gameProgress.completedWords.size}/{puzzle.words.length}
          </span>
          <div className="w-px h-4 bg-gray-400"></div>
          <span className="text-sm">
            Progresso: {Math.round((gameProgress.completedWords.size / puzzle.words.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Grade */}
      <CruzadasGrid
        puzzle={puzzle}
        gameProgress={gameProgress}
        onCellClick={selectCell}
        isDarkMode={isDarkMode}
      />

      {/* Dicas */}
      <CruzadasClues
        puzzle={puzzle}
        gameProgress={gameProgress}
        onClueClick={handleClueClick}
        isDarkMode={isDarkMode}
      />

      {/* Teclado */}
      <div className="mt-8">
        <CruzadasKeyboard
          onKeyPress={insertLetter}
          onBackspace={deleteLetter}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
