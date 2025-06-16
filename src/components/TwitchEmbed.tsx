
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

  // Lista de streamers em ordem de prioridade
  const streamers = ['mushmc', 'ffeijao', 'nobriell', 'neexty', 'adipjl', 'hipperbt'];

  useEffect(() => {
    const checkStreams = async () => {
      setIsLoading(true);
      setShowingVOD(false);
      
      // Verifica cada streamer em ordem de prioridade
      for (const streamer of streamers) {
        const isOnline = await checkStreamStatus(streamer);
        if (isOnline) {
          setCurrentStreamer(streamer);
          setIsLoading(false);
          return;
        }
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
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 w-96 bg-black overflow-hidden shadow-2xl border border-red-600/50 hidden lg:block">
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
      
      {/* Embed da Twitch - usando aspect ratio 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={getEmbedUrl()}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; fullscreen"
          style={{ 
            border: 'none',
            outline: 'none',
            background: 'black'
          }}
        />
      </div>
    </div>
  );
};
