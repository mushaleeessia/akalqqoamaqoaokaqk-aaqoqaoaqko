import { useState, useEffect } from "react";
import { TermoGameLogic } from "./TermoGameLogic";
import { GameOverDisplay } from "./GameOverDisplay";
import { WinstreakWidget } from "./WinstreakWidget";
import { HardModeOverlay } from "./HardModeOverlay";
import { Button } from "@/components/ui/button";
import { useInfinityMode } from "@/hooks/useInfinityMode";
import { useInfinityGameState } from "@/hooks/useInfinityGameState";
import { useHardModeEvent } from "@/hooks/useHardModeEvent";
import { useDiscordNotification } from "@/hooks/useDiscordNotification";
import { generateShareText } from "@/utils/shareUtils";
import { GameState } from "./TermoGame";

interface InfinityTermoGameProps {
  isDarkMode: boolean;
}

export const InfinityTermoGame = ({ isDarkMode }: InfinityTermoGameProps) => {
  const { currentWord, loading, generateRandomWord, getCurrentWord, clearInfinityData } = useInfinityMode();
  
  // Primeiro criar o game state com 6 tentativas para obter o winstreak
  const baseInfinityGameState = useInfinityGameState(currentWord, 6);
  const { isHardMode, isTriggering, incrementGames, resetHardMode } = useHardModeEvent(baseInfinityGameState.winstreak);
  const maxAttempts = isHardMode ? 4 : 6;
  
  // Se hard mode mudou o número de tentativas, usar o baseInfinityGameState mesmo
  const infinityGameState = baseInfinityGameState;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showingGameOver, setShowingGameOver] = useState(false);
  const [showingNewGameCountdown, setShowingNewGameCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Gerar texto de compartilhamento quando o jogo termina
  const shareText = (infinityGameState.gameState.gameStatus === 'won' || infinityGameState.gameState.gameStatus === 'lost') 
    ? generateShareText(
        infinityGameState.gameState, 
        'infinity', 
        infinityGameState.gameState.gameStatus === 'won',
        infinityGameState.gameState.currentRow,
        currentWord ? [currentWord] : []
      )
    : '';

  // Hook para enviar resultado automaticamente para Discord
  useDiscordNotification(infinityGameState.gameState, shareText, 'infinity');

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
    infinityGameState.updateWinstreak(finalGameState.gameStatus === 'won');
    incrementGames(); // Incrementar contador de jogos para hard mode event
    setShowingGameOver(true);
  };

  const handlePlayAgain = () => {
    setShowingGameOver(false);
    setShowingNewGameCountdown(true);
    setCountdown(3);
  };

  const startNewGame = async () => {
    clearInfinityData();
    infinityGameState.resetGame();
    resetHardMode(); // Reset hard mode for new game
    await generateRandomWord();
    setGameState(null);
    setShowingGameOver(false);
    setShowingNewGameCountdown(false);
    setCountdown(3);
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
    <>
      <HardModeOverlay isTriggering={isTriggering} />
      
      <WinstreakWidget 
        winstreak={infinityGameState.winstreak}
        currentAttempt={infinityGameState.gameState.currentRow}
        maxAttempts={maxAttempts}
        isGameActive={infinityGameState.gameState.gameStatus === 'playing'}
        isHardMode={isHardMode}
      />
      
      <TermoGameLogic 
        targetWord={currentWord} 
        isDarkMode={isDarkMode}
        onGameComplete={handleGameComplete}
        isInfinityMode={true}
        gameState={infinityGameState.gameState}
        keyStates={infinityGameState.keyStates}
        handleKeyPress={infinityGameState.handleKeyPress}
        isValidating={infinityGameState.isValidating}
        maxAttempts={maxAttempts}
        isHardMode={isHardMode}
        winstreak={infinityGameState.winstreak}
      />
    </>
  );
};