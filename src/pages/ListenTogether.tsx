import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import { MusicController } from "@/components/music/MusicController";
import { MusicQueue } from "@/components/music/MusicQueue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CurrentTrack {
  id: string;
  name: string;
  artist: string;
  spotifyUrl: string;
  imageUrl?: string;
  duration: number;
  startedAt: number;
  isPlaying: boolean;
}

interface QueueTrack {
  id: string;
  name: string;
  artist: string;
  spotifyUrl: string;
  imageUrl?: string;
  addedBy: string;
}

const ALEEESSIA_ID = "bedf5a3e-ea52-4ba1-bcb4-5e748f4d9654";

export default function ListenTogether() {
  const { user, signInWithDiscord } = useAuth();
  const { toast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null);
  const [queue, setQueue] = useState<QueueTrack[]>([]);
  const [listeners, setListeners] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    setIsAdmin(user.id === ALEEESSIA_ID);
    
    // Subscribe to music state channel
    const musicChannel = supabase
      .channel('music-room')
      .on('presence', { event: 'sync' }, () => {
        const state = musicChannel.presenceState();
        setListeners(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .on('broadcast', { event: 'track-change' }, ({ payload }) => {
        setCurrentTrack(payload.track);
      })
      .on('broadcast', { event: 'queue-update' }, ({ payload }) => {
        setQueue(payload.queue);
      })
      .on('broadcast', { event: 'play-pause' }, ({ payload }) => {
        setCurrentTrack(prev => prev ? { ...prev, isPlaying: payload.isPlaying, startedAt: payload.startedAt } : null);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await musicChannel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(musicChannel);
    };
  }, [user]);

  const broadcastTrackChange = async (track: CurrentTrack) => {
    await supabase
      .channel('music-room')
      .send({
        type: 'broadcast',
        event: 'track-change',
        payload: { track }
      });
  };

  const broadcastQueueUpdate = async (newQueue: QueueTrack[]) => {
    await supabase
      .channel('music-room')
      .send({
        type: 'broadcast',
        event: 'queue-update',
        payload: { queue: newQueue }
      });
  };

  const broadcastPlayPause = async (isPlaying: boolean, startedAt: number) => {
    await supabase
      .channel('music-room')
      .send({
        type: 'broadcast',
        event: 'play-pause',
        payload: { isPlaying, startedAt }
      });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-black/20 backdrop-blur border-white/10 p-8 text-center">
            <Music className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl font-bold text-white mb-4">Listen Together</h1>
            <p className="text-white/80 mb-6">
              Você precisa estar logado para participar da sessão de música sincronizada
            </p>
            <Button
              onClick={signInWithDiscord}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Entrar com Discord
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Music className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white">Listen Together</h1>
              <p className="text-white/70">
                {isAdmin ? "Você está controlando a música para todos" : "Escutando junto com a galera"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Users className="w-5 h-5" />
            <span>{listeners} ouvintes</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <MusicPlayer 
              currentTrack={currentTrack}
              isAdmin={isAdmin}
              onPlayPause={(isPlaying, startedAt) => broadcastPlayPause(isPlaying, startedAt)}
            />
            
            {isAdmin && (
              <div className="mt-6">
                <MusicController 
                  onTrackSelect={(track) => {
                    setCurrentTrack(track);
                    broadcastTrackChange(track);
                  }}
                  onQueueUpdate={(newQueue) => {
                    setQueue(newQueue);
                    broadcastQueueUpdate(newQueue);
                  }}
                  currentQueue={queue}
                />
              </div>
            )}
          </div>

          {/* Queue */}
          <div>
            <MusicQueue 
              queue={queue}
              isAdmin={isAdmin}
              onRemoveTrack={(trackId) => {
                if (isAdmin) {
                  const newQueue = queue.filter(track => track.id !== trackId);
                  setQueue(newQueue);
                  broadcastQueueUpdate(newQueue);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}