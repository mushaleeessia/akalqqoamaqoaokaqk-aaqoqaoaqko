
import { useEffect } from 'react';
import { useLinkClickLogger } from '@/hooks/useLinkClickLogger';

export const StatsUpdater = () => {
  const { updateStats } = useLinkClickLogger();

  useEffect(() => {
    // Atualizar estatísticas a cada 5 minutos
    const interval = setInterval(() => {
      updateStats();
    }, 5 * 60 * 1000); // 5 minutos

    // Atualizar uma vez ao carregar
    updateStats();

    return () => clearInterval(interval);
  }, [updateStats]);

  return null; // Componente invisível
};
