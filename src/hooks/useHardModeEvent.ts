import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HardModeEventState {
  isActive: boolean;
  isTriggering: boolean;
  gamesPlayed: number;
  lastEventGame: number;
}

export const useHardModeEvent = () => {
  const [eventState, setEventState] = useState<HardModeEventState>({
    isActive: false,
    isTriggering: false,
    gamesPlayed: 0,
    lastEventGame: -1
  });

  // Carregar estado do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('termo-infinity-hard-mode');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEventState(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erro ao carregar estado do hard mode:', error);
      }
    }
  }, []);

  // Salvar estado no localStorage
  const saveState = useCallback((newState: Partial<HardModeEventState>) => {
    setEventState(prev => {
      const updated = { ...prev, ...newState };
      localStorage.setItem('termo-infinity-hard-mode', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Verificar se deve ativar o evento
  const checkEventTrigger = useCallback(() => {
    const { gamesPlayed, lastEventGame, isTriggering, isActive } = eventState;
    
    // Não verificar se já está em hard mode ou triggering
    if (isTriggering || isActive) return;
    
    // Deve verificar a cada 2 jogos
    if (gamesPlayed % 2 === 0 && gamesPlayed > 0) {
      // Evitar triggerar no mesmo jogo duas vezes
      if (lastEventGame !== gamesPlayed) {
        const shouldTrigger = Math.random() < 0.02; // 2% de chance
        
        if (shouldTrigger) {
          triggerHardMode();
        }
      }
    }
  }, [eventState]);

  // Ativar o hard mode
  const triggerHardMode = useCallback(() => {
    saveState({
      isTriggering: true,
      lastEventGame: eventState.gamesPlayed
    });

    // Após a animação, ativar o hard mode
    setTimeout(() => {
      saveState({
        isTriggering: false,
        isActive: true
      });
    }, 3000); // 3 segundos de animação
  }, [eventState.gamesPlayed, saveState]);

  // Ativar manualmente via atalho
  const triggerManually = useCallback(() => {
    triggerHardMode();
  }, [triggerHardMode]);

  // Incrementar contador de jogos
  const incrementGames = useCallback(() => {
    const newGamesPlayed = eventState.gamesPlayed + 1;
    saveState({ gamesPlayed: newGamesPlayed });
    
    // Verificar trigger após incrementar
    setTimeout(() => {
      checkEventTrigger();
    }, 100);
  }, [eventState.gamesPlayed, saveState, checkEventTrigger]);

  // Resetar hard mode (início de novo jogo)
  const resetHardMode = useCallback(() => {
    saveState({ isActive: false });
  }, [saveState]);

  // Configurar atalho de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.ctrlKey && 
        event.shiftKey && 
        event.altKey && 
        event.key.toLowerCase() === 'd'
      ) {
        // Aguardar a próxima tecla 'I'
        const handleNextKey = (nextEvent: KeyboardEvent) => {
          if (nextEvent.key.toLowerCase() === 'i') {
            event.preventDefault();
            nextEvent.preventDefault();
            triggerManually();
          }
          window.removeEventListener('keydown', handleNextKey);
        };
        
        window.addEventListener('keydown', handleNextKey);
        setTimeout(() => {
          window.removeEventListener('keydown', handleNextKey);
        }, 1000); // 1 segundo para pressionar 'I'
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerManually]);

  return {
    isHardMode: eventState.isActive,
    isTriggering: eventState.isTriggering,
    gamesPlayed: eventState.gamesPlayed,
    incrementGames,
    resetHardMode,
    triggerManually
  };
};