
import { useEffect } from 'react';
import { GameState } from '@/components/TermoGame';
import { MultiModeGameState } from '@/hooks/useMultiModeGameState';
import { GameMode } from '@/components/GameModeSelector';
import { generateShareText } from '@/utils/shareUtils';
import { sendGameResultToDiscord } from '@/utils/discordWebhook';

interface UseDiscordNotificationProps {
  gameState: GameState | MultiModeGameState;
  mode: GameMode;
  allTargetWords: string[];
  playerIP?: string;
}

export const useDiscordNotification = ({ 
  gameState, 
  mode, 
  allTargetWords, 
  playerIP 
}: UseDiscordNotificationProps) => {
  useEffect(() => {
    // Só enviar quando o jogo terminar (won ou lost) E não estiver mais jogando
    if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && 
        playerIP && 
        gameState.guesses.length > 0) {
      
      const isWin = gameState.gameStatus === 'won';
      const attempts = gameState.guesses.length;
      
      const shareText = generateShareText(gameState, mode, isWin, attempts, allTargetWords);
      
      console.log('Enviando resultado para Discord:', { 
        gameStatus: gameState.gameStatus, 
        attempts, 
        mode 
      });
      
      // Enviar para Discord automaticamente
      sendGameResultToDiscord(shareText, playerIP);
    }
  }, [gameState.gameStatus, gameState.guesses.length, mode, allTargetWords, playerIP]);
};
