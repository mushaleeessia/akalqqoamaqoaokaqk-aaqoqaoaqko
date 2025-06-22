
import { useEffect, useRef } from 'react';
import { GameState } from '@/components/TermoGame';
import { MultiModeGameState } from '@/hooks/useMultiModeGameState';
import { GameMode } from '@/components/GameModeSelector';
import { generateShareText } from '@/utils/shareUtils';
import { sendGameResultToDiscord } from '@/utils/discordWebhook';

interface UseDiscordNotificationProps {
  gameState: GameState | MultiModeGameState;
  mode: GameMode;
  allTargetWords: string[];
  playerIP?: string;
  showingFreshGameOver?: boolean;
}

export const useDiscordNotification = ({ 
  gameState, 
  mode, 
  allTargetWords, 
  playerIP,
  showingFreshGameOver = false
}: UseDiscordNotificationProps) => {
  const hasSentNotification = useRef(false);
  const previousGameStatus = useRef(gameState.gameStatus);

  useEffect(() => {
    // Detectar quando o jogo acabou de terminar (mudança de status)
    const justFinished = previousGameStatus.current === 'playing' && 
                         (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost');
    
    console.log('Discord notification check:', {
      justFinished,
      previousStatus: previousGameStatus.current,
      currentStatus: gameState.gameStatus,
      hasIP: !!playerIP,
      hasGuesses: gameState.guesses.length > 0,
      showingFreshGameOver,
      hasSentNotification: hasSentNotification.current
    });

    // Só enviar quando:
    // 1. O jogo acabou de terminar (mudança de playing para won/lost)
    // 2. Tem IP do jogador
    // 3. Tem tentativas
    // 4. Ainda não enviou notificação para esta sessão
    if (justFinished && 
        playerIP && 
        gameState.guesses.length > 0 &&
        !hasSentNotification.current) {
      
      const isWin = gameState.gameStatus === 'won';
      const attempts = gameState.guesses.length;
      
      const shareText = generateShareText(gameState, mode, isWin, attempts, allTargetWords);
      
      console.log('Enviando resultado para Discord:', { 
        gameStatus: gameState.gameStatus, 
        attempts, 
        mode,
        shareText
      });
      
      // Enviar para Discord automaticamente
      sendGameResultToDiscord(shareText, playerIP);
      
      // Marcar como enviado para evitar envios duplicados
      hasSentNotification.current = true;
    }

    // Atualizar o status anterior
    previousGameStatus.current = gameState.gameStatus;
  }, [gameState.gameStatus, gameState.guesses.length, mode, allTargetWords, playerIP, showingFreshGameOver]);

  // Reset quando o modo muda
  useEffect(() => {
    hasSentNotification.current = false;
    previousGameStatus.current = 'playing';
  }, [mode]);
};
