
import { useState, useEffect } from 'react';

interface PlayerSession {
  date: string;
  completed: boolean;
  failed: boolean;
  attempts: number;
  ipHash: string;
  guesses: string[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
}

export const usePlayerSession = () => {
  const [canPlay, setCanPlay] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<PlayerSession | null>(null);

  const getTodayDate = () => {
    // Usar horário de Brasília como nos outros hooks
    const now = new Date();
    const brasiliaTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
    return brasiliaTime.toISOString().split('T')[0];
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

  const getSessionKey = () => `termo-solo-session-${getTodayDate()}`;
  const getCookieKey = () => `termo_solo_${getTodayDate()}`;

  const saveSession = (session: PlayerSession) => {
    const sessionKey = getSessionKey();
    const cookieKey = getCookieKey();
    const sessionData = JSON.stringify(session);
    
    console.log(`[Solo Session] Salvando sessão solo:`, session);
    
    localStorage.setItem(sessionKey, sessionData);
    setCookie(cookieKey, sessionData, 1);
  };

  const loadSession = (): PlayerSession | null => {
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
        console.log(`[Solo Session] Carregando sessão solo:`, session);
        return session;
      } catch (error) {
        console.error('[Solo Session] Erro ao parsear sessão:', error);
        localStorage.removeItem(sessionKey);
      }
    }
    
    return null;
  };

  const initializeSession = () => {
    const today = getTodayDate();
    const playerHash = generatePlayerHash();
    
    console.log(`[Solo Session] Inicializando sessão solo`);
    
    const existingSession = loadSession();
    if (existingSession && existingSession.ipHash === playerHash) {
      setSessionInfo(existingSession);
      setCanPlay(!(existingSession.completed || existingSession.failed));
      return;
    }
    
    // Criar nova sessão
    const newSession: PlayerSession = {
      date: today,
      completed: false,
      failed: false,
      attempts: 0,
      ipHash: playerHash,
      guesses: [],
      currentGuess: '',
      gameStatus: 'playing'
    };
    
    saveSession(newSession);
    setSessionInfo(newSession);
    setCanPlay(true);
  };

  const updateSession = (updates: Partial<PlayerSession>) => {
    if (!sessionInfo) return;
    
    const updatedSession: PlayerSession = {
      ...sessionInfo,
      ...updates
    };
    
    saveSession(updatedSession);
    setSessionInfo(updatedSession);
    
    if (updatedSession.completed || updatedSession.failed) {
      setCanPlay(false);
    }
  };

  const saveGameProgress = (guesses: string[], currentGuess: string, gameStatus: 'playing' | 'won' | 'lost') => {
    console.log(`[Solo Session] Salvando progresso - Tentativas: ${guesses.length}, Status: ${gameStatus}`);
    
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
  }, []);

  return {
    canPlay,
    sessionInfo,
    updateSession,
    saveGameProgress
  };
};
