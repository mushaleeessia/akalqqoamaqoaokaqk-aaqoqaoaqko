
import { useState } from "react";
import { Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameState } from "./TermoGame";
import { MultiModeGameState } from "./MultiModeTermoGame";
import { GameMode } from "./GameModeSelector";
import { toast } from "@/hooks/use-toast";

interface TermoGameOverProps {
  gameState: GameState | MultiModeGameState;
  targetWord: string;
  isDarkMode: boolean;
  onPlayAgain: () => void;
  mode?: GameMode;
  allTargetWords?: string[];
}

export const TermoGameOver = ({ 
  gameState, 
  targetWord, 
  isDarkMode, 
  onPlayAgain,
  mode = 'solo',
  allTargetWords = [targetWord]
}: TermoGameOverProps) => {
  const [isSharing, setIsSharing] = useState(false);
  
  const isWin = gameState.gameStatus === 'won';
  const attempts = gameState.guesses.length;
  
  const getModeEmoji = (gameMode: GameMode) => {
    switch (gameMode) {
      case 'solo': return '🎯';
      case 'duo': return '👥';
      case 'trio': return '👨‍👩‍👧';
      case 'quarteto': return '👨‍👩‍👧‍👦';
      default: return '🎯';
    }
  };

  const getModeLabel = (gameMode: GameMode) => {
    switch (gameMode) {
      case 'solo': return 'Solo';
      case 'duo': return 'Duo';
      case 'trio': return 'Trio';
      case 'quarteto': return 'Quarteto';
      default: return 'Solo';
    }
  };

  const generateShareText = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const modeEmoji = getModeEmoji(mode);
    const modeLabel = getModeLabel(mode);
    
    let shareText = `Termo ${modeLabel} ${modeEmoji} ${today}\n`;
    
    if (isWin) {
      shareText += `✅ ${attempts}/6\n\n`;
    } else {
      shareText += `❌ X/6\n\n`;
    }

    // Para cada palavra no modo multi-palavra
    if (mode !== 'solo' && allTargetWords.length > 1) {
      shareText += `Palavras: ${allTargetWords.map(w => w.toUpperCase()).join(', ')}\n\n`;
    } else {
      shareText += `Palavra: ${targetWord.toUpperCase()}\n\n`;
    }

    gameState.guesses.forEach((guess, index) => {
      allTargetWords.forEach((word, wordIndex) => {
        if (wordIndex === 0) {
          const evaluation = evaluateGuess(guess, word);
          shareText += evaluation.map(state => {
            switch (state) {
              case 'correct': return '🟩';
              case 'present': return '🟨';
              default: return '⬛';
            }
          }).join('');
          if (allTargetWords.length === 1) shareText += '\n';
        }
      });
      if (allTargetWords.length > 1) shareText += '\n';
    });

    shareText += '\naleeessia.com/termo';
    return shareText;
  };

  const evaluateGuess = (guess: string, word: string) => {
    const result = [];
    const targetArray = word.toLowerCase().split('');
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
    setIsSharing(true);
    const shareText = generateShareText();
    
    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copiado!",
          description: "Resultado copiado para a área de transferência",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o resultado",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {isWin ? '🎉' : '😢'}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {isWin ? 'Parabéns!' : 'Que pena!'}
        </h2>
        <p className="text-white/80 text-lg mb-4">
          {isWin 
            ? `Você acertou em ${attempts} tentativa${attempts !== 1 ? 's' : ''}!`
            : 'Suas tentativas acabaram!'
          }
        </p>
        
        <div className="text-white/70 text-sm mb-6">
          <p className="mb-2">
            <strong>Modo:</strong> {getModeLabel(mode)} {getModeEmoji(mode)}
          </p>
          {mode !== 'solo' ? (
            <div>
              <strong>Palavras:</strong>
              <div className="flex flex-wrap justify-center gap-2 mt-1">
                {allTargetWords.map((word, index) => (
                  <span key={index} className="bg-white/20 px-2 py-1 rounded text-white font-mono">
                    {word.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p>
              <strong>Palavra:</strong> 
              <span className="bg-white/20 px-2 py-1 rounded ml-2 text-white font-mono">
                {targetWord.toUpperCase()}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className={`flex items-center space-x-2 ${
            isDarkMode 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          <Share2 className="w-4 h-4" />
          <span>{isSharing ? 'Compartilhando...' : 'Compartilhar'}</span>
        </Button>
        
        <Button
          onClick={onPlayAgain}
          variant="outline"
          className="flex items-center space-x-2 bg-white/10 border-white/30 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Jogar Novamente</span>
        </Button>
      </div>

      <p className="text-white/50 text-sm text-center">
        Uma nova palavra estará disponível amanhã!
      </p>
    </div>
  );
};
