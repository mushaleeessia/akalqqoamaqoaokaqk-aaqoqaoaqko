import { GameState } from "./TermoGame";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface TermoGameOverProps {
  gameState: GameState;
  targetWord: string;
  isDarkMode: boolean;
  onPlayAgain: () => void;
}

export const TermoGameOver = ({ 
  gameState, 
  targetWord, 
  isDarkMode, 
  onPlayAgain 
}: TermoGameOverProps) => {
  
  const [timeToNext, setTimeToNext] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      // Ajustar para horário de Brasília (UTC-3)
      const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      
      const tomorrow = new Date(brasiliaTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // Calcular diferença considerando o fuso horário
      const tomorrowUTC = new Date(tomorrow.getTime() + (3 * 60 * 60 * 1000));
      const diff = tomorrowUTC.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeToNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const generateShareText = (): string => {
    const date = new Date().toLocaleDateString('pt-BR');
    const attempts = gameState.gameStatus === 'won' ? gameState.guesses.length : 'X';
    
    let shareText = `Teeermo ${date} ${attempts}/6\n\n`;
    
    gameState.guesses.forEach(guess => {
      const evaluation = evaluateGuess(guess);
      const emojis = evaluation.map(state => {
        switch (state) {
          case 'correct': return '🟩';
          case 'present': return '🟨';
          case 'absent': return '⬛';
          default: return '⬛';
        }
      }).join('');
      shareText += emojis + '\n';
    });
    
    shareText += '\naleeessia.com (veja também term.ooo!)';
    return shareText;
  };

  const evaluateGuess = (guess: string) => {
    const result = [];
    const targetArray = targetWord.toLowerCase().split('');
    const guessArray = guess.toLowerCase().split('');
    
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === targetArray[i]) {
        result[i] = 'correct';
        targetArray[i] = '#';
      } else {
        result[i] = 'absent';
      }
    }
    
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'absent') {
        const letterIndex = targetArray.indexOf(guessArray[i]);
        if (letterIndex !== -1) {
          result[i] = 'present';
          targetArray[letterIndex] = '#';
        }
      }
    }
    
    return result;
  };

  const handleShare = async () => {
    const shareText = generateShareText();
    
    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Resultado copiado!",
        description: "Cole onde quiser compartilhar"
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o resultado",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-6 p-8 rounded-xl ${
      isDarkMode ? 'bg-gray-800/90' : 'bg-white/10'
    } backdrop-blur-sm border border-white/20 max-w-sm mx-auto`}>
      
      {/* Título de progresso */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white/90 mb-4">
          progresso
        </h2>
      </div>

      {/* Resultado do jogo */}
      <div className="text-center">
        <p className="text-white/80 text-lg mb-2">
          {gameState.gameStatus === 'won' 
            ? `Você acertou!`
            : `A palavra era: ${targetWord.toUpperCase()}`
          }
        </p>
      </div>

      {/* Distribuição de tentativas */}
      <div className="w-full">
        <h3 className="text-white/90 text-sm font-medium mb-3 text-center">
          distribuição de tentativas
        </h3>
        
        <div className="space-y-1">
          {[1, 2, 3, 4, 5, 6].map(attempt => {
            const isCurrentAttempt = gameState.gameStatus === 'won' && gameState.guesses.length === attempt;
            
            return (
              <div key={attempt} className="flex items-center space-x-2">
                <span className="text-white/80 text-sm w-4">{attempt}</span>
                <div className="flex-1 bg-gray-600/50 rounded h-6 relative overflow-hidden">
                  {isCurrentAttempt && (
                    <div className="absolute inset-0 bg-green-500 rounded flex items-center justify-end pr-2">
                      <span className="text-white text-xs font-medium">1</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Próxima palavra */}
      <div className="text-center">
        <p className="text-white/70 text-sm mb-2">
          próxima palavra em (horário de Brasília)
        </p>
        <p className="text-white font-mono text-2xl font-bold">
          {timeToNext}
        </p>
      </div>

      {/* Botão de compartilhar */}
      <Button 
        onClick={handleShare}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 text-lg font-medium"
      >
        <Share2 className="w-5 h-5 mr-2" />
        compartilhe
      </Button>
    </div>
  );
};
