
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GameMode } from '@/components/GameModeSelector';

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

export const useSupabaseGameSession = (mode: GameMode, targetWords: string[]) => {
  const { user } = useAuth();
  const [sessionExists, setSessionExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const getTodayDate = () => {
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0];
  };

  const checkExistingSession = async () => {
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
        console.error('Error checking session:', error);
        setLoading(false);
        return null;
      }

      if (data) {
        setSessionExists(true);
        console.log('Sessão existente encontrada:', data);
      }
      
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      return null;
    }
  };

  const saveGameSession = async (guesses: string[], won: boolean) => {
    if (!user) {
      console.log('Usuário não autenticado, não salvando sessão');
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

      console.log('Salvando sessão no Supabase:', gameSession);

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(gameSession)
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar sessão:', error);
        return;
      }

      console.log('Sessão salva com sucesso:', data);
      setSessionExists(true);
      
      // Também salvar/atualizar estatísticas
      await updateGameStats(won, guesses.length);
      
    } catch (error) {
      console.error('Erro inesperado ao salvar sessão:', error);
    }
  };

  const updateGameStats = async (won: boolean, attempts: number) => {
    if (!user) return;

    try {
      // Primeiro, tentar buscar estatísticas existentes
      const { data: existingStats, error: fetchError } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', mode)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching stats:', fetchError);
        return;
      }

      const now = new Date().toISOString();

      if (existingStats) {
        // Atualizar estatísticas existentes
        const newWinStreak = won ? existingStats.win_streak + 1 : 0;
        const newMaxWinStreak = Math.max(newWinStreak, existingStats.max_win_streak);
        const totalGames = existingStats.total_games + 1;
        const totalWins = existingStats.total_wins + (won ? 1 : 0);
        const totalLosses = existingStats.total_losses + (won ? 0 : 1);
        
        // Calcular nova média de tentativas
        const currentAvg = existingStats.average_attempts || 0;
        const newAverage = ((currentAvg * existingStats.total_games) + attempts) / totalGames;

        const { error: updateError } = await supabase
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

        if (updateError) {
          console.error('Error updating stats:', updateError);
        } else {
          console.log('Estatísticas atualizadas com sucesso');
        }
      } else {
        // Criar novas estatísticas
        const { error: insertError } = await supabase
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

        if (insertError) {
          console.error('Error creating stats:', insertError);
        } else {
          console.log('Novas estatísticas criadas com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro inesperado ao atualizar estatísticas:', error);
    }
  };

  useEffect(() => {
    if (user && targetWords.length > 0) {
      checkExistingSession();
    } else {
      setLoading(false);
    }
  }, [user, mode, targetWords]);

  return {
    sessionExists,
    loading,
    saveGameSession,
    checkExistingSession
  };
};
