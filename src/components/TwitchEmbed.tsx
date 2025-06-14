
import { useState, useEffect } from 'react';
import { checkStreamStatus } from '@/services/twitchService';
import { X } from 'lucide-react';

interface TwitchEmbedProps {
  isEnglish: boolean;
}

export const TwitchEmbed = ({ isEnglish }: TwitchEmbedProps) => {
  const [currentStreamer, setCurrentStreamer] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showingVOD, setShowingVOD] = useState(false);

  useEffect(() => {
    const checkStreams = async () => {
      setIsLoading(true);
      setShowingVOD(false);
      
      // Primeiro verifica ffeijao
      const ffeijaoOnline = await checkStreamStatus('ffeijao');
      if (ffeijaoOnline) {
        setCurrentStreamer('ffeijao');
        setIsLoading(false);
        return;
      }
      
      // Se ffeijao não estiver online, verifica mushmc
      const mushmcOnline = await checkStreamStatus('mushmc');
      if (mushmcOnline) {
        setCurrentStreamer('mushmc');
        setIsLoading(false);
        return;
      }
      
      // Se ninguém estiver online, mostra o VOD do mushmc
      setCurrentStreamer(null);
      setShowingVOD(true);
      setIsLoading(false);
    };

    checkStreams();
    
    // Verifica a cada 5 minutos
    const interval = setInterval(checkStreams, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading || (!currentStreamer && !showingVOD) || !isVisible) {
    return null;
  }

  const getEmbedUrl = () => {
    if (currentStreamer) {
      return `https://player.twitch.tv/?channel=${currentStreamer}&parent=${window.location.hostname}&muted=true`;
    } else if (showingVOD) {
      // Para VODs, usamos time=0 para começar do início, autoplay=false para pausado, allowfullscreen=true para controles
      return `https://player.twitch.tv/?video=2457385170&parent=${window.location.hostname}&time=0&autoplay=false&allowfullscreen=true&muted=false`;
    }
    return '';
  };

  const getTitle = () => {
    if (currentStreamer) {
      return `${isEnglish ? 'Live Stream' : 'Ao Vivo'}: ${currentStreamer}`;
    } else if (showingVOD) {
      return `${isEnglish ? 'Latest VOD' : 'Último VOD'}: mushmc`;
    }
    return '';
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 w-80 h-52 bg-black overflow-hidden shadow-2xl border border-red-600/50 hidden lg:block">
      {/* Header com nome do streamer/VOD e botão fechar */}
      <div className="bg-red-900/90 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${currentStreamer ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-white text-sm font-medium">
            {getTitle()}
          </span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-red-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Embed da Twitch - zoom aumentado para eliminar bordas pretas */}
      <div className="w-full h-full bg-black overflow-hidden" style={{ height: 'calc(100% - 44px)' }}>
        <iframe
          src={getEmbedUrl()}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          className="w-full h-full"
          allow="autoplay; fullscreen"
          style={{ 
            border: 'none',
            outline: 'none',
            background: 'black',
            transform: 'scale(1.4)',
            transformOrigin: 'center center'
          }}
        />
      </div>
    </div>
  );
};
