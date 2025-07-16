import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Pause, Play } from "lucide-react";
import { toast } from "sonner";

interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  createdAt: number;
  isMoving?: boolean;
  velocity?: { x: number; y: number };
}

interface AimTrainerGameProps {
  mode: string;
  onGameEnd: () => void;
}

export const AimTrainerGame = ({ mode, onGameEnd }: AimTrainerGameProps) => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 segundos
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const getGameSettings = () => {
    switch (mode) {
      case "gridshot":
        return { 
          targetSize: 60, 
          maxTargets: 1, 
          spawnDelay: 800,
          timeLimit: 60,
          isMoving: false
        };
      case "flick":
        return { 
          targetSize: 50, 
          maxTargets: 1, 
          spawnDelay: 1200,
          timeLimit: 60,
          isMoving: false
        };
      case "tracking":
        return { 
          targetSize: 70, 
          maxTargets: 1, 
          spawnDelay: 3000,
          timeLimit: 60,
          isMoving: true
        };
      case "precision":
        return { 
          targetSize: 30, 
          maxTargets: 1, 
          spawnDelay: 1000,
          timeLimit: 60,
          isMoving: false
        };
      default:
        return { 
          targetSize: 50, 
          maxTargets: 1, 
          spawnDelay: 1000,
          timeLimit: 60,
          isMoving: false
        };
    }
  };

  const settings = getGameSettings();

  const createTarget = useCallback(() => {
    if (!gameAreaRef.current) return;

    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const margin = settings.targetSize / 2;
    
    const x = Math.random() * (gameArea.width - settings.targetSize - margin * 2) + margin;
    const y = Math.random() * (gameArea.height - settings.targetSize - margin * 2) + margin;

    const newTarget: Target = {
      id: Date.now().toString(),
      x,
      y,
      size: settings.targetSize,
      createdAt: Date.now(),
      isMoving: settings.isMoving,
      velocity: settings.isMoving ? {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      } : undefined
    };

    setTargets(prev => [...prev, newTarget]);
  }, [settings]);

  const updateMovingTargets = useCallback(() => {
    if (!gameAreaRef.current) return;

    setTargets(prev => prev.map(target => {
      if (!target.isMoving || !target.velocity) return target;

      const gameArea = gameAreaRef.current!.getBoundingClientRect();
      let newX = target.x + target.velocity.x;
      let newY = target.y + target.velocity.y;
      let newVelocity = { ...target.velocity };

      // Bounce off walls
      if (newX <= 0 || newX >= gameArea.width - target.size) {
        newVelocity.x *= -1;
        newX = Math.max(0, Math.min(newX, gameArea.width - target.size));
      }
      if (newY <= 0 || newY >= gameArea.height - target.size) {
        newVelocity.y *= -1;
        newY = Math.max(0, Math.min(newY, gameArea.height - target.size));
      }

      return {
        ...target,
        x: newX,
        y: newY,
        velocity: newVelocity
      };
    }));
  }, []);

  const handleTargetClick = (targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    const reactionTime = Date.now() - target.createdAt;
    setReactionTimes(prev => [...prev, reactionTime]);
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setHits(prev => prev + 1);
    setScore(prev => prev + Math.max(100 - Math.floor(reactionTime / 10), 10));
  };

  const handleMiss = () => {
    setMisses(prev => prev + 1);
  };

  const saveGameSession = async () => {
    if (!user) return;

    const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    try {
      // Save session
      await supabase.from('aim_trainer_sessions').insert({
        user_id: user.id,
        game_mode: mode,
        score,
        accuracy: parseFloat(accuracy.toFixed(2)),
        avg_reaction_time: avgReactionTime,
        targets_hit: hits,
        targets_missed: misses,
        total_targets: hits + misses,
        duration: 60 - timeLeft
      });

      // Update or create stats
      const { data: existingStats } = await supabase
        .from('aim_trainer_stats')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_mode', mode)
        .maybeSingle();

      if (existingStats) {
        const newTotalSessions = existingStats.total_sessions + 1;
        const newTotalHits = existingStats.total_targets_hit + hits;
        const newTotalMisses = existingStats.total_targets_missed + misses;
        const newAvgAccuracy = newTotalHits + newTotalMisses > 0 
          ? (newTotalHits / (newTotalHits + newTotalMisses)) * 100 
          : 0;
        const newAvgReactionTime = Math.round(
          (existingStats.avg_reaction_time * existingStats.total_sessions + avgReactionTime) / newTotalSessions
        );

        await supabase
          .from('aim_trainer_stats')
          .update({
            best_score: Math.max(existingStats.best_score, score),
            best_accuracy: Math.max(existingStats.best_accuracy, accuracy),
            best_avg_reaction_time: Math.min(existingStats.best_avg_reaction_time, avgReactionTime || 999999),
            total_sessions: newTotalSessions,
            total_targets_hit: newTotalHits,
            total_targets_missed: newTotalMisses,
            avg_accuracy: parseFloat(newAvgAccuracy.toFixed(2)),
            avg_reaction_time: newAvgReactionTime
          })
          .eq('user_id', user.id)
          .eq('game_mode', mode);
      } else {
        await supabase.from('aim_trainer_stats').insert({
          user_id: user.id,
          game_mode: mode,
          best_score: score,
          best_accuracy: parseFloat(accuracy.toFixed(2)),
          best_avg_reaction_time: avgReactionTime || 999999,
          total_sessions: 1,
          total_targets_hit: hits,
          total_targets_missed: misses,
          avg_accuracy: parseFloat(accuracy.toFixed(2)),
          avg_reaction_time: avgReactionTime
        });
      }

      toast.success("Sessão salva com sucesso!");
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      toast.error("Erro ao salvar sessão");
    }
  };

  const endGame = () => {
    setGameStarted(false);
    setIsPaused(true);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    saveGameSession();
  };

  useEffect(() => {
    if (!gameStarted || isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isPaused, timeLeft]);

  useEffect(() => {
    if (!gameStarted || isPaused) return;

    const spawnTimer = setInterval(() => {
      if (targets.length < settings.maxTargets) {
        createTarget();
      }
    }, settings.spawnDelay);

    return () => clearInterval(spawnTimer);
  }, [gameStarted, isPaused, targets.length, createTarget, settings]);

  useEffect(() => {
    if (!gameStarted || isPaused || !settings.isMoving) return;

    const animate = () => {
      updateMovingTargets();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, isPaused, updateMovingTargets, settings.isMoving]);

  const accuracy = hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : "0.0";
  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onGameEnd}>
            <X className="w-4 h-4 mr-2" />
            Sair
          </Button>
          <h1 className="text-xl font-bold capitalize">{mode}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-muted-foreground">Pontos:</span> <span className="font-bold">{score}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Precisão:</span> <span className="font-bold">{accuracy}%</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Tempo:</span> <span className="font-bold">{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / 60) * 100} className="w-20" />
        </div>

        {gameStarted && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {!gameStarted ? (
          <div className="flex items-center justify-center h-full">
            <Card className="w-96">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 capitalize">{mode}</h2>
                <p className="text-muted-foreground mb-6">
                  {mode === 'gridshot' && "Clique nos alvos que aparecem em sequência o mais rápido possível."}
                  {mode === 'flick' && "Clique nos alvos que aparecem aleatoriamente. Teste seus reflexos!"}
                  {mode === 'tracking' && "Acompanhe e clique nos alvos em movimento."}
                  {mode === 'precision' && "Clique nos alvos pequenos com máxima precisão."}
                </p>
                <Button onClick={() => setGameStarted(true)} size="lg">
                  Iniciar
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : timeLeft <= 0 ? (
          <div className="flex items-center justify-center h-full">
            <Card className="w-96">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Jogo Finalizado!</h2>
                <div className="space-y-2 mb-6">
                  <p><span className="font-semibold">Pontuação:</span> {score}</p>
                  <p><span className="font-semibold">Acertos:</span> {hits}</p>
                  <p><span className="font-semibold">Erros:</span> {misses}</p>
                  <p><span className="font-semibold">Precisão:</span> {accuracy}%</p>
                  <p><span className="font-semibold">Tempo de Reação Médio:</span> {avgReactionTime}ms</p>
                </div>
                <Button onClick={onGameEnd}>
                  Voltar ao Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div
            ref={gameAreaRef}
            className="w-full h-full cursor-crosshair bg-gradient-to-br from-background to-muted/20"
            onClick={handleMiss}
          >
            {targets.map((target) => (
              <div
                key={target.id}
                className="absolute bg-primary hover:bg-primary-glow rounded-full cursor-pointer transition-colors duration-150 border-2 border-primary-foreground shadow-lg hover:shadow-xl"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTargetClick(target.id);
                }}
              />
            ))}
            
            {isPaused && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Card>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-4">Jogo Pausado</h3>
                    <Button onClick={() => setIsPaused(false)}>
                      Continuar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};