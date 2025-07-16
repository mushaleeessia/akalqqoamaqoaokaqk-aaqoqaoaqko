import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Clock, TrendingUp } from "lucide-react";

interface AimStats {
  game_mode: string;
  best_score: number;
  best_accuracy: number;
  best_avg_reaction_time: number;
  total_sessions: number;
  total_targets_hit: number;
  total_targets_missed: number;
  avg_accuracy: number;
  avg_reaction_time: number;
}

interface RecentSession {
  id: string;
  game_mode: string;
  score: number;
  accuracy: number;
  avg_reaction_time: number;
  targets_hit: number;
  targets_missed: number;
  total_targets: number;
  duration: number;
  created_at: string;
}

export const AimTrainerStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AimStats[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // Fetch aggregated stats
        const { data: statsData } = await supabase
          .from('aim_trainer_stats')
          .select('*')
          .eq('user_id', user.id);

        if (statsData) setStats(statsData);

        // Fetch recent sessions
        const { data: sessionsData } = await supabase
          .from('aim_trainer_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (sessionsData) setRecentSessions(sessionsData);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const getModeDisplayName = (mode: string) => {
    const names: Record<string, string> = {
      gridshot: "GridShot",
      flick: "Flick Shot",
      tracking: "Tracking",
      precision: "Precision"
    };
    return names[mode] || mode;
  };

  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      gridshot: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      flick: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      tracking: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      precision: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[mode] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Faça login para ver suas estatísticas</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {stats.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhuma estatística encontrada. Jogue alguns rounds para ver seus dados!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat) => (
                <Card key={stat.game_mode}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{getModeDisplayName(stat.game_mode)}</CardTitle>
                      <Badge className={getModeColor(stat.game_mode)}>
                        {stat.total_sessions} sessões
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Trophy className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-muted-foreground">Melhor Pontuação</span>
                        </div>
                        <p className="text-2xl font-bold">{stat.best_score}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm text-muted-foreground">Melhor Precisão</span>
                        </div>
                        <p className="text-2xl font-bold">{stat.best_accuracy.toFixed(1)}%</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-sm text-muted-foreground">Melhor Tempo</span>
                        </div>
                        <p className="text-lg font-bold">
                          {stat.best_avg_reaction_time === 999999 ? "N/A" : `${stat.best_avg_reaction_time}ms`}
                        </p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                          <span className="text-sm text-muted-foreground">Precisão Média</span>
                        </div>
                        <p className="text-lg font-bold">{stat.avg_accuracy.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total de Acertos:</span>
                          <span className="ml-2 font-medium">{stat.total_targets_hit}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total de Erros:</span>
                          <span className="ml-2 font-medium">{stat.total_targets_missed}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {recentSessions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Nenhuma sessão encontrada. Jogue alguns rounds para ver seu histórico!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={getModeColor(session.game_mode)}>
                          {getModeDisplayName(session.game_mode)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(session.created_at)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{session.score} pts</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Precisão:</span>
                        <p className="font-medium">{session.accuracy.toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tempo Médio:</span>
                        <p className="font-medium">{session.avg_reaction_time}ms</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Acertos:</span>
                        <p className="font-medium">{session.targets_hit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duração:</span>
                        <p className="font-medium">{session.duration}s</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};