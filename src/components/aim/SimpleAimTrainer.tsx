import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { X, Pause, Play } from "lucide-react";
import { toast } from "sonner";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
  velocity?: { x: number; y: number };
}

interface SimpleAimTrainerProps {
  mode: string;
  onGameEnd: () => void;
}

export const SimpleAimTrainer = ({ mode, onGameEnd }: SimpleAimTrainerProps) => {
  const { user } = useAuth();
  const [target, setTarget] = useState<Target | null>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [globalMousePos, setGlobalMousePos] = useState({ x: 0, y: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const animationRef = useRef<number>();
  const targetTimeoutRef = useRef<NodeJS.Timeout>();
  const trackingScoreRef = useRef<NodeJS.Timeout>();
  const createTargetTimeoutRef = useRef<NodeJS.Timeout>();

  const modeSettings = {
    gridshot: { size: 60, spawnDelay: 800, isMoving: false, targetLifetime: 0, needsClick: true },
    flick: { size: 50, spawnDelay: 1200, isMoving: false, targetLifetime: 2500, needsClick: true },
    tracking: { size: 70, spawnDelay: 0, isMoving: true, targetLifetime: 0, needsClick: false },
    precision: { size: 30, spawnDelay: 1000, isMoving: false, targetLifetime: 0, needsClick: true }
  };

  const settings = modeSettings[mode as keyof typeof modeSettings] || modeSettings.gridshot;

  const createTarget = () => {
    if (!gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const margin = settings.size / 2;
    
    const x = Math.random() * (rect.width - settings.size - margin * 2) + margin;
    const y = Math.random() * (rect.height - settings.size - margin * 2) + margin;

    const newTarget: Target = {
      id: ++targetIdRef.current,
      x,
      y,
      size: settings.size,
      createdAt: Date.now(),
      velocity: settings.isMoving ? {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2
      } : undefined
    };

    setTarget(newTarget);

    // Auto-expire target if it has a lifetime (only for flick mode)
    if (settings.targetLifetime > 0 && mode === 'flick') {
      targetTimeoutRef.current = setTimeout(() => {
        setMisses(prev => prev + 1);
        setTarget(null);
        createTarget(); // Create immediately after expiry
      }, settings.targetLifetime);
    }

    // For tracking mode, start continuous scoring when cursor is on target
    if (mode === 'tracking' && !settings.needsClick) {
      trackingScoreRef.current = setInterval(() => {
        if (gameAreaRef.current && newTarget) {
          const rect = gameAreaRef.current.getBoundingClientRect();
          
          // Calculate target absolute position
          const targetLeft = rect.left + newTarget.x;
          const targetTop = rect.top + newTarget.y;
          const targetRight = targetLeft + newTarget.size;
          const targetBottom = targetTop + newTarget.size;
          
          // Check if global mouse position is over target
          if (globalMousePos.x >= targetLeft && globalMousePos.x <= targetRight &&
              globalMousePos.y >= targetTop && globalMousePos.y <= targetBottom) {
            setHits(prev => prev + 1);
            setScore(prev => prev + 10);
          }
        }
      }, 50);
    }
  };

  const updateMovingTarget = () => {
    if (!target || !settings.isMoving || !target.velocity || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    let newX = target.x + target.velocity.x;
    let newY = target.y + target.velocity.y;
    let newVelocity = { ...target.velocity };

    // Bounce off walls
    if (newX <= 0 || newX >= rect.width - target.size) {
      newVelocity.x *= -1;
      newX = Math.max(0, Math.min(newX, rect.width - target.size));
    }
    if (newY <= 0 || newY >= rect.height - target.size) {
      newVelocity.y *= -1;
      newY = Math.max(0, Math.min(newY, rect.height - target.size));
    }

    setTarget(prev => prev ? {
      ...prev,
      x: newX,
      y: newY,
      velocity: newVelocity
    } : null);
  };

  const handleTargetClick = () => {
    if (!target || !settings.needsClick) return;

    const reactionTime = Date.now() - target.createdAt;
    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setScore(prev => prev + Math.max(100 - Math.floor(reactionTime / 10), 10));
    
    // Clear timeout if target was clicked
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
    
    setTarget(null);
    
    // Create next target immediately
    createTarget();
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

      // Update stats
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
    
    // Clean up all timeouts and intervals
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
    if (trackingScoreRef.current) {
      clearInterval(trackingScoreRef.current);
    }
    if (createTargetTimeoutRef.current) {
      clearTimeout(createTargetTimeoutRef.current);
    }
    
    saveGameSession();
  };

  // Game timer
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

  // Global mouse tracking for tracking mode
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setGlobalMousePos({ x: e.clientX, y: e.clientY });
    };

    if (mode === 'tracking') {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
    }
  }, [mode]);

  // Start first target only once when game starts
  useEffect(() => {
    if (gameStarted && !isPaused && !target) {
      createTarget();
    }
  }, [gameStarted, isPaused]);

  // Moving target animation
  useEffect(() => {
    if (!gameStarted || isPaused || !settings.isMoving || !target) return;

    const animate = () => {
      updateMovingTarget();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, isPaused, target, settings.isMoving]);

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
                  {mode === 'tracking' && "Acompanhe os alvos em movimento com o cursor."}
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
            {target && (
              <div
                className="absolute"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              >
                {/* Timer circle for flick mode only - SVG version */}
                {mode === 'flick' && settings.targetLifetime > 0 && (
                  <svg 
                    className="absolute"
                    style={{
                      left: -4,
                      top: -4,
                      width: target.size + 8,
                      height: target.size + 8,
                    }}
                  >
                    <circle
                      cx={target.size / 2 + 4}
                      cy={target.size / 2 + 4}
                      r={target.size / 2 + 2}
                      fill="transparent"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * (target.size / 2 + 2)}`}
                      strokeDashoffset={`${2 * Math.PI * (target.size / 2 + 2)}`}
                      transform={`rotate(-90 ${target.size / 2 + 4} ${target.size / 2 + 4})`}
                      style={{
                        animation: `circle-deplete ${settings.targetLifetime}ms linear forwards`
                      }}
                    />
                  </svg>
                )}
                
                {/* Main target */}
                <div
                  className="absolute bg-primary hover:bg-primary-glow rounded-full cursor-pointer transition-colors duration-150 border-2 border-primary-foreground shadow-lg hover:shadow-xl"
                  style={{
                    width: target.size,
                    height: target.size,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTargetClick();
                  }}
                />
              </div>
            )}
            
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