
import { useState, useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameState } from "./TermoGame";
import { MultiModeGameState } from "@/hooks/useMultiModeGameState";
import { GameMode } from "./GameModeSelector";
import { toast } from "@/hooks/use-toast";

interface TermoGameOverProps {
  gameState: GameState | MultiModeGameState;
  targetWord: string;
  isDarkMode: boolean;
  mode?: GameMode;
  allTargetWords?: string[];
}

export const TermoGameOver = ({ 
  gameState, 
  targetWord, 
  isDarkMode, 
  mode = 'solo',
  allTargetWords = [targetWord]
}: TermoGameOverProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showSecretWords, setShowSecretWords] = useState(false);
  
  const isWin = gameState.gameStatus === 'won';
  const attempts = gameState.guesses.length;

  // Listener para a combinação de teclas CTRL+SHIFT+ALT+S+O
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.altKey && 
          event.key.toLowerCase() === 's') {
        // Aguardar a próxima tecla 'O'
        const handleNextKey = (nextEvent: KeyboardEvent) => {
          if (nextEvent.key.toLowerCase() === 'o') {
            setShowSecretWords(true);
            toast({
              title: "Palavras reveladas!",
              description: "As palavras secretas estão sendo exibidas.",
            });
          }
          window.removeEventListener('keydown', handleNextKey);
        };
        
        // Adicionar listener temporário para a tecla 'O'
        setTimeout(() => {
          window.addEventListener('keydown', handleNextKey);
          // Remover o listener após 2 segundos se não pressionado
          setTimeout(() => {
            window.removeEventListener('keydown', handleNextKey);
          }, 2000);
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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

    // Gerar os quadrados para cada tentativa
    gameState.guesses.forEach((guess) => {
      if (mode === 'solo') {
        const evaluation = evaluateGuess(guess, allTargetWords[0]);
        shareText += evaluation.map(state => {
          switch (state) {
            case 'correct': return '🟩';
            case 'present': return '🟨';
            default: return '⬛';
          }
        }).join('');
        shareText += '\n';
      } else {
        // Para modos multi-palavra, mostrar uma linha por palavra
        allTargetWords.forEach((word, wordIndex) => {
          const evaluation = evaluateGuess(guess, word);
          shareText += evaluation.map(state => {
            switch (state) {
              case 'correct': return '🟩';
              case 'present': return '🟨';
              default: return '⬛';
            }
          }).join('');
          if (wordIndex < allTargetWords.length - 1) shareText += ' ';
        });
        shareText += '\n';
      }
    });

    shareText += '\naleeessia.com/termo';
    return shareText;
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
      console.error('Share error:', error);
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copiado!",
          description: "Resultado copiado para a área de transferência",
        });
      } catch (clipboardError) {
        toast({
          title: "Erro",
          description: "Não foi possível compartilhar o resultado",
          variant: "destructive"
        });
      }
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
        </div>

        {showSecretWords && (
          <div className="bg-white/20 p-4 rounded-lg mb-4">
            <h3 className="text-white font-bold mb-2">Palavras do dia:</h3>
            <div className="text-white/90 space-y-1">
              {allTargetWords.map((word, index) => (
                <p key={index} className="font-mono text-lg">
                  {word.toUpperCase()}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
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
      </div>

      <p className="text-white/50 text-sm text-center">
        Uma nova palavra estará disponível amanhã!
      </p>
    </div>
  );
};
