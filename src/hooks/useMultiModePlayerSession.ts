
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
    return new Date().toISOString().split('T')[0];
  };

  const generatePlayerHash = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Player fingerprint', 2, 2);
    }
    
    const fingerprint = canvas.toDataURL() + 
                       navigator.userAgent + 
                       navigator.language + 
                       screen.width + 
                       screen.height;
    
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString();
  };

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
    const today = getTodayDate();
    // Chaves específicas por modo para isolar as sessões
    const sessionKey = `termo-session-${mode}-${today}`;
    const cookieKey = `termo_session_${mode}_${today}`;
    
    const sessionData = JSON.stringify(session);
    
    localStorage.setItem(sessionKey, sessionData);
    setCookie(cookieKey, sessionData, 1);
  };

  const loadSession = (): MultiModePlayerSession | null => {
    const today = getTodayDate();
    // Chaves específicas por modo
    const sessionKey = `termo-session-${mode}-${today}`;
    const cookieKey = `termo_session_${mode}_${today}`;
    
    let sessionData = localStorage.getItem(sessionKey);
    
    if (!sessionData) {
      sessionData = getCookie(cookieKey);
      if (sessionData) {
        localStorage.setItem(sessionKey, sessionData);
      }
    }
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Verificar se a sessão é do modo correto
        if (session.mode === mode) {
          return session;
        }
      } catch (error) {
        return null;
      }
    }
    
    return null;
  };

  const checkPlayerSession = () => {
    const today = getTodayDate();
    const playerHash = generatePlayerHash();
    
    const existingSession = loadSession();
    if (existingSession) {
      if (existingSession.ipHash === playerHash && existingSession.mode === mode) {
        setSessionInfo(existingSession);
        
        if (existingSession.completed || existingSession.failed) {
          setCanPlay(false);
        } else {
          setCanPlay(true);
        }
        return;
      }
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
      mode: mode // Garantir que o modo está sempre correto
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
    checkPlayerSession();
  }, [mode]);

  return {
    canPlay,
    sessionInfo,
    updateSession,
    saveGameProgress
  };
};
