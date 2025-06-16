
import { useState, useEffect } from 'react';
import { checkStreamStatus, checkYouTubeStatus, checkTikTokStatus } from '@/services/twitchService';
import { X } from 'lucide-react';

interface TwitchEmbedProps {
  isEnglish: boolean;
}

export const TwitchEmbed = ({ isEnglish }: TwitchEmbedProps) => {
  const [currentStreamer, setCurrentStreamer] = useState<string | null>(null);
  const [currentPlatform, setCurrentPlatform] = useState<'twitch' | 'youtube' | 'tiktok' | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showingVOD, setShowingVOD] = useState(false);

  // Lista de streamers em ordem de prioridade
  const twitchStreamers = ['mushmc', 'ffeijao', 'satturnni', 'nobriell'];
  const youtubeChannels = ['Pentaax'];
  const tiktokChannels = ['satturnni'];

  useEffect(() => {
    const checkStreams = async () => {
      setIsLoading(true);
      setShowingVOD(false);
      setCurrentPlatform(null);
      
      // Verifica streamers da Twitch em ordem de prioridade
      for (const streamer of twitchStreamers) {
        const isOnline = await checkStreamStatus(streamer);
        if (isOnline) {
          setCurrentStreamer(streamer);
          setCurrentPlatform('twitch');
          setIsLoading(false);
          return;
        }
      }
      
      // Verifica canais do YouTube
      for (const channel of youtubeChannels) {
        const isOnline = await checkYouTubeStatus(channel);
        if (isOnline) {
          setCurrentStreamer(channel);
          setCurrentPlatform('youtube');
          setIsLoading(false);
          return;
        }
      }
      
      // Verifica canais do TikTok
      for (const channel of tiktokChannels) {
        const isOnline = await checkTikTokStatus(channel);
        if (isOnline) {
          setCurrentStreamer(channel);
          setCurrentPlatform('tiktok');
          setIsLoading(false);
          return;
        }
      }
      
      // Se ninguém estiver online, mostra o VOD do mushmc
      setCurrentStreamer(null);
      setCurrentPlatform(null);
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
    if (currentStreamer && currentPlatform === 'twitch') {
      return `https://player.twitch.tv/?channel=${currentStreamer}&parent=${window.location.hostname}&muted=true`;
    } else if (currentStreamer && currentPlatform === 'youtube') {
      return `https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw&autoplay=1&mute=1`;
    } else if (currentStreamer && currentPlatform === 'tiktok') {
      // Para TikTok, vamos mostrar um link direto já que não há embed disponível
      return `https://www.tiktok.com/@${currentStreamer}/live`;
    } else if (showingVOD) {
      return `https://player.twitch.tv/?video=2457385170&parent=${window.location.hostname}&time=0&autoplay=false&allowfullscreen=true&muted=false`;
    }
    return '';
  };

  const getTitle = () => {
    if (currentStreamer && currentPlatform) {
      const platform = currentPlatform === 'twitch' ? 'Twitch' : currentPlatform === 'youtube' ? 'YouTube' : 'TikTok';
      return `${isEnglish ? 'Live Stream' : 'Ao Vivo'} (${platform}): ${currentStreamer}`;
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
      
      {/* Embed da Twitch/YouTube/TikTok - usando aspect ratio 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {currentPlatform === 'tiktok' ? (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black">
            <div className="text-center text-white p-4">
              <p className="mb-4">{isEnglish ? 'TikTok Live' : 'Live no TikTok'}</p>
              <a
                href={getEmbedUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                {isEnglish ? 'Watch on TikTok' : 'Assistir no TikTok'}
              </a>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
