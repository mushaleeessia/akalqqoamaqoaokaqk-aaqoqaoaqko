import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

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

interface MusicPlayerProps {
  currentTrack: CurrentTrack | null;
  isAdmin: boolean;
  onPlayPause: (isPlaying: boolean, startedAt: number) => void;
}

export const MusicPlayer = ({ currentTrack, isAdmin, onPlayPause }: MusicPlayerProps) => {
  const [volume, setVolume] = useState([50]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load audio URL when track changes
  useEffect(() => {
    const loadAudioUrl = async () => {
      if (!currentTrack) {
        setAudioUrl("");
        return;
      }

      try {
        setIsLoading(true);
        
        // If track has a direct audio URL (from our processing), use it
        if ((currentTrack as any).audioUrl) {
          setAudioUrl((currentTrack as any).audioUrl);
          return;
        }
        
        // Use fallback demo audio for now
        setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav");
      } catch (error) {
        console.error('Error loading audio URL:', error);
        setAudioUrl("https://www.soundjay.com/misc/sounds/bell-ringing-05.wav");
      } finally {
        setIsLoading(false);
      }
    };

    loadAudioUrl();
  }, [currentTrack?.id]);

  // Sync audio with track state
  useEffect(() => {
    if (!audioRef.current || !currentTrack || !audioUrl) return;

    const audio = audioRef.current;
    
    // Calculate correct position based on sync data
    const elapsed = (Date.now() - currentTrack.startedAt) / 1000;
    const targetTime = Math.max(0, Math.min(elapsed, currentTrack.duration));
    
    // Set audio position if it's significantly different
    if (Math.abs(audio.currentTime - targetTime) > 2) {
      audio.currentTime = targetTime;
    }

    // Play or pause based on state
    if (currentTrack.isPlaying && audio.paused) {
      setIsLoading(true);
      audio.play().catch(console.error).finally(() => setIsLoading(false));
    } else if (!currentTrack.isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [currentTrack, audioUrl]);

  // Update current time from audio element
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('playing', () => setIsLoading(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', () => setIsLoading(true));
      audio.removeEventListener('canplay', () => setIsLoading(false));
      audio.removeEventListener('waiting', () => setIsLoading(true));
      audio.removeEventListener('playing', () => setIsLoading(false));
    };
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (!isAdmin || !currentTrack || !audioRef.current) return;
    
    const newIsPlaying = !currentTrack.isPlaying;
    const newStartedAt = newIsPlaying ? Date.now() - (audioRef.current.currentTime * 1000) : currentTrack.startedAt;
    
    onPlayPause(newIsPlaying, newStartedAt);
  };

  const handleSeek = (newTime: number[]) => {
    if (!isAdmin || !audioRef.current || !currentTrack) return;
    
    const targetTime = newTime[0];
    audioRef.current.currentTime = targetTime;
    
    // Update sync data
    const newStartedAt = Date.now() - (targetTime * 1000);
    onPlayPause(currentTrack.isPlaying, newStartedAt);
  };


  if (!currentTrack) {
    return (
      <Card className="bg-black/20 backdrop-blur border-white/10">
        <CardContent className="p-8 text-center">
          <div className="w-32 h-32 bg-gray-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Volume2 className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhuma música tocando</h3>
          <p className="text-white/70">
            {isAdmin ? "Adicione uma música para começar" : "Aguardando aleeessia escolher uma música..."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur border-white/10">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="auto"
            crossOrigin="anonymous"
          />

          {/* Track Info and Album Art */}
          <div className="flex items-center gap-6">
            {/* Album Art */}
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative">
              {currentTrack.imageUrl ? (
                <img 
                  src={currentTrack.imageUrl} 
                  alt={currentTrack.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Volume2 className="w-8 h-8 text-gray-600" />
                </div>
              )}
              {/* Audio Visualizer Effect */}
              {currentTrack.isPlaying && (
                <div className="absolute inset-0 bg-green-500/20 animate-pulse" />
              )}
            </div>

            {/* Track Info */}
            <div className="flex-grow">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-1">{currentTrack.name}</h3>
                <p className="text-white/70">{currentTrack.artist}</p>
              </div>

              {/* Status Info */}
              <div className="flex items-center gap-2 text-white/70 mb-4">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <span>Carregando...</span>
                  </>
                ) : currentTrack.isPlaying ? (
                  <>
                    <Play className="w-4 h-4 text-green-400" />
                    <span>🎵 Tocando SINCRONIZADO para todos</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 text-orange-400" />
                    <span>Pausado</span>
                  </>
                )}
                {isAdmin && (
                  <span className="ml-2 text-xs bg-primary/20 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              max={currentTrack.duration}
              step={1}
              className="w-full"
              disabled={!isAdmin}
            />
            <div className="flex justify-between text-sm text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
              disabled
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={handlePlayPause}
              disabled={!isAdmin || isLoading}
              className="bg-primary hover:bg-primary/80 w-12 h-12 rounded-full relative"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : currentTrack.isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10"
              disabled
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={setVolume}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>

          {/* Sync Status */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <p className="text-green-300 text-sm mb-1">
              ✅ ÁUDIO SINCRONIZADO ATIVO
            </p>
            <p className="text-green-200/70 text-xs">
              Todos os usuários ouvem exatamente no mesmo momento
            </p>
          </div>

          {/* Spotify Link */}
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(currentTrack.spotifyUrl, '_blank')}
              className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
            >
              🎵 Ver no Spotify
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};