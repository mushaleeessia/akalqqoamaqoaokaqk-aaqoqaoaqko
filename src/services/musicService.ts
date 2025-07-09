import { supabase } from "@/integrations/supabase/client";

export interface ProcessedTrack {
  id: string;
  name: string;
  artist: string;
  spotifyUrl: string;
  audioUrl: string;
  duration: number;
  imageUrl?: string;
}

export class MusicService {
  static async processSpotifyTrack(spotifyUrl: string): Promise<ProcessedTrack> {
    const { data, error } = await supabase.functions.invoke('music-processor', {
      body: {
        spotifyUrl,
        action: 'process'
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error || 'Failed to process track');

    return data.track;
  }

  static async getAudioUrl(trackId: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('music-processor', {
      body: {
        trackId,
        action: 'get_audio'
      }
    });

    if (error) throw error;
    return data.audioUrl;
  }

  static async getStoredTracks() {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async cleanupExpiredTracks() {
    const { error } = await supabase.rpc('cleanup_expired_tracks');
    if (error) console.error('Failed to cleanup tracks:', error);
  }
}