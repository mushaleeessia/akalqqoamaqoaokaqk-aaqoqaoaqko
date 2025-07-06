import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Trash2, Clock, User } from "lucide-react";

interface QueueTrack {
  id: string;
  name: string;
  artist: string;
  spotifyUrl: string;
  imageUrl?: string;
  addedBy: string;
}

interface MusicQueueProps {
  queue: QueueTrack[];
  isAdmin: boolean;
  onRemoveTrack: (trackId: string) => void;
}

export const MusicQueue = ({ queue, isAdmin, onRemoveTrack }: MusicQueueProps) => {
  if (queue.length === 0) {
    return (
      <Card className="bg-black/20 backdrop-blur border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Fila de Músicas
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Music className="w-12 h-12 mx-auto mb-4 text-white/50" />
          <p className="text-white/70 mb-2">Nenhuma música na fila</p>
          {isAdmin && (
            <p className="text-white/50 text-sm">
              Adicione músicas usando o controle acima
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 backdrop-blur border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Fila de Músicas
          <span className="text-sm font-normal text-white/70">({queue.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {queue.map((track, index) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                {/* Track Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-sm">
                  {index + 1}
                </div>

                {/* Album Art */}
                <div className="w-10 h-10 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                  {track.imageUrl ? (
                    <img 
                      src={track.imageUrl} 
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Track Info */}
                <div className="flex-grow min-w-0">
                  <h4 className="text-white font-medium truncate">{track.name}</h4>
                  <p className="text-white/70 text-sm truncate">{track.artist}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-white/50" />
                    <span className="text-white/50 text-xs">
                      Adicionada por {track.addedBy}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(track.spotifyUrl, '_blank')}
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    <Music className="w-4 h-4" />
                  </Button>
                  
                  {isAdmin && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveTrack(track.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};