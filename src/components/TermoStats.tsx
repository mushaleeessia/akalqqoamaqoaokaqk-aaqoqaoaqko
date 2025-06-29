
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { GameMode } from './GameModeSelector';

interface GameStats {
  total_games: number;
  total_wins: number;
  total_losses: number;
  win_streak: number;
  max_win_streak: number;
  average_attempts: number;
}

interface TermoStatsProps {
  mode: GameMode | 'crossword';
  isGuest?: boolean;
}

export const TermoStats = ({ mode, isGuest = false }: TermoStatsProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoStats, setHasNoStats] = useState(false);

  const getGuestStats = (): GameStats => {
    const savedStats = localStorage.getItem(`termo_guest_stats_${mode}`);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
    return {
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      win_streak: 0,
      max_win_streak: 0,
      average_attempts: 0
    };
  };

  const fetchStats = async () => {
    if (isGuest) {
      const guestStats = getGuestStats();
      setStats(guestStats);
      setHasNoStats(guestStats.total_games === 0);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', mode)
        .maybeSingle();

      if (error) {
        console.error('Error fetching stats:', error);
        setHasNoStats(true);
      } else if (data) {
        setStats(data);
        setHasNoStats(false);
      } else {
        // Nenhuma estatística encontrada
        setHasNoStats(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setHasNoStats(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, mode, isGuest]);

  // Real-time updates for authenticated users
  useEffect(() => {
    if (isGuest || !user) return;

    const channel = supabase
      .channel('game_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new && (payload.new as any).game_mode === mode) {
            setStats(payload.new as GameStats);
            setHasNoStats(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, mode, isGuest]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
        <div className="text-white text-center">Carregando estatísticas...</div>
      </div>
    );
  }

  const getModeLabel = (mode: GameMode | 'crossword'): string => {
    const labels = {
      solo: 'Solo',
      duo: 'Duo',
      trio: 'Trio',
      quarteto: 'Quarteto',
      crossword: 'Palavras Cruzadas'
    };
    return labels[mode] || mode;
  };

  // Mostrar mensagem quando não há estatísticas
  if (hasNoStats || !stats || stats.total_games === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">
          Estatísticas - {getModeLabel(mode)}
          {isGuest && <span className="text-yellow-400 text-sm ml-2">(Modo Convidado)</span>}
        </h3>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-white/80 text-lg mb-2">
            Você ainda não jogou nenhuma partida no modo {getModeLabel(mode)}!
          </p>
          <p className="text-white/60 text-sm">
            Que tal começar uma partida agora?
          </p>
        </div>
      </div>
    );
  }

  const winRate = stats.total_games > 0 ? Math.round((stats.total_wins / stats.total_games) * 100) : 0;

  // Customizar layout para palavras cruzadas
  if (mode === 'crossword') {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
        <h3 className="text-white text-lg font-semibold mb-4 text-center">
          Estatísticas - {getModeLabel(mode)}
          {isGuest && <span className="text-yellow-400 text-sm ml-2">(Modo Convidado)</span>}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-600/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">{stats.total_games}</div>
            <div className="text-blue-200 text-sm mt-1">Jogos</div>
          </div>
          
          <div className="bg-green-600/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">{winRate}%</div>
            <div className="text-green-200 text-sm mt-1">Taxa de Vitória</div>
          </div>
          
          <div className="bg-purple-600/20 rounded-lg p-4">
            <div className="text-3xl font-bold text-white">{stats.total_wins}</div>
            <div className="text-purple-200 text-sm mt-1">Vitórias</div>
          </div>
        </div>
      </div>
    );
  }

  // Layout padrão para outros modos
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
      <h3 className="text-white text-lg font-semibold mb-4 text-center">
        Estatísticas - {getModeLabel(mode)}
        {isGuest && <span className="text-yellow-400 text-sm ml-2">(Modo Convidado)</span>}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-600/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{stats.total_games}</div>
          <div className="text-blue-200 text-sm">Jogos</div>
        </div>
        
        <div className="bg-green-600/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{winRate}%</div>
          <div className="text-green-200 text-sm">Taxa de Vitória</div>
        </div>
        
        <div className="bg-yellow-600/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{stats.win_streak}</div>
          <div className="text-yellow-200 text-sm">Sequência Atual</div>
        </div>
        
        <div className="bg-purple-600/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{stats.max_win_streak}</div>
          <div className="text-purple-200 text-sm">Melhor Sequência</div>
        </div>
        
        <div className="bg-red-600/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">{stats.total_wins}</div>
          <div className="text-red-200 text-sm">Vitórias</div>
        </div>
        
        <div className="bg-gray-600/20 rounded-lg p-3">
          <div className="text-2xl font-bold text-white">
            {stats.average_attempts ? stats.average_attempts.toFixed(1) : '0.0'}
          </div>
          <div className="text-gray-200 text-sm">Média Tentativas</div>
        </div>
      </div>
    </div>
  );
};
