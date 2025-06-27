
import { useEffect, useRef } from 'react';
import { sendGameResultToDiscord, GameState } from '@/utils/discordWebhook';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { supabase } from '@/integrations/supabase/client';

export const useDiscordNotification = (gameState: { gameStatus: string }, shareText: string) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const lastNotifiedGameState = useRef<string>('');

  // Enviar automaticamente quando o jogo termina
  useEffect(() => {
    if (gameState && shareText && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost')) {
      // Criar uma chave única baseada no shareText para evitar duplicatas
      const gameKey = shareText.split('\n').slice(0, 2).join('|'); // Usa título + resultado como chave única
      
      // Se já enviou notificação para este jogo específico, não enviar novamente
      if (lastNotifiedGameState.current === gameKey) {
        return;
      }

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
        lastNotifiedGameState.current = gameKey;
      };

      sendNotificationWithUserInfo();
    }
  }, [gameState?.gameStatus, shareText, user, isGuestMode]);

  // Reset quando começar um novo jogo
  useEffect(() => {
    if (gameState?.gameStatus === 'playing') {
      // Não resetar imediatamente - manter o controle para evitar re-envios
    }
  }, [gameState?.gameStatus]);

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
