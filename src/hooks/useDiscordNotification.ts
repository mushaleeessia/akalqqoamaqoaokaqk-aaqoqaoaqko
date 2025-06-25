
import { useEffect, useState } from 'react';
import { sendGameResultToDiscord, GameState } from '@/utils/discordWebhook';

export const useDiscordNotification = () => {
  const [userIP, setUserIP] = useState<string>('');

  useEffect(() => {
    const getUserIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        setUserIP('Unknown');
      }
    };

    getUserIP();
  }, []);

  const sendNotification = async (shareText: string, gameState: GameState) => {
    if (userIP) {
      await sendGameResultToDiscord(shareText, userIP, gameState);
    }
  };

  return { sendNotification };
};
