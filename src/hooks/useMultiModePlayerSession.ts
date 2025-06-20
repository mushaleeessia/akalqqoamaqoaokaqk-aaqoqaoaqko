
import { useState, useEffect } from 'react';
import { GameMode } from '@/components/GameModeSelector';

interface MultiModePlayerSession {
  date: string;
  completed: boolean;
  failed: boolean;
  attempts: number;
  ipHash: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  mode: GameMode;
}

export const useMultiModePlayerSession = (mode: GameMode) => {
  const [canPlay, setCanPlay] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<MultiModePlayerSession | null>(null);

  const getTodayDate = () => {
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0];
  };

  const generatePlayerHash = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const ip = data.ip;
      
      let hash = 0;
      for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      
      return Math.abs(hash).toString();
    } catch (error) {
      const fallback = navigator.userAgent + navigator.language + screen.width + screen.height;
      let hash = 0;
      for (let i = 0; i < fallback.length; i++) {
        const char = fallback.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString();
    }
  };

  const getSessionKey = () => `termo-multi-session-${mode}-${getTodayDate()}`;
  const getCookieKey = () => `termo_multi_${mode}_${getTodayDate()}`;

  const setCookie = (name: string, value: string, days: number = 1) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const saveSession = (session: MultiModePlayerSession) => {
    const sessionKey = getSessionKey();
    const cookieKey = getCookieKey();
    const sessionData = JSON.stringify(session);
    
    localStorage.setItem(sessionKey, sessionData);
    setCookie(cookieKey, sessionData, 1);
    
    // Salvar também por IP
    setCookie(`${cookieKey}_ip_${session.ipHash}`, sessionData, 1);
  };

  const loadSession = async (): Promise<MultiModePlayerSession | null> => {
    const sessionKey = getSessionKey();
    const cookieKey = getCookieKey();
    const playerHash = await generatePlayerHash();
    
    let sessionData = localStorage.getItem(sessionKey);
    
    if (!sessionData) {
      sessionData = getCookie(cookieKey);
    }
    
    if (!sessionData) {
      sessionData = getCookie(`${cookieKey}_ip_${playerHash}`);
    }
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.mode === mode) {
          if (localStorage.getItem(sessionKey) !== sessionData) {
            localStorage.setItem(sessionKey, sessionData);
          }
          return session;
        } else {
          localStorage.removeItem(sessionKey);
          document.cookie = `${cookieKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      } catch (error) {
        localStorage.removeItem(sessionKey);
      }
    }
    
    return null;
  };

  const initializeSession = async () => {
    const today = getTodayDate();
    const playerHash = await generatePlayerHash();
    
    const existingSession = await loadSession();
    if (existingSession && existingSession.ipHash === playerHash) {
      setSessionInfo(existingSession);
      setCanPlay(!(existingSession.completed || existingSession.failed));
      return;
    }
    
    const newSession: MultiModePlayerSession = {
      date: today,
      completed: false,
      failed: false,
      attempts: 0,
      ipHash: playerHash,
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing',
      mode: mode
    };
    
    saveSession(newSession);
    setSessionInfo(newSession);
    setCanPlay(true);
  };

  const updateSession = (updates: Partial<MultiModePlayerSession>) => {
    if (!sessionInfo) return;
    
    const updatedSession: MultiModePlayerSession = {
      ...sessionInfo,
      ...updates,
      mode: mode
    };
    
    saveSession(updatedSession);
    setSessionInfo(updatedSession);
    
    if (updatedSession.completed || updatedSession.failed) {
      setCanPlay(false);
    }
  };

  const saveGameProgress = (guesses: string[], currentGuess: string, gameStatus: 'playing' | 'won' | 'lost') => {
    updateSession({
      guesses,
      currentGuess,
      gameStatus,
      attempts: guesses.length,
      completed: gameStatus === 'won',
      failed: gameStatus === 'lost'
    });
  };

  useEffect(() => {
    initializeSession();
  }, [mode]);

  return {
    canPlay,
    sessionInfo,
    updateSession,
    saveGameProgress
  };
};
