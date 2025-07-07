import { useState, useEffect } from "react";
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

  // Update current time based on track progress
  useEffect(() => {
    if (!currentTrack || !currentTrack.isPlaying) return;

    const interval = setInterval(() => {
      const elapsed = (Date.now() - currentTrack.startedAt) / 1000;
      setCurrentTime(Math.min(elapsed, currentTrack.duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTrack]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!isAdmin || !currentTrack) return;
    
    const newIsPlaying = !currentTrack.isPlaying;
    const newStartedAt = newIsPlaying ? Date.now() - (currentTime * 1000) : currentTrack.startedAt;
    
    onPlayPause(newIsPlaying, newStartedAt);
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
          {/* Track Info and Album Art */}
          <div className="flex items-center gap-6">
            {/* Album Art */}
            <div className="w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
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
            </div>

            {/* Track Info */}
            <div className="flex-grow">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-white mb-1">{currentTrack.name}</h3>
                <p className="text-white/70">{currentTrack.artist}</p>
              </div>

              {/* Status Info */}
              <div className="flex items-center gap-2 text-white/70 mb-4">
                {currentTrack.isPlaying ? (
                  <>
                    <Play className="w-4 h-4 text-green-400" />
                    <span>Tocando para {isAdmin ? 'todos' : 'você'}</span>
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
              disabled={!isAdmin}
              className="bg-primary hover:bg-primary/80 w-12 h-12 rounded-full"
            >
              {currentTrack.isPlaying ? (
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

          {/* Spotify Embed */}
          <div className="w-full space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <p className="text-blue-300 text-sm mb-2">
                🎵 Para ouvir a música, clique no botão ▶️ do Spotify abaixo
              </p>
              <p className="text-blue-200/70 text-xs">
                (Devido às políticas do navegador, é necessário interação manual)
              </p>
            </div>
            <iframe 
              src={`https://open.spotify.com/embed/track/${currentTrack.id}?utm_source=generator&theme=0&autoplay=1`}
              width="100%" 
              height="152" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              className="rounded-lg"
            />
          </div>

          {/* Sync Info */}
          <div className="text-xs text-white/50 text-center space-y-1">
            <p>🎵 Use os controles acima para pausar/tocar (sincronizado)</p>
            <p>▶️ Use o player do Spotify acima para ouvir o áudio</p>
            <p>⚡ Mudanças {isAdmin ? 'suas' : 'da aleeessia'} são sincronizadas para todos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};