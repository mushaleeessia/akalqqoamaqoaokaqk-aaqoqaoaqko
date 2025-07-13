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
import type { Json } from "@/integrations/supabase/types";

interface Track {
  id: string;
  name: string;
  artist: string;
  audioUrl: string;
  duration: number;
  imageUrl?: string;
}

interface SessionData {
  id: string;
  admin_id: string;
  current_track_id: string | null;
  current_track_name: string | null;
  current_track_artist: string | null;
  current_track_audio_url: string | null;
  current_track_duration: number;
  current_track_image_url: string | null;
  is_playing: boolean;
  track_current_time: number;
  started_at: number;
  queue: Json;
  created_at: string;
  updated_at: string;
}

const ALEEESSIA_ID = "bedf5a3e-ea52-4ba1-bcb4-5e748f4d9654";

export default function ListenTogether() {
  const { user, signInWithDiscord } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [listeners, setListeners] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState("");
  const [newTrackName, setNewTrackName] = useState("");
  const [newTrackArtist, setNewTrackArtist] = useState("");
  const [channel, setChannel] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const isAdmin = user?.id === ALEEESSIA_ID;

  // Parse queue from JSON
  const getQueue = (): Track[] => {
    if (!sessionData?.queue) return [];
    try {
      return Array.isArray(sessionData.queue) ? (sessionData.queue as unknown as Track[]) : [];
    } catch {
      return [];
    }
  };

  // Load or create session
  useEffect(() => {
    if (!user) return;
    loadSession();
  }, [user]);

  // Initialize Supabase channel and real-time updates
  useEffect(() => {
    if (!user || !sessionData) return;

    const musicChannel = supabase
      .channel('listen-together-session')
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listen_together_sessions',
          filter: `id=eq.${sessionData.id}`
        },
        (payload) => {
          console.log('Session updated in DB:', payload);
          if (payload.new && payload.eventType !== 'DELETE') {
            updateSessionFromDB(payload.new as SessionData);
          }
        }
      )
      .subscribe(async (status) => {
        console.log('Channel status:', status);
        if (status === 'SUBSCRIBED') {
          await musicChannel.track({
            user_id: user.id,
            nickname: user.user_metadata?.nickname || 'Anonymous',
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(musicChannel);

    return () => {
      supabase.removeChannel(musicChannel);
    };
  }, [user, sessionData]);

  const loadSession = async () => {
    try {
      // Tentar encontrar sessão existente do admin
      let { data: session } = await supabase
        .from('listen_together_sessions')
        .select('*')
        .eq('admin_id', ALEEESSIA_ID)
        .single();

      if (!session && isAdmin) {
        // Criar nova sessão se for admin e não existir
        const { data: newSession, error } = await supabase
          .from('listen_together_sessions')
          .insert([{ admin_id: ALEEESSIA_ID }])
          .select()
          .single();

        if (error) throw error;
        session = newSession;
      }

      if (session) {
        setSessionData(session);
        updateSessionFromDB(session);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar sessão de música",
        variant: "destructive",
      });
    }
  };

  const updateSessionFromDB = (dbSession: SessionData) => {
    setSessionData(dbSession);
    
    // Sync audio element
    if (audioRef.current && dbSession.current_track_audio_url) {
      const audio = audioRef.current;
      
      // Change track if needed
      if (audio.src !== dbSession.current_track_audio_url) {
        audio.src = dbSession.current_track_audio_url;
        audio.load();
      }
      
      // Sync playback state
      if (dbSession.is_playing && dbSession.started_at > 0) {
        const now = Date.now();
        const expectedTime = (now - dbSession.started_at) / 1000;
        const timeDiff = Math.abs(expectedTime - audio.currentTime);
        
        if (timeDiff > 1) {
          audio.currentTime = Math.max(0, expectedTime);
        }
        
        if (audio.paused) {
          audio.play().catch(console.error);
        }
      } else if (!dbSession.is_playing && !audio.paused) {
        audio.pause();
      }
    }
  };

  // Real-time progress update
  useEffect(() => {
    if (!sessionData?.is_playing || !sessionData.started_at) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expectedTime = (now - sessionData.started_at) / 1000;
      setCurrentTime(Math.max(0, Math.min(expectedTime, sessionData.current_track_duration || 0)));
      
      // Update database for admin every 5 seconds
      if (isAdmin && audioRef.current && Math.floor(expectedTime) % 5 === 0) {
        updateSessionInDB({
          track_current_time: audioRef.current.currentTime
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData?.is_playing, sessionData?.started_at, sessionData?.current_track_duration, isAdmin]);

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
        setCurrentTime(audio.currentTime);
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

  const updateSessionInDB = async (updates: Partial<Omit<SessionData, 'queue'>> & { queue?: Track[] }) => {
    if (!sessionData || !isAdmin) return;
    
    try {
      const dbUpdates: any = { ...updates };
      if (updates.queue) {
        dbUpdates.queue = updates.queue as unknown as Json;
      }
      
      const { error } = await supabase
        .from('listen_together_sessions')
        .update(dbUpdates)
        .eq('id', sessionData.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const handlePlayPause = async () => {
    if (!isAdmin || !sessionData?.current_track_audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    const newIsPlaying = !sessionData.is_playing;
    const updates = {
      is_playing: newIsPlaying,
      started_at: newIsPlaying ? Date.now() - (audio.currentTime * 1000) : 0,
      track_current_time: audio.currentTime
    };

    await updateSessionInDB(updates);
  };

  const playNextTrack = async () => {
    if (!isAdmin || !sessionData) return;
    
    const queue = getQueue();
    if (queue.length === 0) return;

    const nextTrack = queue[0];
    const newQueue = queue.slice(1);
    
    const updates = {
      current_track_id: nextTrack.id,
      current_track_name: nextTrack.name,
      current_track_artist: nextTrack.artist,
      current_track_audio_url: nextTrack.audioUrl,
      current_track_duration: nextTrack.duration,
      current_track_image_url: nextTrack.imageUrl || null,
      queue: newQueue,
      is_playing: true,
      track_current_time: 0,
      started_at: Date.now()
    };

    await updateSessionInDB(updates);
  };

  const skipToNext = () => {
    if (!isAdmin) return;
    playNextTrack();
  };

  const skipToPrevious = async () => {
    if (!isAdmin || !sessionData?.current_track_audio_url) return;

    // Just restart current track
    const updates = {
      track_current_time: 0,
      started_at: Date.now()
    };

    await updateSessionInDB(updates);
  };

  const addTrackToQueue = async () => {
    if (!isAdmin || !newTrackUrl || !newTrackName || !newTrackArtist || !sessionData) {
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

    const currentQueue = getQueue();
    const newQueue = [...currentQueue, newTrack];
    await updateSessionInDB({ queue: newQueue });

    // Clear form
    setNewTrackUrl("");
    setNewTrackName("");
    setNewTrackArtist("");

    toast({
      title: "Música adicionada!",
      description: `${newTrack.name} foi adicionada à fila`,
    });
  };

  const playTrackNow = async (track: Track) => {
    if (!isAdmin || !sessionData) return;

    const currentQueue = getQueue();
    const newQueue = currentQueue.filter(t => t.id !== track.id);
    const updates = {
      current_track_id: track.id,
      current_track_name: track.name,
      current_track_artist: track.artist,
      current_track_audio_url: track.audioUrl,
      current_track_duration: track.duration,
      current_track_image_url: track.imageUrl || null,
      queue: newQueue,
      is_playing: true,
      track_current_time: 0,
      started_at: Date.now()
    };

    await updateSessionInDB(updates);
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

  const queue = getQueue();

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
              {sessionData?.current_track_audio_url ? (
                <>
                  {/* Track Info */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                      {sessionData.current_track_image_url ? (
                        <img 
                          src={sessionData.current_track_image_url} 
                          alt="Album Art" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Music className="w-8 h-8 text-black" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-1">{sessionData.current_track_name}</h2>
                      <p className="text-green-400 text-lg">{sessionData.current_track_artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">SINCRONIZADO</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <Slider
                      value={[currentTime]}
                      max={sessionData.current_track_duration}
                      step={1}
                      className="w-full mb-2"
                      disabled={!isAdmin}
                    />
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(sessionData.current_track_duration)}</span>
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
                            ) : sessionData.is_playing ? (
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
              {queue.length > 0 ? (
                <div className="space-y-3">
                  {queue.map((track, index) => (
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
      {sessionData?.current_track_audio_url && (
        <audio
          ref={audioRef}
          src={sessionData.current_track_audio_url}
          preload="metadata"
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
}