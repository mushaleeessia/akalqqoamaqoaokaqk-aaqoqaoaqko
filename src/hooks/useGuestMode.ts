
import { useState, useEffect } from 'react';

interface GuestSession {
  sessionId: string;
  gamesPlayed: Record<string, boolean>;
  currentStreak: Record<string, number>;
}

export const useGuestMode = () => {
  const [isGuest, setIsGuest] = useState(false);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);

  useEffect(() => {
    const guestMode = localStorage.getItem('termo_guest_mode');
    const sessionId = localStorage.getItem('termo_guest_session');
    
    if (guestMode === 'true' && sessionId) {
      setIsGuest(true);
      
      // Load or create guest session
      const savedSession = localStorage.getItem(`termo_guest_data_${sessionId}`);
      if (savedSession) {
        setGuestSession(JSON.parse(savedSession));
      } else {
        const newSession: GuestSession = {
          sessionId,
          gamesPlayed: {},
          currentStreak: {}
        };
        setGuestSession(newSession);
        localStorage.setItem(`termo_guest_data_${sessionId}`, JSON.stringify(newSession));
      }
    }
  }, []);

  const updateGuestSession = (mode: string, won: boolean) => {
    if (!isGuest || !guestSession) return;

    const today = new Date().toDateString();
    const gameKey = `${mode}_${today}`;
    
    const updatedSession = {
      ...guestSession,
      gamesPlayed: {
        ...guestSession.gamesPlayed,
        [gameKey]: won
      },
      currentStreak: {
        ...guestSession.currentStreak,
        [mode]: won ? (guestSession.currentStreak[mode] || 0) + 1 : 0
      }
    };

    setGuestSession(updatedSession);
    localStorage.setItem(`termo_guest_data_${guestSession.sessionId}`, JSON.stringify(updatedSession));
  };

  const hasPlayedToday = (mode: string): boolean => {
    if (!isGuest || !guestSession) return false;
    
    const today = new Date().toDateString();
    const gameKey = `${mode}_${today}`;
    
    return gameKey in guestSession.gamesPlayed;
  };

  const exitGuestMode = () => {
    localStorage.removeItem('termo_guest_mode');
    localStorage.removeItem('termo_guest_session');
    if (guestSession) {
      localStorage.removeItem(`termo_guest_data_${guestSession.sessionId}`);
    }
    setIsGuest(false);
    setGuestSession(null);
  };

  return {
    isGuest,
    guestSession,
    updateGuestSession,
    hasPlayedToday,
    exitGuestMode
  };
};
