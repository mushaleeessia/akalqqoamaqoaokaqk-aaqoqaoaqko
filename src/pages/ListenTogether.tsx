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
  const { user } = useAuth();
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
        <Card className="p-8 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Listen Together</h1>
          <p className="text-muted-foreground mb-4">
            Você precisa estar logado para participar da sessão de música
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Fazer Login
          </Button>
        </Card>
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