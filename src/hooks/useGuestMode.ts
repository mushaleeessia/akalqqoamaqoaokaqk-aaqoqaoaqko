
import { useState, useEffect } from 'react';

export const useGuestMode = () => {
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem('termo_guest_mode');
    setIsGuestMode(guestMode === 'true');
  }, []);

  const enableGuestMode = () => {
    localStorage.setItem('termo_guest_mode', 'true');
    setIsGuestMode(true);
  };

  const disableGuestMode = () => {
    localStorage.removeItem('termo_guest_mode');
    setIsGuestMode(false);
  };

  const saveGuestGameSession = (mode: string, guesses: string[], won: boolean) => {
    if (!isGuestMode) return;

    // Update guest stats
    const statsKey = `termo_guest_stats_${mode}`;
    const existingStats = localStorage.getItem(statsKey);
    
    let stats = {
      total_games: 0,
      total_wins: 0,
      total_losses: 0,
      win_streak: 0,
      max_win_streak: 0,
      average_attempts: 0
    };

    if (existingStats) {
      stats = JSON.parse(existingStats);
    }

    const newWinStreak = won ? stats.win_streak + 1 : 0;
    const newMaxWinStreak = Math.max(newWinStreak, stats.max_win_streak);
    const totalGames = stats.total_games + 1;
    const totalWins = stats.total_wins + (won ? 1 : 0);
    const totalLosses = stats.total_losses + (won ? 0 : 1);
    
    const currentAvg = stats.average_attempts || 0;
    const newAverage = ((currentAvg * stats.total_games) + guesses.length) / totalGames;

    const updatedStats = {
      ...stats,
      win_streak: newWinStreak,
      max_win_streak: newMaxWinStreak,
      total_games: totalGames,
      total_wins: totalWins,
      total_losses: totalLosses,
      average_attempts: newAverage
    };

    localStorage.setItem(statsKey, JSON.stringify(updatedStats));

    // Save session to prevent playing again today
    const today = new Date().toISOString().split('T')[0];
    const sessionKey = `termo_guest_session_${mode}_${today}`;
    localStorage.setItem(sessionKey, JSON.stringify({
      guesses,
      won,
      completed_at: new Date().toISOString()
    }));
  };

  const checkGuestSession = (mode: string) => {
    if (!isGuestMode) return null;

    const today = new Date().toISOString().split('T')[0];
    const sessionKey = `termo_guest_session_${mode}_${today}`;
    const session = localStorage.getItem(sessionKey);
    
    return session ? JSON.parse(session) : null;
  };

  return {
    isGuestMode,
    enableGuestMode,
    disableGuestMode,
    saveGuestGameSession,
    checkGuestSession
  };
};
