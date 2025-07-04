import { useState, useEffect } from "react";
import { TermoGameLogic } from "./TermoGameLogic";
import { GameOverDisplay } from "./GameOverDisplay";
import { Button } from "@/components/ui/button";
import { useInfinityMode } from "@/hooks/useInfinityMode";
import { GameState } from "./TermoGame";
import { useSupabaseGameSession } from "@/hooks/useSupabaseGameSession";

interface InfinityTermoGameProps {
  isDarkMode: boolean;
}

export const InfinityTermoGame = ({ isDarkMode }: InfinityTermoGameProps) => {
  const { currentWord, loading, generateRandomWord, getCurrentWord, clearInfinityData } = useInfinityMode();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showingGameOver, setShowingGameOver] = useState(false);
  const [showingNewGameCountdown, setShowingNewGameCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const { saveGameSession } = useSupabaseGameSession('infinity', [currentWord]);

  useEffect(() => {
    if (!currentWord) {
      getCurrentWord();
    }
  }, [currentWord, getCurrentWord]);

  useEffect(() => {
    if (showingNewGameCountdown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showingNewGameCountdown && countdown === 0) {
      startNewGame();
    }
  }, [showingNewGameCountdown, countdown]);

  const handleGameComplete = (finalGameState: GameState) => {
    setGameState(finalGameState);
    setShowingGameOver(true);
    
    // Salvar sessão no Supabase
    if (currentWord) {
      saveGameSession(finalGameState.guesses, finalGameState.gameStatus === 'won');
    }
  };

  const handlePlayAgain = () => {
    setShowingGameOver(false);
    setShowingNewGameCountdown(true);
    setCountdown(5);
  };

  const startNewGame = async () => {
    clearInfinityData();
    await generateRandomWord();
    setGameState(null);
    setShowingGameOver(false);
    setShowingNewGameCountdown(false);
    setCountdown(5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-xl">Gerando nova palavra...</div>
      </div>
    );
  }

  if (showingNewGameCountdown) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">♾️ Próxima Palavra</h2>
          <p className="text-white/80 mb-4">
            Nova palavra chegando em...
          </p>
          <div className="text-6xl font-bold text-purple-400 mb-4">
            {countdown}
          </div>
          <p className="text-white/60 text-sm">
            Prepare-se para o próximo desafio!
          </p>
        </div>
      </div>
    );
  }

  if (showingGameOver && gameState) {
    return (
      <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <GameOverDisplay 
          isWin={gameState.gameStatus === 'won'}
          attempts={gameState.guesses.length}
          mode="infinity"
        />

        <div className="text-center">
          <p className="text-white/80 mb-4">
            A palavra era: <span className="font-bold text-purple-400">{currentWord?.toUpperCase()}</span>
          </p>
        </div>

        <Button
          onClick={handlePlayAgain}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          ♾️ Jogar Novamente
        </Button>

        <p className="text-white/50 text-sm text-center">
          Modo Infinity - Jogue quantas vezes quiser!
        </p>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-xl">Carregando palavra...</div>
      </div>
    );
  }

  return (
    <TermoGameLogic 
      targetWord={currentWord} 
      isDarkMode={isDarkMode}
      onGameComplete={handleGameComplete}
      isInfinityMode={true}
    />
  );
};