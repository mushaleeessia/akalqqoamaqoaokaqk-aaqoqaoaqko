
import { useEffect } from 'react';
import { GameState } from '@/hooks/useTermoGameState';
import { MultiModeGameState } from '@/hooks/useMultiModeGameState';
import { GameMode } from '@/components/GameModeSelector';
import { sendGameResultToDiscord } from '@/utils/discordWebhook';
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
        const isGuest = isGuestMode;
        const gameStatus = gameState.gameStatus === 'won' ? 'win' : 'lose';
        
        const userInfo = !isGuest && user ? {
          nickname: user.user_metadata?.nickname,
          discordUsername: user.user_metadata?.discord_username,
          discordAvatar: user.user_metadata?.discord_avatar
        } : undefined;
        
        sendGameResultToDiscord(shareText, isGuest, gameStatus, userInfo).catch(error => {
          // Silently handle errors - no need to log
        });
      }
    }
  }, [gameState.gameStatus, shareText, mode, user, isGuestMode]);
};
