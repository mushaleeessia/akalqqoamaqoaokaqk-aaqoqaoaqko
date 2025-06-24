
import { useState, useEffect } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface GameStats {
  game_mode: string;
  total_games: number;
  total_wins: number;
  win_streak: number;
}

interface UserDropdownProps {
  nickname: string;
}

export const UserDropdown = ({ nickname }: UserDropdownProps) => {
  const { signOut } = useAuth();
  const [allStats, setAllStats] = useState<GameStats[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('game_stats')
        .select('game_mode, total_games, total_wins, win_streak')
        .eq('user_id', user.id);

      if (data) {
        setAllStats(data);
      }
    };

    fetchStats();
  }, []);

  const getStatsForMode = (mode: string) => {
    return allStats.find(stat => stat.game_mode === mode) || {
      game_mode: mode,
      total_games: 0,
      total_wins: 0,
      win_streak: 0
    };
  };

  const modes = [
    { id: 'solo', label: 'Solo' },
    { id: 'duo', label: 'Duo' },
    { id: 'trio', label: 'Trio' },
    { id: 'quarteto', label: 'Quarteto' }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white hover:bg-white/10 flex items-center gap-2"
        >
          {nickname}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 bg-gray-800 border-gray-700 max-h-96 overflow-y-auto" 
        align="end"
      >
        <div className="p-3 text-white">
          <div className="font-medium mb-4">Olá, {nickname}</div>
          <div className="space-y-4 text-sm">
            {modes.map((mode) => {
              const stats = getStatsForMode(mode.id);
              return (
                <div key={mode.id} className="border-b border-gray-600 pb-3 last:border-b-0">
                  <div className="font-medium text-purple-300 mb-2">Teeermo {mode.label}</div>
                  <div className="space-y-1 ml-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Jogados:</span>
                      <span>{stats.total_games}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Vencidos:</span>
                      <span>{stats.total_wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Winstreak:</span>
                      <span>{stats.win_streak}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem 
          onClick={signOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
