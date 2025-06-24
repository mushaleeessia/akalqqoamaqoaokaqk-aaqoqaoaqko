
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

interface UserStats {
  total_games: number;
  total_wins: number;
  win_streak: number;
  max_win_streak: number;
}

interface UserDropdownProps {
  nickname: string;
}

export const UserDropdown = ({ nickname }: UserDropdownProps) => {
  const { signOut } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    total_games: 0,
    total_wins: 0,
    win_streak: 0,
    max_win_streak: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('game_stats')
        .select('total_games, total_wins, win_streak, max_win_streak')
        .eq('user_id', user.id)
        .eq('game_mode', 'solo')
        .single();

      if (data) {
        setStats(data);
      }
    };

    fetchStats();
  }, []);

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
        className="w-64 bg-gray-800 border-gray-700" 
        align="end"
      >
        <div className="p-3 text-white">
          <div className="font-medium mb-3">Olá, {nickname}</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Termos jogados:</span>
              <span>{stats.total_games}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Termos vencidos:</span>
              <span>{stats.total_wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Winstreak:</span>
              <span>{stats.win_streak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Maior winstreak:</span>
              <span>{stats.max_win_streak}</span>
            </div>
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
