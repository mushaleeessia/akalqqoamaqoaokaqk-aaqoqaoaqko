
import { useEffect } from 'react';
import { sendGameResultToDiscord, GameState } from '@/utils/discordWebhook';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { supabase } from '@/integrations/supabase/client';

export const useDiscordNotification = (gameState: { gameStatus: string }, shareText: string) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();

  // Enviar automaticamente quando o jogo termina
  useEffect(() => {
    if (gameState && shareText && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost')) {
      const isGuest = !user || isGuestMode;
      const discordGameState = gameState.gameStatus === 'won' ? 'win' : 'lose';
      
      const sendNotificationWithUserInfo = async () => {
        let userInfo = undefined;
        
        if (!isGuest && user) {
          try {
            // Buscar informações do perfil do usuário
            const { data: profile } = await supabase
              .from('profiles')
              .select('nickname')
              .eq('id', user.id)
              .single();

            // Extrair informações do Discord se disponíveis
            const discordUsername = user.user_metadata?.full_name || user.user_metadata?.name;
            const discordAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

            userInfo = {
              nickname: profile?.nickname,
              discordUsername: discordUsername,
              discordAvatar: discordAvatar
            };
          } catch (error) {
            // Se falhar, continuar sem as informações do usuário
          }
        }

        await sendGameResultToDiscord(shareText, isGuest, discordGameState as GameState, userInfo);
      };

      sendNotificationWithUserInfo();
    }
  }, [gameState?.gameStatus, shareText, user, isGuestMode]);

  const sendNotification = async (shareText: string, gameState: GameState) => {
    const isGuest = !user || isGuestMode;
    
    let userInfo = undefined;
    if (!isGuest && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();

        const discordUsername = user.user_metadata?.full_name || user.user_metadata?.name;
        const discordAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;

        userInfo = {
          nickname: profile?.nickname,
          discordUsername: discordUsername,
          discordAvatar: discordAvatar
        };
      } catch (error) {
        // Se falhar, continuar sem as informações do usuário
      }
    }

    await sendGameResultToDiscord(shareText, isGuest, gameState, userInfo);
  };

  return { sendNotification };
};
