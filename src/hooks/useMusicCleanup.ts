import { useEffect } from 'react';
import { MusicService } from '@/services/musicService';

export const useMusicCleanup = () => {
  useEffect(() => {
    // Clean up expired tracks on component mount
    MusicService.cleanupExpiredTracks();

    // Set up periodic cleanup every 30 minutes
    const interval = setInterval(() => {
      MusicService.cleanupExpiredTracks();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};