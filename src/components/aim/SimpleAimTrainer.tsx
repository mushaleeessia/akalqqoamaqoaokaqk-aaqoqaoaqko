import React, { useState, useRef, useCallback } from 'react';
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

interface SimpleAimTrainerProps {
  mode: 'flick' | 'tracking' | 'gridshot' | 'precision';
  onGameEnd: () => void;
}

export const SimpleAimTrainer: React.FC<SimpleAimTrainerProps> = ({ mode, onGameEnd }) => {
  const { user } = useAuth();
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [trackingScore, setTrackingScore] = useState(0);
  const [trackingTime, setTrackingTime] = useState(0);

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const gameTimers = useRef<{
    game?: NodeJS.Timeout;
    target?: NodeJS.Timeout;
    tracking?: NodeJS.Timeout;
    move?: NodeJS.Timeout;
    mouse?: NodeJS.Timeout;
  }>({});

  // Game settings
  const settings = {
    flick: { targetSize: 60, targetLifetime: 2000, spawnDelay: 500 },
    tracking: { targetSize: 50, targetLifetime: 0, spawnDelay: 0 },
    gridshot: { targetSize: 50, targetLifetime: 1500, spawnDelay: 300 },
    precision: { targetSize: 25, targetLifetime: 3000, spawnDelay: 800 }
  }[mode];

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    Object.values(gameTimers.current).forEach(timer => {
      if (timer) clearTimeout(timer);
    });
    gameTimers.current = {};
  }, []);

  // Get positions
  const getRandomPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 100, y: 100 };
    const rect = gameAreaRef.current.getBoundingClientRect();
    const margin = 60;
    return {
      x: Math.random() * (rect.width - settings.targetSize - margin * 2) + margin,
      y: Math.random() * (rect.height - settings.targetSize - margin * 2) + margin
    };
  }, [settings.targetSize]);

  const getGridPosition = useCallback(() => {
    if (!gameAreaRef.current) return { x: 100, y: 100 };
    const rect = gameAreaRef.current.getBoundingClientRect();
    const cols = 6, rows = 4, margin = 50;
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    const cellWidth = (rect.width - margin * 2) / cols;
    const cellHeight = (rect.height - margin * 2) / rows;
    return {
      x: margin + col * cellWidth + cellWidth / 2 - settings.targetSize / 2,
      y: margin + row * cellHeight + cellHeight / 2 - settings.targetSize / 2
    };
  }, [settings.targetSize]);

  // Save session
  const saveSession = useCallback(async () => {
    if (!user) return;

    let finalAccuracy = 0;
    let finalScore = score;

    if (mode === 'tracking') {
      finalAccuracy = trackingTime > 0 ? (trackingScore / trackingTime) * 100 : 0;
      finalScore = trackingScore;
    } else {
      finalAccuracy = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;
    }

    const avgReactionTime = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    try {
      await supabase.from('aim_trainer_sessions').insert({
        user_id: user.id,
        game_mode: mode,
        score: finalScore,
        accuracy: parseFloat(finalAccuracy.toFixed(2)),
        avg_reaction_time: avgReactionTime,
        targets_hit: mode === 'tracking' ? trackingScore : hits,
        targets_missed: mode === 'tracking' ? Math.max(0, trackingTime - trackingScore) : misses,
        total_targets: mode === 'tracking' ? trackingTime : hits + misses,
        duration: 60 - timeLeft
      });
      toast({ title: "Sessão salva!", description: "Resultados salvos com sucesso." });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({ title: "Erro", description: "Erro ao salvar resultados", variant: "destructive" });
    }
  }, [user, mode, score, trackingTime, trackingScore, hits, misses, reactionTimes, timeLeft]);

  // Spawn target
  const spawnTarget = useCallback(() => {
    console.log(`[${mode.toUpperCase()}] Spawning target...`);
    
    const position = mode === 'gridshot' ? getGridPosition() : getRandomPosition();
    const newTarget: Target = {
      id: ++targetIdRef.current,
      x: position.x,
      y: position.y,
      size: settings.targetSize,
      createdAt: Date.now(),
      velocity: mode === 'tracking' ? { 
        x: (Math.random() - 0.5) * 2, 
        y: (Math.random() - 0.5) * 2 
      } : undefined
    };

    console.log(`[${mode.toUpperCase()}] Target spawned:`, newTarget.id);
    setTargets([newTarget]);

    // Auto-remove for non-tracking modes
    if (settings.targetLifetime > 0) {
      gameTimers.current.target = setTimeout(() => {
        console.log(`[${mode.toUpperCase()}] Target expired`);
        setTargets([]);
        setMisses(prev => prev + 1);
        
        // Spawn next
        gameTimers.current.target = setTimeout(spawnTarget, settings.spawnDelay);
      }, settings.targetLifetime);
    }
  }, [mode, settings, getGridPosition, getRandomPosition]);

  // Handle target click
  const handleTargetClick = useCallback((targetId: number) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    const reactionTime = Date.now() - target.createdAt;
    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setScore(prev => prev + 10);
    setTargets([]);

    console.log(`[${mode.toUpperCase()}] Target hit! Reaction: ${reactionTime}ms`);

    // Spawn next for non-tracking modes
    if (mode !== 'tracking') {
      gameTimers.current.target = setTimeout(spawnTarget, settings.spawnDelay);
    }
  }, [targets, mode, settings.spawnDelay, spawnTarget]);

  // Update moving targets
  const updateMovingTargets = useCallback(() => {
    if (mode !== 'tracking') return;

    setTargets(prev => prev.map(target => {
      if (!target.velocity || !gameAreaRef.current) return target;

      const rect = gameAreaRef.current.getBoundingClientRect();
      let newX = target.x + target.velocity.x;
      let newY = target.y + target.velocity.y;
      let newVelX = target.velocity.x;
      let newVelY = target.velocity.y;

      // Bounce off walls
      if (newX <= 0 || newX >= rect.width - target.size) {
        newVelX = -newVelX;
        newX = Math.max(0, Math.min(rect.width - target.size, newX));
      }
      if (newY <= 0 || newY >= rect.height - target.size) {
        newVelY = -newVelY;
        newY = Math.max(0, Math.min(rect.height - target.size, newY));
      }

      return {
        ...target,
        x: newX,
        y: newY,
        velocity: { x: newVelX, y: newVelY }
      };
    }));
  }, [mode]);

  // Check mouse over target
  const checkMouseOverTarget = useCallback(() => {
    if (mode !== 'tracking' || !gameAreaRef.current) return false;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const relativeX = mousePos.x - rect.left;
    const relativeY = mousePos.y - rect.top;

    return targets.some(target => {
      const distance = Math.sqrt(
        Math.pow(relativeX - (target.x + target.size / 2), 2) + 
        Math.pow(relativeY - (target.y + target.size / 2), 2)
      );
      return distance <= target.size / 2;
    });
  }, [mode, mousePos, targets]);

  // Start game
  const startGame = useCallback(() => {
    console.log(`[${mode.toUpperCase()}] Starting game`);
    setGameStarted(true);
    setTimeLeft(60);
    setScore(0);
    setHits(0);
    setMisses(0);
    setTargets([]);
    setReactionTimes([]);
    setTrackingScore(0);
    setTrackingTime(0);
    targetIdRef.current = 0;
    clearAllTimers();

    // Game timer
    gameTimers.current.game = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn first target
    setTimeout(spawnTarget, 100);

    // Tracking mode setup
    if (mode === 'tracking') {
      // Movement animation
      gameTimers.current.move = setInterval(updateMovingTargets, 16);
      
      // Mouse tracking
      const handleMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      
      // Scoring
      gameTimers.current.tracking = setInterval(() => {
        const isOver = checkMouseOverTarget();
        setTrackingTime(prev => prev + 1);
        
        if (isOver) {
          setTrackingScore(prev => prev + 1);
        }
      }, 100);
      
      // Cleanup mouse listener
      gameTimers.current.mouse = setTimeout(() => {
        return () => window.removeEventListener('mousemove', handleMouseMove);
      }, 0) as any;
    }
  }, [mode, clearAllTimers, spawnTarget, updateMovingTargets, checkMouseOverTarget]);

  // End game
  const endGame = useCallback(() => {
    console.log(`[${mode.toUpperCase()}] Ending game`);
    setGameStarted(false);
    clearAllTimers();
    setTargets([]);
    
    // Clean up mouse listener for tracking
    if (mode === 'tracking') {
      window.removeEventListener('mousemove', () => {});
    }
    
    saveSession();
  }, [mode, clearAllTimers, saveSession]);

  // Calculate stats
  const accuracy = mode === 'tracking' 
    ? (trackingTime > 0 ? ((trackingScore / trackingTime) * 100).toFixed(1) : "0.0")
    : (hits + misses > 0 ? ((hits / (hits + misses)) * 100).toFixed(1) : "0.0");

  const avgReactionTime = reactionTimes.length > 0 
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const displayScore = mode === 'tracking' ? trackingScore : score;

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
            <span className="text-muted-foreground">Pontos:</span> 
            <span className="font-bold ml-2">{displayScore}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Precisão:</span> 
            <span className="font-bold ml-2">{accuracy}%</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Tempo:</span> 
            <span className="font-bold ml-2">{timeLeft}s</span>
          </div>
          {avgReactionTime > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Reação:</span> 
              <span className="font-bold ml-2">{avgReactionTime}ms</span>
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
                  {mode === 'gridshot' && "Clique nos alvos que aparecem em posições de grid."}
                  {mode === 'flick' && "Clique nos alvos que aparecem aleatoriamente."}
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
            className="w-full h-full cursor-crosshair bg-gradient-to-br from-background to-muted/20 relative overflow-hidden"
          >
            {/* Grid overlay for gridshot */}
            {mode === 'gridshot' && (
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <svg className="w-full h-full">
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
            
            {/* Targets */}
            {targets.map(target => (
              <div
                key={target.id}
                className="absolute select-none"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
              >
                {mode !== 'tracking' ? (
                  <button
                    className="w-full h-full bg-primary hover:bg-primary/80 rounded-full transition-colors duration-150 border-2 border-background shadow-lg hover:shadow-xl active:scale-95"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTargetClick(target.id);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-primary rounded-full border-2 border-background shadow-lg" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};