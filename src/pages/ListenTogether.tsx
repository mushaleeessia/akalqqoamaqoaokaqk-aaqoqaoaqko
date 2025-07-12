import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Users, Play, Pause, SkipForward, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

export default function ListenTogether() {
  const { user, signInWithDiscord } = useAuth();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const ALEEESSIA_ID = "bedf5a3e-ea52-4ba1-bcb4-5e748f4d9654";
  const isAdmin = user?.id === ALEEESSIA_ID;

  // Demo track
  const demoTrack = {
    name: "The place where it rained",
    artist: "DelTarune",
    audioUrl: "https://audio.jukehost.co.uk/CtlkY10vzGjBSZx7vxgDiodDCWsokOVS",
    imageUrl: "/lovable-uploads/71211bb9-eabf-4f43-9ff4-1fc3091d6f28.png"
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      toast({
        title: "Erro no áudio",
        description: "Não foi possível carregar o áudio",
        variant: "destructive",
      });
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [toast]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
          toast({
            title: "Erro de reprodução",
            description: "Não foi possível reproduzir o áudio",
            variant: "destructive",
          });
        });
    }
  };

  const handleSeek = (newTime: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="max-w-4xl mx-auto">
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
            <span>1 ouvinte</span>
          </div>
        </div>

        {/* Music Player */}
        <Card className="bg-black/40 backdrop-blur border-white/20 p-6">
          <div className="flex items-center gap-6">
            {/* Album Art */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              {demoTrack.imageUrl ? (
                <img 
                  src={demoTrack.imageUrl} 
                  alt="Album Art" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Music className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Track Info & Controls */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">{demoTrack.name}</h3>
                <p className="text-white/70">{demoTrack.artist}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-white/60 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  size="lg"
                  className="bg-primary hover:bg-primary/80 text-white rounded-full w-12 h-12 p-0"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </Button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1 max-w-32">
                  <Volume2 className="w-5 h-5 text-white/70" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVolume(value[0])}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">ÁUDIO SINCRONIZADO ATIVO</span>
            </div>
            <p className="text-xs text-green-300/80 mt-1">
              Todos os usuários ouvem exatamente no mesmo momento
            </p>
          </div>
        </Card>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={demoTrack.audioUrl}
          preload="metadata"
          style={{ display: 'none' }}
        />

        {/* Demo Message */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Esta é uma versão de demonstração do Listen Together
          </p>
        </div>
      </div>
    </div>
  );
}