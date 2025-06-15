
import { useState, useRef, useEffect } from 'react';
import { Music, Music2 } from 'lucide-react';

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // URL do áudio fornecido
  const audioUrl = "https://jmp.sh/s/F8NXAZVprnbU8lorS5K6";

  useEffect(() => {
    // Criar elemento de áudio
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true;
    
    // Event listeners
    const audio = audioRef.current;
    
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      console.log('Erro ao carregar o áudio');
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-40">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className={`
          w-16 h-16 rounded-full 
          bg-gradient-to-br from-red-400 via-red-500 to-pink-600
          hover:from-red-500 hover:via-red-600 hover:to-pink-700
          shadow-lg shadow-red-500/40
          flex items-center justify-center
          transition-all duration-300
          ${isPlaying ? 'animate-pulse scale-110' : 'hover:scale-105'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          border-2 border-red-300/50
        `}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Music2 className="w-7 h-7 text-white" />
        ) : (
          <Music className="w-7 h-7 text-white" />
        )}
      </button>
      
      {/* Efeito de ondas quando tocando */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-full">
          <div className="absolute inset-0 rounded-full bg-red-400/30 animate-ripple"></div>
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ripple-delay"></div>
        </div>
      )}
    </div>
  );
};
