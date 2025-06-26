
import { useEffect } from 'react';
import { sendGameResultToDiscord, GameState } from '@/utils/discordWebhook';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';

export const useDiscordNotification = () => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();

  const sendNotification = async (shareText: string, gameState: GameState) => {
    const isGuest = !user || isGuestMode;
    await sendGameResultToDiscord(shareText, isGuest, gameState);
  };

  return { sendNotification };
};
