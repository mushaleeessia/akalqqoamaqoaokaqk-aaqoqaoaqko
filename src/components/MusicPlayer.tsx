import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Music } from "lucide-react";

interface MusicPlayerProps {
  hidden?: boolean;
}

const VISIBLE_ROUTES = ['/'];

export const MusicPlayer = ({ hidden = false }: MusicPlayerProps) => {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Só mostrar na página principal
  const shouldHide = hidden || !VISIBLE_ROUTES.includes(location.pathname);

  const audioUrl = "https://audio.jukehost.co.uk/CtlkY10vzGjBSZx7vxgDiodDCWsokOVS";

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          setIsPlaying(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleLoadStart = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);
  const handleEnded = () => setIsPlaying(false);
  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
    console.log("Erro ao carregar o áudio");
  };
  const handlePause = () => setIsPlaying(false);

  return (
    <div className="fixed top-20 right-6 z-40">
      {/* Esconde só o botão, não o audio */}
      <button
        onClick={handlePlayPause}
        disabled={isLoading}
        className={`
          w-16 h-16 rounded-full 
          bg-gradient-to-br from-red-400 via-pink-500 to-pink-600
          hover:from-red-500 hover:via-pink-600 hover:to-pink-700
          shadow-lg shadow-pink-500/40
          flex items-center justify-center
          transition-all duration-300
          ${isPlaying ? "scale-110" : "hover:scale-105"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          border-2 border-pink-300/50
          relative
          ${shouldHide ? "hidden" : ""}
        `}
        aria-label={isPlaying ? "Pausar música" : "Tocar música"}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="relative">
            <Music
              className={`w-7 h-7 text-white ${
                isPlaying ? "animate-spin" : ""
              }`}
            />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-white rotate-45 transform" />
              </div>
            )}
          </div>
        )}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        onPause={handlePause}
        style={{ display: "none" }}
      />
    </div>
  );
};
