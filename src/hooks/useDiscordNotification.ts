
import { useEffect, useRef } from 'react';
import { sendGameResultToDiscord, GameState } from '@/utils/discordWebhook';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { supabase } from '@/integrations/supabase/client';
import { GameMode } from '@/components/GameModeSelector';

// Função para gerar um hash único para a sessão do jogo usando encodeURIComponent
const generateGameSessionHash = (gameState: any, shareText: string, mode?: GameMode) => {
  const today = new Date().toISOString().split('T')[0];
  const gameData = {
    date: today,
    status: gameState.gameStatus,
    guesses: gameState.guesses?.length || 0,
    mode: mode || 'solo',
    shareTextPreview: shareText.split('\n').slice(0, 3).join('|')
  };
  
  // Usar encodeURIComponent para lidar com caracteres especiais
  const jsonString = JSON.stringify(gameData);
  const encodedString = encodeURIComponent(jsonString);
  
  // Criar hash simples sem btoa
  let hash = 0;
  for (let i = 0; i < encodedString.length; i++) {
    const char = encodedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36).substring(0, 32);
};

export const useDiscordNotification = (gameState: { gameStatus: string; guesses?: string[] }, shareText: string, mode?: GameMode) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const processedSessions = useRef<Set<string>>(new Set());
  const previousModeRef = useRef<GameMode | undefined>(mode);
  const lastGameStateRef = useRef<typeof gameState | null>(null);
  const lastShareTextRef = useRef<string>('');

  // Função para verificar se já foi enviado (para usuários logados)
  const checkIfAlreadySent = async (sessionHash: string): Promise<boolean> => {
    if (isGuestMode || !user) return false;
    
    try {
      const { data, error } = await supabase
        .from('discord_webhooks_sent')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_hash', sessionHash)
        .maybeSingle();
      
      return !!data && !error;
    } catch {
      return false;
    }
  };

  // Função para marcar como enviado (para usuários logados)
  const markAsSent = async (sessionHash: string) => {
    if (isGuestMode || !user) return;
    
    try {
      await supabase
        .from('discord_webhooks_sent')
        .insert({
          user_id: user.id,
          session_hash: sessionHash
        });
    } catch {
      // Silently fail
    }
  };

  // Função para verificar se é uma mudança real de estado do jogo
  const isRealGameStateChange = (currentGameState: typeof gameState, previousGameState: typeof gameState | null, currentShareText: string, previousShareText: string): boolean => {
    // Log para debug
    console.log('🔍 Verificando mudança de estado:', {
      currentStatus: currentGameState.gameStatus,
      previousStatus: previousGameState?.gameStatus,
      currentGuesses: currentGameState.guesses?.length || 0,
      previousGuesses: previousGameState?.guesses?.length || 0,
      currentShareText: currentShareText.length,
      previousShareText: previousShareText.length,
      mode
    });

    if (!previousGameState) {
      console.log('✅ Primeira vez - é uma mudança real');
      return true;
    }
    
    // Se o status mudou de playing para won/lost, é uma mudança real
    if (previousGameState.gameStatus === 'playing' && (currentGameState.gameStatus === 'won' || currentGameState.gameStatus === 'lost')) {
      console.log('✅ Status mudou para terminado - é uma mudança real');
      return true;
    }
    
    // Se o shareText mudou significativamente (novo resultado), é uma mudança real
    if (currentShareText && previousShareText !== currentShareText && currentShareText.length > 50) {
      console.log('✅ ShareText mudou - é uma mudança real');
      return true;
    }
    
    // Se o número de tentativas aumentou significativamente, é uma mudança real
    const currentGuessCount = currentGameState.guesses?.length || 0;
    const previousGuessCount = previousGameState.guesses?.length || 0;
    
    if (currentGuessCount > previousGuessCount) {
      console.log('✅ Número de tentativas aumentou - é uma mudança real');
      return true;
    }
    
    console.log('❌ Não é uma mudança real de estado');
    return false;
  };

  // Enviar automaticamente quando o jogo termina
  useEffect(() => {
    console.log('🎮 Hook executado:', {
      gameStatus: gameState.gameStatus,
      mode,
      shareTextLength: shareText.length,
      guessesCount: gameState.guesses?.length || 0,
      userId: user?.id,
      isGuestMode
    });

    // Detectar mudança de modo
    const modeChanged = previousModeRef.current && previousModeRef.current !== mode;
    
    // Se houve mudança de modo, limpar cache e não enviar webhook
    if (modeChanged) {
      console.log('🔄 Modo mudou de', previousModeRef.current, 'para', mode, '- limpando cache');
      previousModeRef.current = mode;
      processedSessions.current.clear();
      lastGameStateRef.current = null;
      lastShareTextRef.current = '';
      return;
    }
    
    previousModeRef.current = mode;

    // Verificar se é uma mudança real no estado do jogo
    if (!isRealGameStateChange(gameState, lastGameStateRef.current, shareText, lastShareTextRef.current)) {
      lastGameStateRef.current = gameState;
      lastShareTextRef.current = shareText;
      return;
    }

    // Só enviar se o jogo realmente terminou (won/lost) e há texto para compartilhar
    if (gameState && shareText && (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost')) {
      console.log('🎯 Tentando enviar webhook:', {
        status: gameState.gameStatus,
        mode,
        shareTextPreview: shareText.substring(0, 100)
      });

      const sessionHash = generateGameSessionHash(gameState, shareText, mode);
      
      // Verificar se já foi processado nesta sessão (para convidados e usuários)
      if (processedSessions.current.has(sessionHash)) {
        console.log('⚠️ Sessão já processada:', sessionHash);
        lastGameStateRef.current = gameState;
        lastShareTextRef.current = shareText;
        return;
      }

      // Verificar se é um jogo verdadeiramente terminado (não uma transição)
      const hasValidGuesses = gameState.guesses && gameState.guesses.length > 0;
      if (!hasValidGuesses) {
        console.log('⚠️ Não há tentativas válidas');
        lastGameStateRef.current = gameState;
        lastShareTextRef.current = shareText;
        return;
      }

      const sendNotificationWithUserInfo = async () => {
        try {
          console.log('📤 Iniciando envio do webhook...');

          // Para usuários logados, verificar no banco
          if (!isGuestMode && user) {
            const alreadySent = await checkIfAlreadySent(sessionHash);
            if (alreadySent) {
              console.log('⚠️ Webhook já foi enviado para este usuário:', sessionHash);
              return;
            }
          }

          const isGuest = !user || isGuestMode;
          const discordGameState = gameState.gameStatus === 'won' ? 'win' : 'lose';
          
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

              console.log('👤 Informações do usuário:', { nickname: profile?.nickname, discordUsername });
            } catch (error) {
              console.log('⚠️ Erro ao buscar informações do usuário:', error);
            }
          }

          await sendGameResultToDiscord(shareText, isGuest, discordGameState as GameState, userInfo);
          
          console.log('✅ Webhook enviado com sucesso!');
          
          // Marcar como enviado
          processedSessions.current.add(sessionHash);
          if (!isGuest && user) {
            await markAsSent(sessionHash);
          }
        } catch (error) {
          console.error('❌ Erro ao enviar webhook:', error);
        }
      };

      sendNotificationWithUserInfo();
    } else {
      console.log('⚠️ Condições não atendidas para envio:', {
        hasGameState: !!gameState,
        hasShareText: !!shareText,
        gameStatus: gameState?.gameStatus
      });
    }
    
    lastGameStateRef.current = gameState;
    lastShareTextRef.current = shareText;
  }, [gameState?.gameStatus, shareText, user, isGuestMode, mode, gameState?.guesses?.length]);

  // Limpar cache quando o modo muda
  useEffect(() => {
    if (previousModeRef.current !== mode) {
      processedSessions.current.clear();
      lastGameStateRef.current = null;
      lastShareTextRef.current = '';
    }
  }, [mode]);

  // Limpar cache quando o componente é desmontado
  useEffect(() => {
    return () => {
      processedSessions.current.clear();
      lastGameStateRef.current = null;
      lastShareTextRef.current = '';
    };
  }, []);

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
