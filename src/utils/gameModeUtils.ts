
import { GameMode } from "@/components/GameModeSelector";

export const getMaxAttempts = (gameMode: GameMode) => {
  switch (gameMode) {
    case 'solo': return 6;
    case 'duo': return 8;
    case 'trio': return 9;
    case 'quarteto': return 10;
    case 'infinity': return 6;
    default: return 6;
  }
};

export const getModeEmoji = (gameMode: GameMode) => {
  switch (gameMode) {
    case 'solo': return '🎯';
    case 'duo': return '👥';
    case 'trio': return '👨‍👩‍👧';
    case 'quarteto': return '👨‍👩‍👧‍👦';
    case 'infinity': return '♾️';
    default: return '🎯';
  }
};

export const getModeLabel = (gameMode: GameMode) => {
  switch (gameMode) {
    case 'solo': return 'Solo';
    case 'duo': return 'Duo';
    case 'trio': return 'Trio';
    case 'quarteto': return 'Quarteto';
    case 'infinity': return 'Infinity';
    default: return 'Solo';
  }
};
