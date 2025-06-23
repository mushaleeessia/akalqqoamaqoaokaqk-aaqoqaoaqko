
import { useState, useEffect } from 'react';
import { User, LogOut, Trophy, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserStats {
  game_mode: string;
  total_games: number;
  total_wins: number;
  win_streak: number;
  max_win_streak: number;
  average_attempts: number;
}

interface UserProfile {
  nickname: string;
  created_at: string;
}

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats[]>([]);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('nickname, created_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } else {
      setStats(data || []);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Não foi possível fazer logout. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!user || !profile) return null;

  const totalGames = stats.reduce((sum, stat) => sum + stat.total_games, 0);
  const totalWins = stats.reduce((sum, stat) => sum + stat.total_wins, 0);
  const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={profile.nickname} />
            <AvatarFallback className="bg-purple-600 text-white">
              {profile.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <div className="flex items-center space-x-2 p-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={profile.nickname} />
            <AvatarFallback className="bg-purple-600 text-white text-lg">
              {profile.nickname.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{profile.nickname}</h4>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{totalGames}</div>
              <div className="text-xs text-muted-foreground">Jogos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{totalWins}</div>
              <div className="text-xs text-muted-foreground">Vitórias</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{winRate}%</div>
              <div className="text-xs text-muted-foreground">Taxa</div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => setShowStats(!showStats)}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>Estatísticas Detalhadas</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
