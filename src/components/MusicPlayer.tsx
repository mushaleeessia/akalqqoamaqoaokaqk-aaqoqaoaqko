
import { useState, useRef, useEffect } from 'react';
import { Disc } from 'lucide-react';

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // URL do áudio atualizado
  const audioUrl = "https://cdn.discordapp.com/attachments/1225909016526458971/1383758695594332211/Mac_Miller_-_Congratulations_Instrumental_VIOLIN__PIANO_.mp3?ex=684ff536&is=684ea3b6&hm=c2e6c0184dab419c7f7ce6387bbfe927a8a05eb185b07906436f97c1b8c4fc55&";

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
    <div className="fixed top-20 right-6 z-40">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className={`
          w-16 h-16 rounded-full 
          bg-gradient-to-br from-red-400 via-pink-500 to-pink-600
          hover:from-red-500 hover:via-pink-600 hover:to-pink-700
          shadow-lg shadow-pink-500/40
          flex items-center justify-center
          transition-all duration-300
          ${isPlaying ? 'scale-110' : 'hover:scale-105'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          border-2 border-pink-300/50
        `}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Disc 
            className={`w-7 h-7 text-white ${isPlaying ? 'animate-spin' : ''}`} 
          />
        )}
      </button>
    </div>
  );
};
