
import { useState, useEffect } from 'react';

interface PlayerSession {
  date: string;
  completed: boolean;
  failed: boolean;
  attempts: number;
  ipHash: string;
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

  const checkPlayerSession = () => {
    const today = getTodayDate();
    const playerHash = generatePlayerHash();
    const sessionKey = `termo-session-${today}`;
    
    const existingSession = localStorage.getItem(sessionKey);
    if (existingSession) {
      const session: PlayerSession = JSON.parse(existingSession);
      
      // Verificar se é o mesmo "jogador" (mesmo hash)
      if (session.ipHash === playerHash && (session.completed || session.failed)) {
        setCanPlay(false);
        setSessionInfo(session);
        return;
      }
    }
    
    // Criar nova sessão
    const newSession: PlayerSession = {
      date: today,
      completed: false,
      failed: false,
      attempts: 0,
      ipHash: playerHash
    };
    
    localStorage.setItem(sessionKey, JSON.stringify(newSession));
    setSessionInfo(newSession);
    setCanPlay(true);
  };

  const updateSession = (completed: boolean, failed: boolean) => {
    if (!sessionInfo) return;
    
    const today = getTodayDate();
    const sessionKey = `termo-session-${today}`;
    
    const updatedSession: PlayerSession = {
      ...sessionInfo,
      completed,
      failed,
      attempts: sessionInfo.attempts + 1
    };
    
    localStorage.setItem(sessionKey, JSON.stringify(updatedSession));
    setSessionInfo(updatedSession);
    
    if (completed || failed) {
      setCanPlay(false);
    }
  };

  useEffect(() => {
    checkPlayerSession();
  }, []);

  return {
    canPlay,
    sessionInfo,
    updateSession
  };
};
