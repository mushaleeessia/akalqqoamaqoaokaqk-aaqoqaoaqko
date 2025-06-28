
import { supabase } from '@/integrations/supabase/client';

export type GameState = 'playing' | 'win' | 'lose' | 'already_won' | 'already_lost';

export const sendGameResultToDiscord = async (shareText: string, isGuest: boolean, gameState: GameState, userInfo?: { nickname?: string; discordUsername?: string; discordAvatar?: string }) => {
  try {
    // Só enviar webhook se o jogo terminou (win ou lose)
    if (gameState !== 'win' && gameState !== 'lose') {
      return;
    }

    // Validar se o shareText tem conteúdo suficiente
    if (!shareText || shareText.length < 10) {
      return;
    }

    const { data, error } = await supabase.functions.invoke('discord-webhook', {
      body: {
        type: 'game_result',
        data: {
          shareText,
          isGuest,
          gameState,
          userInfo
        }
      }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const sendAccountDeletionToDiscord = async (userProfile: any) => {
  try {
    await supabase.functions.invoke('discord-webhook', {
      body: {
        type: 'account_deletion',
        data: {
          userProfile
        }
      }
    });
  } catch (error) {
    // Silently fail
  }
};
