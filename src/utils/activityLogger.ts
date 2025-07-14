import { supabase } from '@/integrations/supabase/client';
import { GameMode } from '@/components/GameModeSelector';

export type ActivityType = 
  | 'game_start'
  | 'mode_change'
  | 'first_game'
  | 'high_streak'
  | 'long_game'
  | 'new_user'
  | 'peak_hours'
  | 'page_visit';

interface ActivityData {
  type: ActivityType;
  userId?: string;
  nickname?: string;
  isGuest?: boolean;
  metadata?: {
    gameMode?: GameMode;
    fromMode?: GameMode;
    toMode?: GameMode;
    streak?: number;
    gameDuration?: number;
    page?: string;
    hourOfDay?: number;
    userAgent?: string;
  };
}

// Rate limiting para evitar spam
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_MS = 5000; // 5 segundos entre logs do mesmo tipo por usuário

export const logActivity = async (data: ActivityData) => {
  try {
    // Rate limiting
    const key = `${data.userId || 'guest'}-${data.type}`;
    const lastLog = rateLimiter.get(key);
    const now = Date.now();
    
    if (lastLog && (now - lastLog) < RATE_LIMIT_MS) {
      return;
    }
    
    rateLimiter.set(key, now);

    // Enviar para edge function
    await supabase.functions.invoke('activity-logger', {
      body: {
        ...data,
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Erro ao enviar log de atividade:', error);
  }
};

// Funções específicas para cada tipo de log
export const logGameStart = (gameMode: GameMode, userId?: string, nickname?: string, isGuest = false) => {
  logActivity({
    type: 'game_start',
    userId,
    nickname,
    isGuest,
    metadata: { gameMode }
  });
};

export const logModeChange = (fromMode: GameMode, toMode: GameMode, userId?: string, nickname?: string, isGuest = false) => {
  logActivity({
    type: 'mode_change',
    userId,
    nickname,
    isGuest,
    metadata: { fromMode, toMode }
  });
};

export const logFirstGame = (gameMode: GameMode, userId: string, nickname?: string) => {
  logActivity({
    type: 'first_game',
    userId,
    nickname,
    isGuest: false,
    metadata: { gameMode }
  });
};

export const logHighStreak = (streak: number, gameMode: GameMode, userId: string, nickname?: string) => {
  logActivity({
    type: 'high_streak',
    userId,
    nickname,
    isGuest: false,
    metadata: { streak, gameMode }
  });
};

export const logLongGame = (duration: number, gameMode: GameMode, userId?: string, nickname?: string, isGuest = false) => {
  logActivity({
    type: 'long_game',
    userId,
    nickname,
    isGuest,
    metadata: { gameDuration: duration, gameMode }
  });
};

export const logNewUser = (userId: string, nickname?: string) => {
  logActivity({
    type: 'new_user',
    userId,
    nickname,
    isGuest: false
  });
};

export const logPageVisit = (page: string, userId?: string, nickname?: string, isGuest = false) => {
  logActivity({
    type: 'page_visit',
    userId,
    nickname,
    isGuest,
    metadata: { 
      page,
      hourOfDay: new Date().getHours(),
      userAgent: navigator.userAgent
    }
  });
};