
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

  useEffect(() => {
    // Só enviar quando:
    // 1. O jogo terminou (won ou lost)
    // 2. Tem IP do jogador
    // 3. Tem tentativas
    // 4. Está mostrando o game over da sessão atual (não carregando estado antigo)
    // 5. Ainda não enviou notificação para esta sessão
    if ((gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') && 
        playerIP && 
        gameState.guesses.length > 0 &&
        showingFreshGameOver &&
        !hasSentNotification.current) {
      
      const isWin = gameState.gameStatus === 'won';
      const attempts = gameState.guesses.length;
      
      const shareText = generateShareText(gameState, mode, isWin, attempts, allTargetWords);
      
      console.log('Enviando resultado para Discord:', { 
        gameStatus: gameState.gameStatus, 
        attempts, 
        mode,
        showingFreshGameOver
      });
      
      // Enviar para Discord automaticamente
      sendGameResultToDiscord(shareText, playerIP);
      
      // Marcar como enviado para evitar envios duplicados
      hasSentNotification.current = true;
    }
  }, [gameState.gameStatus, gameState.guesses.length, mode, allTargetWords, playerIP, showingFreshGameOver]);

  // Reset quando o modo muda
  useEffect(() => {
    hasSentNotification.current = false;
  }, [mode]);
};
