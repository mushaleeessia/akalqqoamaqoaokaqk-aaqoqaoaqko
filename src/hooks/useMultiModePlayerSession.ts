
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
    
    console.log(`[Session] Salvando sessão para modo ${mode}:`, session);
    
    localStorage.setItem(sessionKey, sessionData);
    setCookie(cookieKey, sessionData, 1);
  };

  const loadSession = (): MultiModePlayerSession | null => {
    const sessionKey = getSessionKey();
    const cookieKey = getCookieKey();
    
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
        if (session.mode === mode) {
          console.log(`[Session] Carregando sessão para modo ${mode}:`, session);
          return session;
        } else {
          console.log(`[Session] Sessão inválida: esperado ${mode}, encontrado ${session.mode}`);
          localStorage.removeItem(sessionKey);
          document.cookie = `${cookieKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
      } catch (error) {
        console.error('[Session] Erro ao parsear sessão:', error);
        localStorage.removeItem(sessionKey);
      }
    }
    
    return null;
  };

  const initializeSession = () => {
    const today = getTodayDate();
    const playerHash = generatePlayerHash();
    
    console.log(`[Session] Inicializando sessão para modo ${mode}`);
    
    const existingSession = loadSession();
    if (existingSession && existingSession.ipHash === playerHash) {
      setSessionInfo(existingSession);
      setCanPlay(!(existingSession.completed || existingSession.failed));
      return;
    }
    
    // Criar nova sessão
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
    console.log(`[Session] Salvando progresso - Tentativas: ${guesses.length}, Status: ${gameStatus}`);
    
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
