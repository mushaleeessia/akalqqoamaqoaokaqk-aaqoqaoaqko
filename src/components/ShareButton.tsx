
import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { GameMode } from "./GameModeSelector";
import { GameState } from "./TermoGame";
import { MultiModeGameState } from "@/hooks/useMultiModeGameState";
import { generateShareText } from "@/utils/shareUtils";

interface ShareButtonProps {
  gameState: GameState | MultiModeGameState;
  mode: GameMode;
  isWin: boolean;
  attempts: number;
  allTargetWords: string[];
  isDarkMode: boolean;
}

export const ShareButton = ({ 
  gameState, 
  mode, 
  isWin, 
  attempts, 
  allTargetWords, 
  isDarkMode 
}: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    const shareText = generateShareText(gameState, mode, isWin, attempts, allTargetWords);
    
    try {
      // SEMPRE copiar para clipboard, nunca usar navigator.share
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado!",
        description: "Resultado copiado para a área de transferência",
      });
    } catch (error) {
      console.error('Clipboard error:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o resultado",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
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
      <span>{isSharing ? 'Copiando...' : 'Copiar Resultado'}</span>
    </Button>
  );
};
