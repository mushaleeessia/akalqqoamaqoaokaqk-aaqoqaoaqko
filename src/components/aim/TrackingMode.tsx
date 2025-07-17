import React, { useState, useRef, useEffect, useCallback } from 'react';

interface TrackingStats {
  score: number;
  accuracy: number;
  timeOnTarget: number;
  targetsHit: number;
}

interface TrackingModeProps {
  isPlaying: boolean;
  onStatsUpdate: (stats: TrackingStats) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const TARGET_SIZE = 50;

export const TrackingMode: React.FC<TrackingModeProps> = ({ isPlaying, onStatsUpdate, containerRef }) => {
  const [target, setTarget] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [stats, setStats] = useState<TrackingStats>({
    score: 0,
    accuracy: 0,
    timeOnTarget: 0,
    targetsHit: 0
  });
  const [speed] = useState(3);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const statsLoopRef = useRef<NodeJS.Timeout>();

  // Atualiza posição do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    if (isPlaying) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying, containerRef]);

  // Verifica se mouse está no alvo
  useEffect(() => {
    if (!target || !isPlaying) {
      setIsOnTarget(false);
      return;
    }

    const distance = Math.sqrt(
      Math.pow(mousePos.x - target.x, 2) + Math.pow(mousePos.y - target.y, 2)
    );
    
    const onTarget = distance <= TARGET_SIZE / 2;
    setIsOnTarget(onTarget);
  }, [mousePos, target, isPlaying]);

  // Loop principal do jogo
  useEffect(() => {
    if (!isPlaying) {
      setTarget(null);
      setIsOnTarget(false);
      return;
    }

    // Inicializa alvo
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const initialTarget = {
      x: bounds.width / 2,
      y: bounds.height / 2,
      vx: (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() > 0.5 ? 1 : -1)
    };
    setTarget(initialTarget);

    // Loop de movimento
    gameLoopRef.current = setInterval(() => {
      setTarget(prev => {
        if (!prev || !containerRef.current) return prev;
        
        const rect = containerRef.current.getBoundingClientRect();
        const topBarHeight = 60;
        
        let newX = prev.x + prev.vx * speed;
        let newY = prev.y + prev.vy * speed;
        let newVx = prev.vx;
        let newVy = prev.vy;

        // Bounce nas paredes
        if (newX <= TARGET_SIZE/2 || newX >= rect.width - TARGET_SIZE/2) {
          newVx = -newVx;
          newX = Math.max(TARGET_SIZE/2, Math.min(rect.width - TARGET_SIZE/2, newX));
        }
        
        if (newY <= TARGET_SIZE/2 + topBarHeight || newY >= rect.height - TARGET_SIZE/2) {
          newVy = -newVy;
          newY = Math.max(TARGET_SIZE/2 + topBarHeight, Math.min(rect.height - TARGET_SIZE/2, newY));
        }

        return { x: newX, y: newY, vx: newVx, vy: newVy };
      });
    }, 16);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, speed, containerRef]);

  // Loop de estatísticas
  useEffect(() => {
    if (!isPlaying) return;

    let totalFrames = 0;
    
    statsLoopRef.current = setInterval(() => {
      totalFrames++;
      
      setStats(prev => {
        const newTimeOnTarget = isOnTarget ? prev.timeOnTarget + 1 : prev.timeOnTarget;
        const accuracy = totalFrames > 0 ? (newTimeOnTarget / totalFrames) * 100 : 0;
        const newStats = {
          ...prev,
          timeOnTarget: newTimeOnTarget,
          accuracy,
          targetsHit: Math.floor(newTimeOnTarget / 30),
          score: Math.floor(newTimeOnTarget / 30) * 15
        };
        
        onStatsUpdate(newStats);
        return newStats;
      });
    }, 16);

    return () => {
      if (statsLoopRef.current) clearInterval(statsLoopRef.current);
    };
  }, [isPlaying, isOnTarget, onStatsUpdate]);

  return (
    <>
      {/* Alvo principal */}
      {isPlaying && target && (
        <div
          className={`absolute rounded-full border-4 border-white shadow-lg transition-colors duration-150 ${
            isOnTarget 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}
          style={{
            left: target.x - TARGET_SIZE / 2,
            top: target.y - TARGET_SIZE / 2,
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            zIndex: 10,
          }}
        />
      )}
    </>
  );
};