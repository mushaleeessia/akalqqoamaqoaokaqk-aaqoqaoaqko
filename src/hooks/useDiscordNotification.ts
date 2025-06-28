
import { useEffect } from 'react';
import { GameState } from '@/hooks/useTermoGameState';
import { MultiModeGameState } from '@/hooks/useMultiModeGameState';
import { GameMode } from '@/components/GameModeSelector';
import { sendToDiscord } from '@/utils/discordWebhook';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const useDiscordNotification = (
  gameState: GameState | MultiModeGameState,
  shareText: string,
  mode: GameMode
) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();

  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
      if (shareText && shareText.trim() !== '') {
        const nickname = isGuestMode ? 'Convidado' : (user?.user_metadata?.nickname || 'Usuário');
        
        sendToDiscord(shareText, nickname, mode).catch(error => {
          // Silently handle errors - no need to log
        });
      }
    }
  }, [gameState.gameStatus, shareText, mode, user, isGuestMode]);
};
