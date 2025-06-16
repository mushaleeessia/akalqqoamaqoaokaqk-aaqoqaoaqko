
import { GameState } from "./TermoGame";
import { Button } from "@/components/ui/button";
import { Share2, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu resultado no Teeermo',
          text: shareText
        });
      } catch (error) {
        // Fallback para copiar para clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Resultado copiado!",
          description: "Cole onde quiser compartilhar"
        });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Resultado copiado!",
        description: "Cole onde quiser compartilhar"
      });
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-6 p-8 rounded-xl ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-white/10'
    } backdrop-blur-sm border border-white/20`}>
      
      {/* Resultado */}
      <div className="text-center">
        <h2 className={`text-3xl font-bold mb-2 ${
          gameState.gameStatus === 'won' ? 'text-green-400' : 'text-red-400'
        }`}>
          {gameState.gameStatus === 'won' ? '🎉 Parabéns!' : '😔 Que pena!'}
        </h2>
        
        <p className="text-white/80 text-lg mb-4">
          {gameState.gameStatus === 'won' 
            ? `Você acertou em ${gameState.guesses.length} tentativa${gameState.guesses.length > 1 ? 's' : ''}!`
            : `A palavra era: ${targetWord.toUpperCase()}`
          }
        </p>
      </div>

      {/* Grid de resultado */}
      <div className="flex flex-col space-y-2">
        {gameState.guesses.map((guess, index) => {
          const evaluation = evaluateGuess(guess);
          return (
            <div key={index} className="flex space-x-1">
              {evaluation.map((state, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                    state === 'correct' ? 'bg-green-500' :
                    state === 'present' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}
                >
                  {state === 'correct' ? '🟩' : state === 'present' ? '🟨' : '⬛'}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Botões */}
      <div className="flex space-x-4">
        <Button 
          onClick={handleShare}
          className="bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
        
        <Button 
          onClick={onPlayAgain}
          className="bg-green-600 hover:bg-green-500 text-white"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Jogar Novamente
        </Button>
      </div>

      <p className="text-white/60 text-sm text-center">
        Uma nova palavra estará disponível amanhã!
      </p>
    </div>
  );
};
