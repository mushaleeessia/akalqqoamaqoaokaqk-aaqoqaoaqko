
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GameMode } from '@/components/GameModeSelector';
import { useGuestMode } from './useGuestMode';

interface GameSession {
  id?: string;
  user_id: string;
  game_mode: string;
  target_words: string[];
  guesses: string[];
  attempts: number;
  won: boolean;
  completed_at: string;
}

export const useSupabaseGameSession = (mode: GameMode | string, targetWords: string[]) => {
  const { user } = useAuth();
  const { isGuestMode, saveGuestGameSession, checkGuestSession } = useGuestMode();
  const [sessionExists, setSessionExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const getTodayDate = () => {
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0];
  };

  const checkExistingSession = async () => {
    if (isGuestMode) {
      const guestSession = checkGuestSession(mode as GameMode);
      setSessionExists(!!guestSession);
      setLoading(false);
      return guestSession;
    }

    if (!user) {
      setLoading(false);
      return null;
    }

    const today = getTodayDate();
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', mode)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`)
        .maybeSingle();

      if (error) {
        setLoading(false);
        return null;
      }

      if (data) {
        setSessionExists(true);
      }
      
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      return null;
    }
  };

  const saveGameSession = async (guesses: string[], won: boolean) => {
    if (isGuestMode) {
      saveGuestGameSession(mode as GameMode, guesses, won);
      setSessionExists(true);
      return;
    }

    if (!user) {
      return;
    }

    try {
      const gameSession: GameSession = {
        user_id: user.id,
        game_mode: mode,
        target_words: targetWords,
        guesses: guesses,
        attempts: guesses.length,
        won: won,
        completed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(gameSession)
        .select()
        .single();

      if (error) {
        return;
      }

      setSessionExists(true);
      
      await updateGameStats(won, guesses.length);
      
    } catch (error) {
      // Silent error handling
    }
  };

  const updateGameStats = async (won: boolean, attempts: number) => {
    if (!user || isGuestMode) return;

    try {
      const { data: existingStats, error: fetchError } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', mode)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        return;
      }

      const now = new Date().toISOString();

      if (existingStats) {
        const newWinStreak = won ? existingStats.win_streak + 1 : 0;
        const newMaxWinStreak = Math.max(newWinStreak, existingStats.max_win_streak);
        const totalGames = existingStats.total_games + 1;
        const totalWins = existingStats.total_wins + (won ? 1 : 0);
        const totalLosses = existingStats.total_losses + (won ? 0 : 1);
        
        const currentAvg = existingStats.average_attempts || 0;
        const newAverage = ((currentAvg * existingStats.total_games) + attempts) / totalGames;

        await supabase
          .from('game_stats')
          .update({
            win_streak: newWinStreak,
            max_win_streak: newMaxWinStreak,
            total_games: totalGames,
            total_wins: totalWins,
            total_losses: totalLosses,
            average_attempts: newAverage,
            last_played: now,
            updated_at: now
          })
          .eq('id', existingStats.id);
      } else {
        // Create new stats record for this game mode
        await supabase
          .from('game_stats')
          .insert({
            user_id: user.id,
            game_mode: mode,
            win_streak: won ? 1 : 0,
            max_win_streak: won ? 1 : 0,
            total_games: 1,
            total_wins: won ? 1 : 0,
            total_losses: won ? 0 : 1,
            average_attempts: attempts,
            last_played: now
          });
      }
    } catch (error) {
      // Silent error handling
    }
  };

  useEffect(() => {
    if ((user || isGuestMode) && targetWords.length > 0) {
      checkExistingSession();
    } else {
      setLoading(false);
    }
  }, [user, mode, targetWords, isGuestMode]);

  return {
    sessionExists,
    loading,
    saveGameSession,
    checkExistingSession
  };
};
