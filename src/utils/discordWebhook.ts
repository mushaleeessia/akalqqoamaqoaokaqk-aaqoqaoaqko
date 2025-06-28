
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter, getRateLimitConfig } from './rateLimiter';
import { validateGameData, validateNickname } from './securityValidation';
import { securityLogger } from './securityLogger';

export type GameState = 'playing' | 'win' | 'lose' | 'already_won' | 'already_lost';

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

export const sendGameResultToDiscord = async (shareText: string, isGuest: boolean, gameState: GameState, userInfo?: { nickname?: string; discordUsername?: string; discordAvatar?: string }) => {
  try {
    // Só enviar webhook se o jogo terminou (win ou lose)
    if (gameState !== 'win' && gameState !== 'lose') {
      return;
    }

    const clientIP = await getClientIP();
    const userId = userInfo?.discordUsername || undefined;

    // Verificar rate limit
    const rateLimitCheck = await rateLimiter.checkLimit(
      clientIP, 
      userId, 
      getRateLimitConfig('webhook')
    );

    if (!rateLimitCheck.allowed) {
      await securityLogger.logRateLimit(clientIP, userId, 'webhook');
      throw new Error('Rate limit excedido. Tente novamente mais tarde.');
    }

    // Validar dados do jogo
    const gameDataValidation = validateGameData({
      shareText,
      gameState,
      userInfo
    });

    if (!gameDataValidation.isValid) {
      await securityLogger.logValidationFailure(
        'game_data',
        gameDataValidation.reason || 'Dados inválidos',
        { shareText: shareText.substring(0, 100), gameState, isGuest }
      );
      
      if (gameDataValidation.severity === 'high') {
        throw new Error('Dados de jogo inválidos');
      }
    }

    // Validar nickname se presente
    if (userInfo?.nickname) {
      const nicknameValidation = validateNickname(userInfo.nickname);
      if (!nicknameValidation.isValid) {
        await securityLogger.logInvalidNickname(
          userInfo.nickname,
          nicknameValidation.reason || 'Nickname inválido',
          userId,
          clientIP
        );
        
        if (nicknameValidation.severity === 'high') {
          throw new Error('Nickname contém conteúdo inadequado');
        }
      }
    }

    // Validar se o shareText tem conteúdo suficiente
    if (!shareText || shareText.length < 10) {
      await securityLogger.logValidationFailure(
        'share_text',
        'ShareText muito curto',
        { length: shareText?.length || 0 }
      );
      return;
    }

    // Detectar comportamento suspeito
    const suspiciousPatterns = [
      shareText.length > 1500, // ShareText muito longo
      /script|javascript|<|>/i.test(shareText), // Possível XSS
      shareText.includes('http'), // URLs suspeitas
    ];

    if (suspiciousPatterns.some(pattern => pattern)) {
      await securityLogger.logSuspiciousBehavior(
        'ShareText com padrão suspeito detectado',
        userId,
        clientIP,
        { shareTextLength: shareText.length }
      );
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
    // Log do erro sem expor detalhes
    await securityLogger.logValidationFailure(
      'webhook_send',
      'Erro ao enviar webhook',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    throw error;
  }
};

export const sendAccountDeletionToDiscord = async (userProfile: any) => {
  try {
    const clientIP = await getClientIP();
    
    // Rate limit mais restritivo para deleção de contas
    const rateLimitCheck = await rateLimiter.checkLimit(
      clientIP, 
      userProfile?.id, 
      getRateLimitConfig('account_creation')
    );

    if (!rateLimitCheck.allowed) {
      await securityLogger.logRateLimit(clientIP, userProfile?.id, 'account_deletion');
      return; // Falha silenciosa para não bloquear deleção
    }

    await supabase.functions.invoke('discord-webhook', {
      body: {
        type: 'account_deletion',
        data: {
          userProfile
        }
      }
    });
  } catch (error) {
    // Log do erro
    await securityLogger.logValidationFailure(
      'account_deletion_webhook',
      'Erro ao enviar webhook de deleção',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    // Silently fail
  }
};
