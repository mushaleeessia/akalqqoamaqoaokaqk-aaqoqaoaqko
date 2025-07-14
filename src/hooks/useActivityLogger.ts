import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGuestMode } from '@/hooks/useGuestMode';
import { GameMode } from '@/components/GameModeSelector';
import { 
  logGameStart, 
  logModeChange, 
  logFirstGame, 
  logHighStreak, 
  logLongGame,
  logPageVisit
} from '@/utils/activityLogger';
import { supabase } from '@/integrations/supabase/client';

export const useActivityLogger = () => {
  const { user } = useAuth();
  const { isGuestMode } = useGuestMode();
  const gameStartTimeRef = useRef<number | null>(null);
  const lastModeRef = useRef<GameMode | null>(null);
  const profileDataRef = useRef<{ nickname?: string } | null>(null);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || isGuestMode) {
        profileDataRef.current = null;
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .maybeSingle();
        
        profileDataRef.current = data;
      } catch (error) {
        console.error('Error fetching profile:', error);
        profileDataRef.current = null;
      }
    };

    fetchProfile();
  }, [user, isGuestMode]);

  // Log game start
  const logGameStarted = async (gameMode: GameMode) => {
    gameStartTimeRef.current = Date.now();
    
    const nickname = profileDataRef.current?.nickname;
    logGameStart(gameMode, user?.id, nickname, isGuestMode);

    // Check if it's first game for authenticated users
    if (!isGuestMode && user) {
      try {
        const { data: existingStats } = await supabase
          .from('game_stats')
          .select('total_games')
          .eq('user_id', user.id)
          .eq('game_mode', gameMode)
          .maybeSingle();

        if (!existingStats || existingStats.total_games === 0) {
          logFirstGame(gameMode, user.id, nickname);
        }
      } catch (error) {
        console.error('Error checking first game:', error);
      }
    }
  };

  // Log mode change
  const logModeChanged = (newMode: GameMode) => {
    if (lastModeRef.current && lastModeRef.current !== newMode) {
      const nickname = profileDataRef.current?.nickname;
      logModeChange(lastModeRef.current, newMode, user?.id, nickname, isGuestMode);
    }
    lastModeRef.current = newMode;
  };

  // Log game end (for duration tracking)
  const logGameEnded = (gameMode: GameMode) => {
    if (gameStartTimeRef.current) {
      const duration = (Date.now() - gameStartTimeRef.current) / 1000;
      
      // Log if game took longer than 10 minutes
      if (duration > 600) {
        const nickname = profileDataRef.current?.nickname;
        logLongGame(duration, gameMode, user?.id, nickname, isGuestMode);
      }
      
      gameStartTimeRef.current = null;
    }
  };

  // Log high streak
  const logHighStreakAchieved = (streak: number, gameMode: GameMode) => {
    if (streak >= 5 && !isGuestMode && user) {
      const nickname = profileDataRef.current?.nickname;
      logHighStreak(streak, gameMode, user.id, nickname);
    }
  };

  // Log page visits
  const logPageVisited = (page: string) => {
    const nickname = profileDataRef.current?.nickname;
    logPageVisit(page, user?.id, nickname, isGuestMode);
  };

  return {
    logGameStarted,
    logModeChanged,
    logGameEnded,
    logHighStreakAchieved,
    logPageVisited
  };
};