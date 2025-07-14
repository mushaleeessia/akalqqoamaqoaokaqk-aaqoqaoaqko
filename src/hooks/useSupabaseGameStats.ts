import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useGuestMode } from './useGuestMode';
import { logHighStreak } from '@/utils/activityLogger';

interface GameStats {
  win_streak: number;
  max_win_streak: number;
  total_games: number;
  total_wins: number;
  total_losses: number;
  average_attempts: number | null;
  last_played: string | null;
}

export const useSupabaseGameStats = (gameMode: string) => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    if (isGuestMode || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', gameMode)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar stats:', error);
        setLoading(false);
        return;
      }

      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, gameMode, isGuestMode]);

  // Setup real-time subscription
  useEffect(() => {
    if (isGuestMode || !user) return;

    const channel = supabase
      .channel('game-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_stats',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newStats = payload.new as any;
            if (newStats.game_mode === gameMode) {
              // Check for high streak achievement
              if (newStats.win_streak >= 5 && (!stats || newStats.win_streak > stats.win_streak)) {
                // Fetch user nickname for log
                const fetchNickname = async () => {
                  try {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('nickname')
                      .eq('id', user.id)
                      .maybeSingle();
                    
                    logHighStreak(newStats.win_streak, gameMode as any, user.id, profile?.nickname);
                  } catch (error) {
                    logHighStreak(newStats.win_streak, gameMode as any, user.id);
                  }
                };
                fetchNickname();
              }
              
              setStats(newStats);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, gameMode, isGuestMode]);

  return {
    stats,
    loading,
    winstreak: stats?.win_streak || 0,
    maxWinstreak: stats?.max_win_streak || 0,
    totalGames: stats?.total_games || 0,
    totalWins: stats?.total_wins || 0,
    refetch: fetchStats
  };
};