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
  const [target, setTarget] = useState<Target | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();

  // Game settings
  const getSettings = () => {
    switch (mode) {
      case 'flick': return { size: 60, lifetime: 2000, moving: false, clickable: true };
      case 'tracking': return { size: 50, lifetime: 0, moving: true, clickable: false };
      case 'gridshot': return { size: 50, lifetime: 1500, moving: false, clickable: true };
      case 'precision': return { size: 30, lifetime: 3000, moving: false, clickable: true };
      default: return { size: 50, lifetime: 2000, moving: false, clickable: true };
    }
  };

  const settings = getSettings();

  // Grid positions for gridshot
  const getGridPosition = () => {
    if (!gameAreaRef.current) return { x: 100, y: 100 };
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const cols = 6;
    const rows = 4;
    const margin = 50;
    
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    const cellWidth = (rect.width - margin * 2) / cols;
    const cellHeight = (rect.height - margin * 2) / rows;
    
    return {
      x: margin + col * cellWidth + cellWidth / 2 - settings.size / 2,
      y: margin + row * cellHeight + cellHeight / 2 - settings.size / 2
    };
  };

  // Create target
  const createTarget = useCallback(() => {
    if (!gameAreaRef.current || !gameStarted) return;
    
    console.log('Creating target for mode:', mode);
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    let x, y;
    
    if (mode === 'gridshot') {
      const pos = getGridPosition();
      x = pos.x;
      y = pos.y;
    } else {
      const margin = 50;
      x = Math.random() * (rect.width - settings.size - margin * 2) + margin;
      y = Math.random() * (rect.height - settings.size - margin * 2) + margin;
    }

    const newTarget: Target = {
      id: ++targetIdRef.current,
      x,
      y,
      size: settings.size,
      createdAt: Date.now(),
      velocity: settings.moving ? {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3
      } : undefined
    };

    setTarget(newTarget);
    console.log('Target created:', newTarget);

    // Auto remove after lifetime
    if (settings.lifetime > 0) {
      timeoutRef.current = setTimeout(() => {
        setTarget(null);
        setMisses(prev => prev + 1);
        createTarget();
      }, settings.lifetime);
    }
  }, [gameStarted, mode, settings]);

  // Handle target click
  const handleTargetClick = () => {
    if (!target || !settings.clickable) return;
    
    console.log('Target clicked!');
    const reactionTime = Date.now() - target.createdAt;
    setReactionTimes(prev => [...prev, reactionTime]);
    setHits(prev => prev + 1);
    setScore(prev => prev + Math.max(100 - Math.floor(reactionTime / 10), 10));
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setTarget(null);
    setTimeout(createTarget, 200);
  };

  // Moving target animation
  const updateMovingTarget = useCallback(() => {
    if (!target?.velocity || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    
    setTarget(prev => {
      if (!prev?.velocity) return prev;
      
      let newX = prev.x + prev.velocity.x;
      let newY = prev.y + prev.velocity.y;
      let newVel = { ...prev.velocity };

      // Bounce off walls
      if (newX <= 0 || newX >= rect.width - prev.size) {
        newVel.x *= -1;
        newX = Math.max(0, Math.min(newX, rect.width - prev.size));
      }
      if (newY <= 0 || newY >= rect.height - prev.size) {
        newVel.y *= -1;
        newY = Math.max(0, Math.min(newY, rect.height - prev.size));
      }

      return { ...prev, x: newX, y: newY, velocity: newVel };
    });
  }, [target]);

  // Check if mouse is over target
  const isMouseOverTarget = useCallback(() => {
    if (!target || !gameAreaRef.current) return false;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const targetCenterX = target.x + target.size / 2;
    const targetCenterY = target.y + target.size / 2;
    const mouseX = mousePos.x - rect.left;
    const mouseY = mousePos.y - rect.top;
    
    const distance = Math.sqrt(
      Math.pow(mouseX - targetCenterX, 2) + 
      Math.pow(mouseY - targetCenterY, 2)
    );
    
    return distance <= target.size / 2;
  }, [target, mousePos]);

  // Start game
  const startGame = () => {
    console.log('Starting game:', mode);
    setGameStarted(true);
    setTimeLeft(60);
    setScore(0);
    setHits(0);
    setMisses(0);
    setReactionTimes([]);
    setTarget(null);
    targetIdRef.current = 0;
    
    setTimeout(createTarget, 1000);
  };

  // End game
  const endGame = () => {
    setGameStarted(false);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    saveSession();
  };

  // Save session
  const saveSession = async () => {
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

      toast({ title: "Sessão salva!", description: "Resultados salvos com sucesso." });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({ title: "Erro", description: "Erro ao salvar resultados", variant: "destructive" });
    }
  };

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    if (mode === 'tracking') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [mode]);

  // Game timer
  useEffect(() => {
    if (!gameStarted) return;

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
  }, [gameStarted]);

  // Moving targets animation
  useEffect(() => {
    if (!gameStarted || !settings.moving || !target) return;

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
  }, [gameStarted, settings.moving, target, updateMovingTarget]);

  // Tracking mode scoring
  useEffect(() => {
    if (mode !== 'tracking' || !gameStarted || !target) return;

    const trackingInterval = setInterval(() => {
      if (isMouseOverTarget()) {
        setScore(prev => prev + 1);
        setHits(prev => prev + 1);
      } else {
        setMisses(prev => prev + 1);
      }
    }, 100);

    return () => clearInterval(trackingInterval);
  }, [mode, gameStarted, target, isMouseOverTarget]);

  // Target creation for all modes
  useEffect(() => {
    if (gameStarted && !target) {
      createTarget();
    }
  }, [gameStarted, target, createTarget]);

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
            className="w-full h-full cursor-crosshair bg-gradient-to-br from-background to-muted/20 relative"
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
                {/* Timer circle for timed modes */}
                {settings.lifetime > 0 && (
                  <div
                    className="absolute border-2 border-muted-foreground/50 rounded-full"
                    style={{
                      left: -4,
                      top: -4,
                      width: target.size + 8,
                      height: target.size + 8,
                      animation: `countdown ${settings.lifetime}ms linear forwards`
                    }}
                  />
                )}
                
                {/* Target button */}
                <div
                  className="w-full h-full bg-primary hover:bg-primary/80 rounded-full cursor-pointer transition-colors duration-150 border-2 border-primary-foreground shadow-lg hover:shadow-xl"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('TARGET CLICKED!');
                    handleTargetClick();
                  }}
                  style={{
                    width: target.size,
                    height: target.size,
                    backgroundColor: 'hsl(var(--primary))',
                    border: '2px solid hsl(var(--primary-foreground))',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};