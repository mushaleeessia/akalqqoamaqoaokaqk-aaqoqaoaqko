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

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  isHit: boolean;
  createdAt: number;
}

interface GameStats {
  score: number;
  accuracy: number;
  targetsHit: number;
  targetsMissed: number;
  totalTargets: number;
  avgReactionTime: number;
  reactionTimes: number[];
  gameStartTime: number;
  gameEndTime?: number;
}

type GameMode = 'gridshot' | 'flick' | 'tracking' | 'precision';

const GAME_DURATION = 60000; // 60 seconds
const TARGET_SIZE = {
  gridshot: 40,
  flick: 35,
  tracking: 30,
  precision: 20
};

const AimTrainer: React.FC = () => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameMode, setGameMode] = useState<GameMode>('gridshot');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    accuracy: 0,
    targetsHit: 0,
    targetsMissed: 0,
    totalTargets: 0,
    avgReactionTime: 0,
    reactionTimes: [],
    gameStartTime: 0
  });
  const [trackingTarget, setTrackingTarget] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [trackingScore, setTrackingScore] = useState(0);

  const gameTimerRef = useRef<NodeJS.Timeout>();
  const targetTimerRef = useRef<NodeJS.Timeout>();
  const trackingTimerRef = useRef<NodeJS.Timeout>();
  const nextTargetIdRef = useRef(1);

  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, []);

  const generateRandomPosition = useCallback((size: number) => {
    const bounds = getContainerBounds();
    const margin = size / 2 + 10;
    return {
      x: Math.random() * (bounds.width - 2 * margin) + margin,
      y: Math.random() * (bounds.height - 2 * margin) + margin
    };
  }, [getContainerBounds]);

  const createTarget = useCallback(() => {
    const size = TARGET_SIZE[gameMode];
    const position = generateRandomPosition(size);
    
    const newTarget: Target = {
      id: nextTargetIdRef.current++,
      x: position.x,
      y: position.y,
      size,
      isHit: false,
      createdAt: Date.now()
    };

    setTargets(prev => {
      if (gameMode === 'gridshot') {
        return [...prev, newTarget];
      } else {
        return [newTarget]; // Only one target for other modes
      }
    });

    setStats(prev => ({
      ...prev,
      totalTargets: prev.totalTargets + 1
    }));
  }, [gameMode, generateRandomPosition]);

  const createGridTargets = useCallback(() => {
    const bounds = getContainerBounds();
    const size = TARGET_SIZE.gridshot;
    const cols = 4;
    const rows = 3;
    const marginX = (bounds.width - cols * size * 2) / (cols + 1);
    const marginY = (bounds.height - rows * size * 2) / (rows + 1);

    const newTargets: Target[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newTargets.push({
          id: nextTargetIdRef.current++,
          x: marginX + col * (size * 2 + marginX) + size,
          y: marginY + row * (size * 2 + marginY) + size,
          size,
          isHit: false,
          createdAt: Date.now()
        });
      }
    }

    setTargets(newTargets);
    setStats(prev => ({
      ...prev,
      totalTargets: prev.totalTargets + newTargets.length
    }));
  }, [getContainerBounds]);

  const updateTrackingTarget = useCallback(() => {
    if (!trackingTarget) return;

    const bounds = getContainerBounds();
    const size = TARGET_SIZE.tracking;
    const speed = 2;

    setTrackingTarget(prev => {
      if (!prev) return null;

      let newX = prev.x + prev.vx * speed;
      let newY = prev.y + prev.vy * speed;
      let newVx = prev.vx;
      let newVy = prev.vy;

      // Bounce off walls
      if (newX <= size / 2 || newX >= bounds.width - size / 2) {
        newVx = -newVx;
        newX = Math.max(size / 2, Math.min(bounds.width - size / 2, newX));
      }
      if (newY <= size / 2 || newY >= bounds.height - size / 2) {
        newVy = -newVy;
        newY = Math.max(size / 2, Math.min(bounds.height - size / 2, newY));
      }

      return { x: newX, y: newY, vx: newVx, vy: newVy };
    });
  }, [trackingTarget, getContainerBounds]);

  const handleTargetClick = useCallback((targetId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const target = targets.find(t => t.id === targetId);
    if (!target || target.isHit) return;

    const reactionTime = Date.now() - target.createdAt;
    
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    setStats(prev => ({
      ...prev,
      score: prev.score + 100,
      targetsHit: prev.targetsHit + 1,
      reactionTimes: [...prev.reactionTimes, reactionTime],
      avgReactionTime: [...prev.reactionTimes, reactionTime].reduce((a, b) => a + b, 0) / (prev.reactionTimes.length + 1),
      accuracy: ((prev.targetsHit + 1) / prev.totalTargets) * 100
    }));

    // Create new target for certain modes
    if (gameMode === 'flick' || gameMode === 'precision') {
      setTimeout(createTarget, gameMode === 'precision' ? 500 : 200);
    }
  }, [targets, gameMode, createTarget]);

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    if (gameMode === 'tracking') return;
    
    // Clicked outside targets
    setStats(prev => ({
      ...prev,
      targetsMissed: prev.targetsMissed + 1,
      accuracy: prev.totalTargets > 0 ? (prev.targetsHit / prev.totalTargets) * 100 : 0
    }));
  }, [gameMode]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (gameMode !== 'tracking' || !trackingTarget) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const size = TARGET_SIZE.tracking;

    const distance = Math.sqrt(
      Math.pow(mouseX - trackingTarget.x, 2) + Math.pow(mouseY - trackingTarget.y, 2)
    );

    const wasOnTarget = isOnTarget;
    const nowOnTarget = distance <= size / 2;
    
    setIsOnTarget(nowOnTarget);

    if (nowOnTarget) {
      setTrackingScore(prev => prev + 1);
      
      if (!wasOnTarget) {
        setStats(prev => ({
          ...prev,
          targetsHit: prev.targetsHit + 1
        }));
      }
    }
  }, [gameMode, trackingTarget, isOnTarget]);

  const startGame = useCallback(() => {
    if (!user) {
      toast.error('Você precisa estar logado para jogar');
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setTrackingTarget(null);
    setIsOnTarget(false);
    setTrackingScore(0);
    setStats({
      score: 0,
      accuracy: 0,
      targetsHit: 0,
      targetsMissed: 0,
      totalTargets: 0,
      avgReactionTime: 0,
      reactionTimes: [],
      gameStartTime: Date.now()
    });
    nextTargetIdRef.current = 1;

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          endGame();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    // Initialize based on game mode
    if (gameMode === 'gridshot') {
      createGridTargets();
    } else if (gameMode === 'tracking') {
      const bounds = getContainerBounds();
      const position = generateRandomPosition(TARGET_SIZE.tracking);
      setTrackingTarget({
        x: position.x,
        y: position.y,
        vx: Math.random() > 0.5 ? 1 : -1,
        vy: Math.random() > 0.5 ? 1 : -1
      });
      
      trackingTimerRef.current = setInterval(updateTrackingTarget, 16); // 60 FPS
    } else {
      createTarget();
    }
  }, [user, gameMode, createGridTargets, createTarget, generateRandomPosition, getContainerBounds, updateTrackingTarget]);

  const endGame = useCallback(async () => {
    setIsPlaying(false);
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);

    const finalStats = {
      ...stats,
      gameEndTime: Date.now(),
      score: gameMode === 'tracking' ? trackingScore : stats.score,
      accuracy: gameMode === 'tracking' 
        ? (trackingScore / (GAME_DURATION / 100)) * 100 
        : stats.totalTargets > 0 ? (stats.targetsHit / stats.totalTargets) * 100 : 0
    };

    setStats(finalStats);

    // Save to Supabase
    if (user) {
      try {
        const sessionData = {
          user_id: user.id,
          game_mode: gameMode,
          score: finalStats.score,
          accuracy: finalStats.accuracy,
          avg_reaction_time: finalStats.avgReactionTime,
          targets_hit: finalStats.targetsHit,
          targets_missed: finalStats.targetsMissed,
          total_targets: finalStats.totalTargets,
          duration: 60,
          completed_at: new Date().toISOString()
        };

        await supabase.from('aim_trainer_sessions').insert(sessionData);

        // Update or create stats
        const { data: existingStats } = await supabase
          .from('aim_trainer_stats')
          .select('*')
          .eq('user_id', user.id)
          .eq('game_mode', gameMode)
          .single();

        if (existingStats) {
          const updatedStats = {
            best_score: Math.max(existingStats.best_score, finalStats.score),
            best_accuracy: Math.max(existingStats.best_accuracy, finalStats.accuracy),
            best_avg_reaction_time: Math.min(existingStats.best_avg_reaction_time, finalStats.avgReactionTime || 999999),
            total_sessions: existingStats.total_sessions + 1,
            total_targets_hit: existingStats.total_targets_hit + finalStats.targetsHit,
            total_targets_missed: existingStats.total_targets_missed + finalStats.targetsMissed,
            avg_accuracy: ((existingStats.avg_accuracy * existingStats.total_sessions) + finalStats.accuracy) / (existingStats.total_sessions + 1),
            avg_reaction_time: finalStats.avgReactionTime > 0 
              ? ((existingStats.avg_reaction_time * existingStats.total_sessions) + finalStats.avgReactionTime) / (existingStats.total_sessions + 1)
              : existingStats.avg_reaction_time
          };

          await supabase
            .from('aim_trainer_stats')
            .update(updatedStats)
            .eq('id', existingStats.id);
        } else {
          await supabase.from('aim_trainer_stats').insert({
            user_id: user.id,
            game_mode: gameMode,
            best_score: finalStats.score,
            best_accuracy: finalStats.accuracy,
            best_avg_reaction_time: finalStats.avgReactionTime || 999999,
            total_sessions: 1,
            total_targets_hit: finalStats.targetsHit,
            total_targets_missed: finalStats.targetsMissed,
            avg_accuracy: finalStats.accuracy,
            avg_reaction_time: finalStats.avgReactionTime
          });
        }

        toast.success('Jogo salvo com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar jogo:', error);
        toast.error('Erro ao salvar jogo');
      }
    }
  }, [stats, gameMode, trackingScore, user]);

  const resetGame = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeLeft(GAME_DURATION);
    setTargets([]);
    setTrackingTarget(null);
    setIsOnTarget(false);
    setTrackingScore(0);
    setStats({
      score: 0,
      accuracy: 0,
      targetsHit: 0,
      targetsMissed: 0,
      totalTargets: 0,
      avgReactionTime: 0,
      reactionTimes: [],
      gameStartTime: 0
    });
    
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
    if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (targetTimerRef.current) clearTimeout(targetTimerRef.current);
      if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);
    };
  }, []);

  // Auto-restart gridshot when all targets are hit
  useEffect(() => {
    if (gameMode === 'gridshot' && isPlaying && targets.length === 0 && stats.totalTargets > 0) {
      setTimeout(createGridTargets, 500);
    }
  }, [gameMode, isPlaying, targets.length, stats.totalTargets, createGridTargets]);

  const gameModeDescriptions = {
    gridshot: 'Acerte todos os alvos em uma grade. Novos alvos aparecerão automaticamente.',
    flick: 'Acerte alvos que aparecem aleatoriamente. Teste sua velocidade de reação.',
    tracking: 'Mantenha o mouse sobre o alvo em movimento. Ganhe pontos por tempo no alvo.',
    precision: 'Acerte alvos pequenos que aparecem lentamente. Teste sua precisão.'
  };

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
            <Badge variant={isPlaying ? "default" : "secondary"}>
              {isPlaying ? "Jogando" : "Parado"}
            </Badge>
            {user && (
              <Badge variant="outline">
                {user.email}
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
                  {gameMode === 'tracking' ? trackingScore : stats.score}
                </div>
                <div className="text-sm text-muted-foreground">Pontos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.targetsHit}
                </div>
                <div className="text-sm text-muted-foreground">Acertos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.avgReactionTime.toFixed(0)}ms
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
              onClick={handleContainerClick}
              onMouseMove={handleMouseMove}
            >
              {/* Static Targets */}
              {targets.map((target) => (
                <div
                  key={target.id}
                  className="absolute rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-2 border-white shadow-lg cursor-pointer transition-all duration-150 hover:scale-110"
                  style={{
                    left: target.x - target.size / 2,
                    top: target.y - target.size / 2,
                    width: target.size,
                    height: target.size,
                  }}
                  onClick={(e) => handleTargetClick(target.id, e)}
                />
              ))}

              {/* Tracking Target */}
              {trackingTarget && (
                <div
                  className={`absolute rounded-full border-4 border-white shadow-lg transition-all duration-150 ${
                    isOnTarget 
                      ? 'bg-gradient-to-br from-green-500 to-green-600' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}
                  style={{
                    left: trackingTarget.x - TARGET_SIZE.tracking / 2,
                    top: trackingTarget.y - TARGET_SIZE.tracking / 2,
                    width: TARGET_SIZE.tracking,
                    height: TARGET_SIZE.tracking,
                  }}
                />
              )}

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

              {/* Time Progress Bar */}
              {isPlaying && (
                <div className="absolute top-4 left-4 right-4">
                  <Progress 
                    value={(timeLeft / GAME_DURATION) * 100} 
                    className="h-2"
                  />
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
              Reiniciar
            </Button>
          </div>
        )}

        {/* Results */}
        {!isPlaying && stats.gameEndTime && (
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
                    {gameMode === 'tracking' ? trackingScore : stats.score}
                  </div>
                  <div className="text-sm text-muted-foreground">Pontuação Final</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.targetsHit}
                  </div>
                  <div className="text-sm text-muted-foreground">Alvos Acertados</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.accuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Precisão</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.avgReactionTime.toFixed(0)}ms
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