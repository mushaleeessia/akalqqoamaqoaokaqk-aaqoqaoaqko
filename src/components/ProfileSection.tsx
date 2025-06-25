
import { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GameMode } from './GameModeSelector';

interface GameStats {
  id: string;
  game_mode: string;
  win_streak: number;
  max_win_streak: number;
  total_games: number;
  total_wins: number;
  total_losses: number;
  average_attempts: number;
  last_played: string;
}

export const ProfileSection = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('total_games', { ascending: false });

      if (error) {
        console.error('Error fetching stats:', error);
      } else {
        setStats(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  // Set up real-time subscription for stats updates
  useEffect(() => {
    if (!user) return;

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
        () => {
          fetchStats(); // Refresh stats when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-white text-center">Carregando estatísticas...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-white text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Faça login para ver suas estatísticas</p>
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="text-white text-center">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Comece a jogar para ver suas estatísticas!</p>
        </div>
      </div>
    );
  }

  const getModeName = (mode: string) => {
    const modeNames: Record<string, string> = {
      'solo': 'Solo',
      'duo': 'Duo', 
      'trio': 'Trio',
      'quarteto': 'Quarteto',
      'quinteto': 'Quinteto'
    };
    return modeNames[mode] || mode;
  };

  const formatWinRate = (wins: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((wins / total) * 100)}%`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-white mr-3" />
        <h2 className="text-xl font-bold text-white">Suas Estatísticas</h2>
      </div>

      <div className="grid gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                {getModeName(stat.game_mode)}
              </h3>
              <div className="text-sm text-white/70">
                {stat.total_games} {stat.total_games === 1 ? 'jogo' : 'jogos'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-white/70">Taxa de Vitória</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {formatWinRate(stat.total_wins, stat.total_games)}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Flame className="w-4 h-4 text-orange-400 mr-1" />
                  <span className="text-sm text-white/70">Sequência</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {stat.win_streak}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-sm text-white/70">Melhor Seq.</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {stat.max_win_streak}
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Target className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-sm text-white/70">Média</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {stat.average_attempts ? stat.average_attempts.toFixed(1) : '0.0'}
                </div>
              </div>
            </div>

            {stat.last_played && (
              <div className="mt-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-white/50 mr-1" />
                  <span className="text-xs text-white/50">Último jogo</span>
                </div>
                <div className="text-xs text-white/70">
                  {new Date(stat.last_played).toLocaleDateString('pt-BR')}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
