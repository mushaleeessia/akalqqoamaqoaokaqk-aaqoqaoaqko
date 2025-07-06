import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface QueueTrack {
  id: string;
  name: string;
  artist: string;
  spotifyUrl: string;
  imageUrl?: string;
  addedBy: string;
}

interface MusicControllerProps {
  onTrackSelect: (track: CurrentTrack) => void;
  onQueueUpdate: (queue: QueueTrack[]) => void;
  currentQueue: QueueTrack[];
}

export const MusicController = ({ onTrackSelect, onQueueUpdate, currentQueue }: MusicControllerProps) => {
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const { toast } = useToast();

  const extractSpotifyId = (url: string): string | null => {
    const regex = /spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
    const match = url.match(regex);
    return match ? match[2] : null;
  };

  const getSpotifyEmbedUrl = (url: string): string => {
    const id = extractSpotifyId(url);
    if (!id) return "";
    
    if (url.includes("/track/")) {
      return `https://open.spotify.com/embed/track/${id}`;
    } else if (url.includes("/album/")) {
      return `https://open.spotify.com/embed/album/${id}`;
    } else if (url.includes("/playlist/")) {
      return `https://open.spotify.com/embed/playlist/${id}`;
    }
    
    return "";
  };

  const parseSpotifyUrl = async (url: string): Promise<QueueTrack | null> => {
    const id = extractSpotifyId(url);
    if (!id) return null;

    // For demo purposes, create mock track data
    // In a real implementation, you'd fetch from Spotify API
    const mockTrack: QueueTrack = {
      id: id,
      name: "Nova Música",
      artist: "Artista Desconhecido",
      spotifyUrl: url,
      imageUrl: undefined,
      addedBy: "aleeessia"
    };

    return mockTrack;
  };

  const handleAddTrack = async () => {
    if (!spotifyUrl.trim()) {
      toast({
        title: "Erro",
        description: "Cole um link do Spotify válido",
        variant: "destructive",
      });
      return;
    }

    if (!spotifyUrl.includes("spotify.com/")) {
      toast({
        title: "Erro",
        description: "O link deve ser do Spotify",
        variant: "destructive",
      });
      return;
    }

    try {
      const track = await parseSpotifyUrl(spotifyUrl);
      
      if (!track) {
        toast({
          title: "Erro",
          description: "Não foi possível processar o link do Spotify",
          variant: "destructive",
        });
        return;
      }

      // Add to queue
      const newQueue = [...currentQueue, track];
      onQueueUpdate(newQueue);

      toast({
        title: "Música adicionada",
        description: `${track.name} foi adicionada à fila`,
      });

      setSpotifyUrl("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar música",
        variant: "destructive",
      });
    }
  };

  const handlePlayNow = async () => {
    if (!spotifyUrl.trim()) return;

    try {
      const track = await parseSpotifyUrl(spotifyUrl);
      
      if (!track) {
        toast({
          title: "Erro",
          description: "Não foi possível processar o link do Spotify",
          variant: "destructive",
        });
        return;
      }

      // Convert to CurrentTrack and play immediately
      const currentTrack: CurrentTrack = {
        ...track,
        duration: 180, // 3 minutes default
        startedAt: Date.now(),
        isPlaying: true,
      };

      onTrackSelect(currentTrack);

      toast({
        title: "Tocando agora",
        description: `${track.name} está tocando`,
      });

      setSpotifyUrl("");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao tocar música",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Controle de Música
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Cole o link do Spotify aqui..."
            value={spotifyUrl}
            onChange={(e) => setSpotifyUrl(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button
            onClick={() => window.open("https://open.spotify.com", "_blank")}
            variant="outline"
            size="icon"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handlePlayNow}
            className="bg-primary hover:bg-primary/80 flex-1"
            disabled={!spotifyUrl.trim()}
          >
            Tocar Agora
          </Button>
          <Button 
            onClick={handleAddTrack}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 flex-1"
            disabled={!spotifyUrl.trim()}
          >
            Adicionar à Fila
          </Button>
        </div>

        <div className="text-xs text-white/50 space-y-1">
          <p>• Cole links de músicas, álbuns ou playlists do Spotify</p>
          <p>• "Tocar Agora" substitui a música atual</p>
          <p>• "Adicionar à Fila" adiciona no final da lista</p>
        </div>
      </CardContent>
    </Card>
  );
};