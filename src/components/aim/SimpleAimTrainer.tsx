import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
  velocity?: { x: number; y: number };
}

interface GameSettings {
  size: number;
  targetLifetime: number;
  isMoving: boolean;
  needsClick: boolean;
}

interface SimpleAimTrainerProps {
  mode: 'flick' | 'tracking' | 'gridshot' | 'precision';
  onGameEnd: () => void;
}

export const SimpleAimTrainer: React.FC<SimpleAimTrainerProps> = ({ mode, onGameEnd }) => {
  const { user } = useAuth();
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<Target | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const targetTimeoutRef = useRef<NodeJS.Timeout>();
  const trackingIntervalRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  // Game settings based on mode
  const settings: GameSettings = {
    flick: { size: 60, targetLifetime: 2000, isMoving: false, needsClick: true },
    tracking: { size: 50, targetLifetime: 0, isMoving: true, needsClick: false },
    gridshot: { size: 50, targetLifetime: 1500, isMoving: false, needsClick: true },
    precision: { size: 30, targetLifetime: 3000, isMoving: false, needsClick: true }
  }[mode];

  // Grid positions for gridshot
  const getGridPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 0, y: 0 };
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const cols = 6;
    const rows = 4;
    const margin = settings.size / 2;
    const usableWidth = rect.width - margin * 2;
    const usableHeight = rect.height - margin * 2;
    
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    const x = margin + (col * usableWidth) / cols + (usableWidth / cols - settings.size) / 2;
    const y = margin + (row * usableHeight) / rows + (usableHeight / rows - settings.size) / 2;
    
    return { x, y };
  }, [settings.size]);

  // Create new target
  const createTarget = useCallback(() => {
    if (!gameAreaRef.current || !gameStarted || isPaused) {
      console.log('Cannot create target:', { 
        hasGameArea: !!gameAreaRef.current, 
        gameStarted, 
        isPaused 
      });
      return;
    }

    console.log('Creating new target for mode:', mode);
    const rect = gameAreaRef.current.getBoundingClientRect();
    const margin = settings.size / 2;
    
    let x, y;
    if (mode === 'gridshot') {
      const gridPos = getGridPosition();
      x = gridPos.x;
      y = gridPos.y;
    } else {
      x = Math.random() * (rect.width - settings.size - margin * 2) + margin;
      y = Math.random() * (rect.height - settings.size - margin * 2) + margin;
    }

    const newTarget: Target = {
      id: ++targetIdRef.current,
      x,
      y,
      size: settings.size,
      createdAt: Date.now(),
      velocity: settings.isMoving ? {
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      } : undefined
    };

    console.log('Target created:', newTarget);
    setTarget(newTarget);

    // Auto-remove target after lifetime (except for tracking mode)
    if (settings.targetLifetime > 0) {
      if (targetTimeoutRef.current) {
        clearTimeout(targetTimeoutRef.current);
      }
      
      targetTimeoutRef.current = setTimeout(() => {
        console.log('Target timeout reached, creating new target');
        setTarget(null);
        setMisses(prev => prev + 1);
        // Create next target immediately
        setTimeout(() => createTarget(), 100);
      }, settings.targetLifetime);
    }
  }, [gameStarted, isPaused, mode, settings, getGridPosition]);

  // Update moving target position
  const updateMovingTarget = useCallback(() => {
    if (!target || !settings.isMoving || !target.velocity || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    
    setTarget(prev => {
      if (!prev || !prev.velocity) return prev;
      
      let newX = prev.x + prev.velocity.x;
      let newY = prev.y + prev.velocity.y;
      let newVelocity = { ...prev.velocity };

      // Bounce off walls
      if (newX <= 0 || newX >= rect.width - prev.size) {
        newVelocity.x *= -1;
        newX = Math.max(0, Math.min(newX, rect.width - prev.size));
      }
      if (newY <= 0 || newY >= rect.height - prev.size) {
        newVelocity.y *= -1;
        newY = Math.max(0, Math.min(newY, rect.height - prev.size));
      }

      return {
        ...prev,
        x: newX,
        y: newY,
        velocity: newVelocity
      };
    });
  }, [target, settings.isMoving]);

  // Handle target click
  const handleTargetClick = useCallback(() => {
    if (!target || !settings.needsClick) return;

    console.log('Target clicked!');
    const reactionTime = Date.now() - target.createdAt;
    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setScore(prev => prev + Math.max(100 - Math.floor(reactionTime / 10), 10));
    
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
    
    setTarget(null);
    
    // Create next target immediately
    setTimeout(() => createTarget(), 200);
  }, [target, settings.needsClick, createTarget]);

  // Handle miss click
  const handleMiss = useCallback(() => {
    setMisses(prev => prev + 1);
  }, []);

  // Check if mouse is over target (for tracking mode)
  const isMouseOverTarget = useCallback(() => {
    if (!target || !gameAreaRef.current) return false;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const targetCenterX = target.x + target.size / 2;
    const targetCenterY = target.y + target.size / 2;
    const mouseX = mousePosition.x - rect.left;
    const mouseY = mousePosition.y - rect.top;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - targetCenterX, 2) + 
      Math.pow(mouseY - targetCenterY, 2)
    );
    
    return distance <= target.size / 2;
  }, [target, mousePosition]);

  // Start game
  const startGame = useCallback(() => {
    console.log('Starting game for mode:', mode);
    
    // Clear all existing timers first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Reset all state
    setGameStarted(true);
    setIsPaused(false);
    setTimeLeft(60);
    setScore(0);
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setTarget(null);
    targetIdRef.current = 0;
    
    console.log('Game state reset, gameStarted is now true');
  }, [mode]);

  // End game
  const endGame = useCallback(() => {
    setGameStarted(false);
    setIsPaused(true);
    
    // Clear all timers and intervals
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (targetTimeoutRef.current) {
      clearTimeout(targetTimeoutRef.current);
    }
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    saveGameSession();
  }, []);

  // Save game session to database
  const saveGameSession = async () => {
    if (!user) return;

    const accuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
    const avgReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    try {
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

      toast({ title: "Sessão salva!", description: "Seus resultados foram salvos com sucesso." });
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      toast({ title: "Erro", description: "Erro ao salvar sessão", variant: "destructive" });
    }
  };

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (mode === 'tracking') {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mode]);

  // Game timer
  useEffect(() => {
    if (!gameStarted || isPaused) return;

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameStarted, isPaused, timeLeft, endGame]);

  // Moving target animation
  useEffect(() => {
    if (!gameStarted || isPaused || !settings.isMoving || !target) return;

    const animate = () => {
      updateMovingTarget();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, isPaused, target, settings.isMoving, updateMovingTarget]);

  // Tracking mode scoring
  useEffect(() => {
    if (mode !== 'tracking' || !gameStarted || isPaused || !target) return;

    trackingIntervalRef.current = setInterval(() => {
      if (isMouseOverTarget()) {
        setScore(prev => prev + 2);
        setHits(prev => prev + 1);
        console.log('Tracking hit!');
      } else {
        setMisses(prev => prev + 1);
        console.log('Tracking miss!');
      }
    }, 200); // Slower interval for better balance

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [mode, gameStarted, isPaused, target, isMouseOverTarget]);

  // Create first target when game starts
  useEffect(() => {
    if (gameStarted && !isPaused && !target) {
      console.log('Game started, creating initial target. Current state:', { gameStarted, isPaused, hasTarget: !!target });
      const timeout = setTimeout(() => {
        createTarget();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameStarted, isPaused, target, createTarget]);

  // Create new targets for tracking mode (continuous)
  useEffect(() => {
    if (mode === 'tracking' && gameStarted && !isPaused) {
      if (!target) {
        // Create target immediately if none exists
        createTarget();
      } else {
        // Create new target every 3 seconds for tracking mode
        const interval = setInterval(() => {
          createTarget();
        }, 3000);
        return () => clearInterval(interval);
      }
    }
  }, [mode, gameStarted, isPaused, target, createTarget]);

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
          {avgReactionTime > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Reação:</span> <span className="font-bold">{avgReactionTime}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        {!gameStarted ? (
          <div className="h-full flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4 capitalize">{mode}</h2>
                <p className="text-muted-foreground mb-6">
                  {mode === 'gridshot' && "Clique nos alvos que aparecem em posições de grid. Desenvolva precisão e velocidade!"}
                  {mode === 'flick' && "Clique nos alvos que aparecem aleatoriamente. Teste seus reflexos!"}
                  {mode === 'tracking' && "Acompanhe os alvos em movimento com o cursor."}
                  {mode === 'precision' && "Clique nos alvos pequenos com máxima precisão."}
                </p>
                <Button onClick={startGame} size="lg">
                  Iniciar Jogo
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div
            ref={gameAreaRef}
            className="w-full h-full cursor-crosshair bg-gradient-to-br from-background to-muted/20 relative"
            onClick={handleMiss}
          >
            {/* Grid overlay for gridshot mode */}
            {mode === 'gridshot' && (
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg className="w-full h-full">
                  {/* Vertical lines */}
                  {[...Array(7)].map((_, i) => (
                    <line
                      key={`v-${i}`}
                      x1={`${(i / 6) * 100}%`}
                      y1="0%"
                      x2={`${(i / 6) * 100}%`}
                      y2="100%"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Horizontal lines */}
                  {[...Array(5)].map((_, i) => (
                    <line
                      key={`h-${i}`}
                      x1="0%"
                      y1={`${(i / 4) * 100}%`}
                      x2="100%"
                      y2={`${(i / 4) * 100}%`}
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>
            )}
            
            {/* Target */}
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
                {/* Timer circle for modes with lifetime */}
                {settings.targetLifetime > 0 && (
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
                      cx={(target.size + 8) / 2}
                      cy={(target.size + 8) / 2}
                      r={(target.size + 8) / 2 - 2}
                      fill="transparent"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeDasharray={`${2 * Math.PI * ((target.size + 8) / 2 - 2)}`}
                      strokeDashoffset="0"
                      transform={`rotate(-90 ${(target.size + 8) / 2} ${(target.size + 8) / 2})`}
                      style={{
                        animation: `countdown ${settings.targetLifetime}ms linear forwards`
                      }}
                    />
                  </svg>
                )}
                
                {/* Main target */}
                <div
                  className="w-full h-full bg-primary hover:bg-primary/80 rounded-full cursor-pointer transition-colors duration-150 border-2 border-primary-foreground shadow-lg hover:shadow-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Target clicked! Settings:', settings);
                    handleTargetClick();
                  }}
                  onMouseEnter={() => {
                    if (mode === 'tracking') {
                      console.log('Mouse entered target in tracking mode');
                    }
                  }}
                />
              </div>
            )}
            
            {/* Pause overlay */}
            {isPaused && gameStarted && (
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