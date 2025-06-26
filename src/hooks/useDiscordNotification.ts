
import { useEffect } from 'react';
import { sendGameResultToDiscord, GameState } from '@/utils/discordWebhook';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const useDiscordNotification = (gameState?: { gameStatus: string }, shareText?: string) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();

  // Enviar automaticamente quando o jogo termina
  useEffect(() => {
    if (gameState && shareText && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost')) {
      const isGuest = !user || isGuestMode;
      sendGameResultToDiscord(shareText, isGuest, gameState.gameStatus as GameState);
    }
  }, [gameState?.gameStatus, shareText, user, isGuestMode]);

  const sendNotification = async (shareText: string, gameState: GameState) => {
    const isGuest = !user || isGuestMode;
    await sendGameResultToDiscord(shareText, isGuest, gameState);
  };

  return { sendNotification };
};
