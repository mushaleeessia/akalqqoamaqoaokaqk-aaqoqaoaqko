import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Target, Clock, Crosshair, MousePointer2, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GridshotMode } from '@/components/aim/GridshotMode';
import { TrackingMode } from '@/components/aim/TrackingMode';
import { FlickMode } from '@/components/aim/FlickMode';
import { PrecisionMode } from '@/components/aim/PrecisionMode';

type GameMode = 'gridshot' | 'flick' | 'tracking' | 'precision';

const GAME_DURATION = 60000; // 60 seconds

interface GameStats {
  score: number;
  accuracy: number;
  targetsHit: number;
  targetsMissed?: number;
  totalTargets?: number;
  avgReactionTime?: number;
  timeOnTarget?: number;
  totalClicks?: number;
}

const AimTrainer: React.FC = () => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [userProfile, setUserProfile] = useState<{ nickname: string } | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('gridshot');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    accuracy: 0,
    targetsHit: 0,
    targetsMissed: 0,
    totalTargets: 0,
    avgReactionTime: 0,
    timeOnTarget: 0,
    totalClicks: 0
  });
  const [gameEndStats, setGameEndStats] = useState<GameStats | null>(null);

  const gameTimerRef = useRef<NodeJS.Timeout>();

  // Load user profile
  useEffect(() => {
    if (user) {
      const loadProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .single();
        if (data) {
          setUserProfile(data);
        }
      };
      loadProfile();
    }
  }, [user]);

  const startGame = useCallback(() => {
    if (!user) {
      toast.error('Você precisa estar logado para jogar');
      return;
    }

    console.log(`Iniciando jogo no modo: ${gameMode}`);
    setIsPlaying(true);
    setTimeLeft(GAME_DURATION);
    setStats({
      score: 0,
      accuracy: 0,
      targetsHit: 0,
      targetsMissed: 0,
      totalTargets: 0,
      avgReactionTime: 0,
      timeOnTarget: 0,
      totalClicks: 0
    });
    setGameEndStats(null);

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          endGame();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  }, [user, gameMode]);

  const endGame = useCallback(async () => {
    console.log('Finalizando jogo...', stats);
    setIsPlaying(false);
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }

    const finalStats = { ...stats };
    setGameEndStats(finalStats);

    // Save to Supabase
    if (user) {
      try {
        console.log('Salvando dados do jogo:', finalStats);
        
        const sessionData = {
          user_id: user.id,
          game_mode: gameMode,
          score: finalStats.score,
          accuracy: Math.round(finalStats.accuracy * 100) / 100,
          avg_reaction_time: Math.round(finalStats.avgReactionTime || 0),
          targets_hit: finalStats.targetsHit,
          targets_missed: finalStats.targetsMissed || 0,
          total_targets: finalStats.totalTargets || finalStats.targetsHit,
          duration: 60,
          completed_at: new Date().toISOString()
        };

        const { error: sessionError } = await supabase.from('aim_trainer_sessions').insert(sessionData);
        
        if (sessionError) {
          console.error('Erro ao salvar sessão:', sessionError);
          throw sessionError;
        }

        // Update or create stats
        const { data: existingStats, error: fetchError } = await supabase
          .from('aim_trainer_stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_mode', gameMode)
          .maybeSingle();

        if (fetchError) {
          console.error('Erro ao buscar estatísticas:', fetchError);
          throw fetchError;
        }

        if (existingStats) {
          const newAvgReactionTime = finalStats.avgReactionTime && finalStats.avgReactionTime > 0 
            ? Math.min(((existingStats.avg_reaction_time * existingStats.total_sessions) + finalStats.avgReactionTime) / (existingStats.total_sessions + 1), 999999)
            : existingStats.avg_reaction_time;
            
          const updatedStats = {
            best_score: Math.max(existingStats.best_score, finalStats.score),
            best_accuracy: Math.max(existingStats.best_accuracy, finalStats.accuracy),
            best_avg_reaction_time: finalStats.avgReactionTime && finalStats.avgReactionTime > 0 ? Math.min(existingStats.best_avg_reaction_time, finalStats.avgReactionTime) : existingStats.best_avg_reaction_time,
            total_sessions: existingStats.total_sessions + 1,
            total_targets_hit: existingStats.total_targets_hit + finalStats.targetsHit,
            total_targets_missed: existingStats.total_targets_missed + (finalStats.targetsMissed || 0),
            avg_accuracy: ((existingStats.avg_accuracy * existingStats.total_sessions) + finalStats.accuracy) / (existingStats.total_sessions + 1),
            avg_reaction_time: newAvgReactionTime
          };

          const { error: updateError } = await supabase
            .from('aim_trainer_stats')
            .update(updatedStats)
            .eq('id', existingStats.id);
          
          if (updateError) {
            console.error('Erro ao atualizar estatísticas:', updateError);
            throw updateError;
          }
        } else {
          const { error: insertError } = await supabase.from('aim_trainer_stats').insert({
            user_id: user.id,
            game_mode: gameMode,
            best_score: finalStats.score,
            best_accuracy: Math.round(finalStats.accuracy * 100) / 100,
            best_avg_reaction_time: finalStats.avgReactionTime && finalStats.avgReactionTime > 0 ? Math.round(finalStats.avgReactionTime) : 999999,
            total_sessions: 1,
            total_targets_hit: finalStats.targetsHit,
            total_targets_missed: finalStats.targetsMissed || 0,
            avg_accuracy: Math.round(finalStats.accuracy * 100) / 100,
            avg_reaction_time: Math.round(finalStats.avgReactionTime || 0)
          });
          
          if (insertError) {
            console.error('Erro ao inserir estatísticas:', insertError);
            throw insertError;
          }
        }

        console.log('Dados salvos com sucesso!');
        toast.success('Jogo salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar jogo:', error);
        toast.error('Erro ao salvar jogo: ' + (error as any)?.message);
      }
    }
  }, [stats, gameMode, user]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setTimeLeft(GAME_DURATION);
    setStats({
      score: 0,
      accuracy: 0,
      targetsHit: 0,
      targetsMissed: 0,
      totalTargets: 0,
      avgReactionTime: 0,
      timeOnTarget: 0,
      totalClicks: 0
    });
    setGameEndStats(null);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
  }, []);

  const handleStatsUpdate = useCallback((newStats: GameStats) => {
    setStats(newStats);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const gameModeDescriptions = {
    gridshot: 'Acerte todos os alvos em uma grade. Novos alvos aparecerão automaticamente.',
    flick: 'Acerte alvos que aparecem aleatoriamente. Teste sua velocidade de reação.',
    tracking: 'Mantenha o mouse sobre o alvo em movimento. Ganhe pontos por tempo no alvo.',
    precision: 'Acerte alvos pequenos que aparecem lentamente. Teste sua precisão.'
  };

  const renderGameMode = () => {
    switch (gameMode) {
      case 'gridshot':
        return <GridshotMode isPlaying={isPlaying} onStatsUpdate={handleStatsUpdate} containerRef={containerRef} />;
      case 'tracking':
        return <TrackingMode isPlaying={isPlaying} onStatsUpdate={handleStatsUpdate} containerRef={containerRef} />;
      case 'flick':
        return <FlickMode isPlaying={isPlaying} onStatsUpdate={handleStatsUpdate} containerRef={containerRef} />;
      case 'precision':
        return <PrecisionMode isPlaying={isPlaying} onStatsUpdate={handleStatsUpdate} containerRef={containerRef} />;
      default:
        return null;
    }
  };

  const displayStats = gameEndStats || stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Aim Trainer</h1>
              <p className="text-muted-foreground">Treine sua mira e precisão</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Badge variant="outline">
                {userProfile?.nickname || 'Usuário'}
              </Badge>
            )}
          </div>
        </div>

        {/* Game Mode Selection */}
        {!isPlaying && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Selecione o Modo de Jogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {(Object.keys(gameModeDescriptions) as GameMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={gameMode === mode ? "default" : "outline"}
                    className="h-auto p-4 flex-col items-center gap-2"
                    onClick={() => setGameMode(mode)}
                  >
                    <div className="text-lg font-semibold capitalize">{mode}</div>
                    <div className="text-sm text-center text-muted-foreground">
                      {mode === 'gridshot' && 'Grade de alvos'}
                      {mode === 'flick' && 'Alvos rápidos'}
                      {mode === 'tracking' && 'Alvo móvel'}
                      {mode === 'precision' && 'Alvos pequenos'}
                    </div>
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {gameModeDescriptions[gameMode]}
              </p>
              <Button onClick={startGame} size="lg" className="w-full">
                <Crosshair className="w-5 h-5 mr-2" />
                Iniciar Jogo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Game Stats */}
        {isPlaying && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{Math.ceil(timeLeft / 1000)}s</div>
                <div className="text-sm text-muted-foreground">Tempo</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {displayStats.score}
                </div>
                <div className="text-sm text-muted-foreground">Pontos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {displayStats.targetsHit}
                </div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {displayStats.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {(displayStats.avgReactionTime || 0).toFixed(0)}ms
                </div>
                <div className="text-sm text-muted-foreground">Reação Média</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Area */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div
              ref={containerRef}
              className="relative w-full h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden cursor-crosshair"
            >
              {/* Time Progress Bar */}
              {isPlaying && (
                <div className="absolute top-4 left-4 right-4 z-10">
                  <Progress 
                    value={(timeLeft / GAME_DURATION) * 100} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Game Mode Component */}
              {renderGameMode()}

              {/* Game Instructions */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MousePointer2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Clique em "Iniciar Jogo" para começar</p>
                    <p className="text-sm">Modo: {gameMode.toUpperCase()}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Game Controls */}
        {isPlaying && (
          <div className="flex justify-center gap-4">
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        )}

        {/* Results */}
        {!isPlaying && gameEndStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Resultados do Jogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">
                    {gameEndStats.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Pontuação Final</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {gameEndStats.targetsHit}
                  </div>
                  <div className="text-sm text-muted-foreground">Alvos Acertados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {gameEndStats.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {(gameEndStats.avgReactionTime || 0).toFixed(0)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Tempo de Reação</div>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <Button onClick={startGame}>
                  Jogar Novamente
                </Button>
                <Button onClick={resetGame} variant="outline">
                  Novo Jogo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AimTrainer;