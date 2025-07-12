import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Music, 
  Users, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Volume2, 
  Plus,
  Radio,
  Headphones
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  artist: string;
  audioUrl: string;
  duration: number;
  imageUrl?: string;
}

interface SessionState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  startedAt: number;
  queue: Track[];
}

const ALEEESSIA_ID = "bedf5a3e-ea52-4ba1-bcb4-5e748f4d9654";

export default function ListenTogether() {
  const { user, signInWithDiscord } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [sessionState, setSessionState] = useState<SessionState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    startedAt: 0,
    queue: []
  });
  
  const [listeners, setListeners] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState("");
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackArtist, setNewTrackArtist] = useState("");
  const [channel, setChannel] = useState<any>(null);

  const isAdmin = user?.id === ALEEESSIA_ID;

  // Initialize Supabase channel
  useEffect(() => {
    if (!user) return;

    const musicChannel = supabase
      .channel('spotify-listen-together')
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
      .on('broadcast', { event: 'session-update' }, ({ payload }) => {
        console.log('Session update received:', payload);
        const newState = payload.sessionState;
        setSessionState(newState);
        
        // Force audio sync for received updates
        if (audioRef.current && newState.currentTrack) {
          setTimeout(() => {
            const audio = audioRef.current;
            if (!audio) return;
            
            if (newState.isPlaying && newState.startedAt > 0) {
              const now = Date.now();
              const expectedTime = (now - newState.startedAt) / 1000;
              const timeDiff = Math.abs(expectedTime - audio.currentTime);
              
              if (timeDiff > 0.5) {
                audio.currentTime = Math.max(0, expectedTime);
              }
              
              if (audio.paused) {
                audio.play().catch(console.error);
              }
            } else if (!newState.isPlaying && !audio.paused) {
              audio.pause();
            }
          }, 100);
        }
      })
      .on('broadcast', { event: 'sync-request' }, () => {
        if (isAdmin) {
          console.log('Sync requested, sending current state');
          musicChannel.send({
            type: 'broadcast',
            event: 'session-update',
            payload: { sessionState }
          });
        }
      })
      .subscribe(async (status) => {
        console.log('Channel status:', status);
        if (status === 'SUBSCRIBED') {
          await musicChannel.track({
            user_id: user.id,
            nickname: user.user_metadata?.nickname || 'Anonymous',
            online_at: new Date().toISOString(),
          });
          
          // Request sync when joining (non-admin users)
          if (!isAdmin) {
            setTimeout(() => {
              musicChannel.send({
                type: 'broadcast',
                event: 'sync-request'
              });
            }, 1000);
          }
        }
      });

    setChannel(musicChannel);

    return () => {
      supabase.removeChannel(musicChannel);
    };
  }, [user, isAdmin]);

  // Sync audio with session state and update progress
  useEffect(() => {
    if (!audioRef.current || !sessionState.currentTrack) return;

    const audio = audioRef.current;
    
    // Update current time for UI display (non-admin users)
    if (!isAdmin && sessionState.isPlaying && sessionState.startedAt > 0) {
      const now = Date.now();
      const expectedTime = (now - sessionState.startedAt) / 1000;
      setSessionState(prev => ({ ...prev, currentTime: Math.max(0, expectedTime) }));
    }

    // Sync audio playback
    if (sessionState.isPlaying && sessionState.startedAt > 0) {
      const now = Date.now();
      const expectedTime = (now - sessionState.startedAt) / 1000;
      const actualTime = audio.currentTime;
      const timeDiff = Math.abs(expectedTime - actualTime);

      // Sync if difference is more than 1 second
      if (timeDiff > 1) {
        audio.currentTime = Math.max(0, expectedTime);
      }

      if (audio.paused) {
        audio.play().catch(console.error);
      }
    } else if (!sessionState.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [sessionState, isAdmin]);

  // Real-time progress update for non-admin users
  useEffect(() => {
    if (!sessionState.isPlaying || isAdmin || sessionState.startedAt === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expectedTime = (now - sessionState.startedAt) / 1000;
      setSessionState(prev => ({ 
        ...prev, 
        currentTime: Math.max(0, Math.min(expectedTime, sessionState.currentTrack?.duration || 0))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState.isPlaying, sessionState.startedAt, sessionState.currentTrack?.duration, isAdmin]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (isAdmin) {
        setSessionState(prev => ({ ...prev, currentTime: audio.currentTime }));
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      toast({
        title: "Erro no áudio",
        description: "Não foi possível carregar o áudio",
        variant: "destructive",
      });
    };

    const handleEnded = () => {
      if (isAdmin) {
        playNextTrack();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isAdmin, toast]);

  const broadcastSessionUpdate = (newState: SessionState) => {
    if (!channel) return;
    
    channel.send({
      type: 'broadcast',
      event: 'session-update',
      payload: { sessionState: newState }
    });
  };

  const handlePlayPause = () => {
    if (!isAdmin || !sessionState.currentTrack) return;

    const audio = audioRef.current;
    if (!audio) return;

    const newState = {
      ...sessionState,
      isPlaying: !sessionState.isPlaying,
      startedAt: sessionState.isPlaying ? 0 : Date.now() - (audio.currentTime * 1000),
      currentTime: audio.currentTime
    };

    setSessionState(newState);
    broadcastSessionUpdate(newState);
  };

  const playNextTrack = () => {
    if (!isAdmin || sessionState.queue.length === 0) return;

    const nextTrack = sessionState.queue[0];
    const newQueue = sessionState.queue.slice(1);
    
    const newState = {
      ...sessionState,
      currentTrack: nextTrack,
      queue: newQueue,
      isPlaying: true,
      currentTime: 0,
      startedAt: Date.now()
    };

    setSessionState(newState);
    broadcastSessionUpdate(newState);
  };

  const skipToNext = () => {
    if (!isAdmin) return;
    playNextTrack();
  };

  const skipToPrevious = () => {
    if (!isAdmin || !sessionState.currentTrack) return;

    // Just restart current track
    const newState = {
      ...sessionState,
      currentTime: 0,
      startedAt: Date.now()
    };

    setSessionState(newState);
    broadcastSessionUpdate(newState);
  };

  const addTrackToQueue = () => {
    if (!isAdmin || !newTrackUrl || !newTrackName || !newTrackArtist) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const newTrack: Track = {
      id: Date.now().toString(),
      name: newTrackName,
      artist: newTrackArtist,
      audioUrl: newTrackUrl,
      duration: 180, // Default 3 minutes
    };

    const newState = {
      ...sessionState,
      queue: [...sessionState.queue, newTrack]
    };

    setSessionState(newState);
    broadcastSessionUpdate(newState);

    // Clear form
    setNewTrackUrl("");
    setNewTrackName("");
    setNewTrackArtist("");

    toast({
      title: "Música adicionada!",
      description: `${newTrack.name} foi adicionada à fila`,
    });
  };

  const playTrackNow = (track: Track) => {
    if (!isAdmin) return;

    const newState = {
      ...sessionState,
      currentTrack: track,
      queue: sessionState.queue.filter(t => t.id !== track.id),
      isPlaying: true,
      currentTime: 0,
      startedAt: Date.now()
    };

    setSessionState(newState);
    broadcastSessionUpdate(newState);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black flex items-center justify-center">
        <Card className="bg-black/80 backdrop-blur border-green-500/20 p-8 text-center max-w-md w-full mx-4">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Radio className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Listen Together</h1>
          <p className="text-green-400 font-semibold mb-4">Sincronização em Tempo Real</p>
          <p className="text-gray-300 mb-6 text-sm">
            Entre para ouvir música sincronizada com todos os usuários em tempo real
          </p>
          <Button
            onClick={signInWithDiscord}
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 px-6 rounded-full flex items-center justify-center gap-3 transition-all duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entrar com Discord
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-black text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur border-b border-green-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <Radio className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Listen Together</h1>
              <p className="text-green-400 text-sm">
                {isAdmin ? "🎛️ Você está no controle" : "🎧 Escutando junto"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <span className="font-semibold">{listeners}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur border-green-500/20 p-6">
              {sessionState.currentTrack ? (
                <>
                  {/* Track Info */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      {sessionState.currentTrack.imageUrl ? (
                        <img 
                          src={sessionState.currentTrack.imageUrl} 
                          alt="Album Art" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Music className="w-8 h-8 text-black" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-1">{sessionState.currentTrack.name}</h2>
                      <p className="text-green-400 text-lg">{sessionState.currentTrack.artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">SINCRONIZADO</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <Slider
                      value={[sessionState.currentTime]}
                      max={sessionState.currentTrack.duration}
                      step={1}
                      className="w-full mb-2"
                      disabled={!isAdmin}
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatTime(sessionState.currentTime)}</span>
                      <span>{formatTime(sessionState.currentTrack.duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isAdmin ? (
                        <>
                          <Button
                            onClick={skipToPrevious}
                            size="sm"
                            variant="ghost"
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <SkipBack className="w-5 h-5" />
                          </Button>
                          <Button
                            onClick={handlePlayPause}
                            disabled={isLoading}
                            size="lg"
                            className="bg-green-500 hover:bg-green-600 text-black rounded-full w-14 h-14 p-0"
                          >
                            {isLoading ? (
                              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : sessionState.isPlaying ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6 ml-1" />
                            )}
                          </Button>
                          <Button
                            onClick={skipToNext}
                            size="sm"
                            variant="ghost"
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <SkipForward className="w-5 h-5" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Headphones className="w-5 h-5" />
                          <span className="text-sm">Controles disponíveis apenas para o admin</span>
                        </div>
                      )}
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-3 w-32">
                      <Volume2 className="w-5 h-5 text-green-400" />
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setVolume(value[0])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-400">Nenhuma música tocando</h3>
                  <p className="text-gray-500">
                    {isAdmin ? "Adicione uma música para começar" : "Aguarde o admin adicionar uma música"}
                  </p>
                </div>
              )}
            </Card>

            {/* Add Track (Admin Only) */}
            {isAdmin && (
              <Card className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur border-green-500/20 p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-green-400">Adicionar Música</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="URL do áudio (JukeHost)"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Nome da música"
                      value={newTrackName}
                      onChange={(e) => setNewTrackName(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white"
                    />
                    <Input
                      placeholder="Artista"
                      value={newTrackArtist}
                      onChange={(e) => setNewTrackArtist(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={addTrackToQueue}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar à Fila
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Queue */}
          <div>
            <Card className="bg-gradient-to-br from-gray-800/80 to-black/80 backdrop-blur border-green-500/20 p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Fila de Reprodução</h3>
              {sessionState.queue.length > 0 ? (
                <div className="space-y-3">
                  {sessionState.queue.map((track, index) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-colors"
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      {isAdmin && (
                        <Button
                          onClick={() => playTrackNow(track)}
                          size="sm"
                          variant="ghost"
                          className="text-green-400 hover:text-green-300 hover:bg-green-500/10 flex-shrink-0"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <p className="text-gray-500 text-sm">Fila vazia</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {sessionState.currentTrack && (
        <audio
          ref={audioRef}
          src={sessionState.currentTrack.audioUrl}
          preload="metadata"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}