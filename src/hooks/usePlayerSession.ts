
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
    return new Date().toISOString().split('T')[0];
  };

  // Gerar um hash simples do IP (simulado pelo browser fingerprint)
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
    
    // Hash simples
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString();
  };

  // Utilitários para cookies
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

  const saveSession = (session: PlayerSession) => {
    const today = getTodayDate();
    const sessionKey = `termo-session-${today}`;
    const cookieKey = `termo_session_${today}`;
    
    const sessionData = JSON.stringify(session);
    
    // Salvar no localStorage
    localStorage.setItem(sessionKey, sessionData);
    
    // Salvar no cookie como backup
    setCookie(cookieKey, sessionData, 1);
  };

  const loadSession = (): PlayerSession | null => {
    const today = getTodayDate();
    const sessionKey = `termo-session-${today}`;
    const cookieKey = `termo_session_${today}`;
    
    // Tentar carregar do localStorage primeiro
    let sessionData = localStorage.getItem(sessionKey);
    
    // Se não encontrar no localStorage, tentar no cookie
    if (!sessionData) {
      sessionData = getCookie(cookieKey);
      if (sessionData) {
        // Se encontrou no cookie, restaurar no localStorage
        localStorage.setItem(sessionKey, sessionData);
      }
    }
    
    if (sessionData) {
      try {
        return JSON.parse(sessionData);
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
      // Verificar se é o mesmo "jogador" (mesmo hash)
      if (existingSession.ipHash === playerHash) {
        setSessionInfo(existingSession);
        
        if (existingSession.completed || existingSession.failed) {
          setCanPlay(false);
        } else {
          setCanPlay(true);
        }
        return;
      }
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
  }, []);

  return {
    canPlay,
    sessionInfo,
    updateSession,
    saveGameProgress
  };
};
