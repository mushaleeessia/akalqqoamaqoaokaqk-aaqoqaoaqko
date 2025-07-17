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

const TARGET_SIZE = 50; // Alvo maior para melhor detecção

export const TrackingMode: React.FC<TrackingModeProps> = ({ isPlaying, onStatsUpdate, containerRef }) => {
  const [trackingTarget, setTrackingTarget] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [stats, setStats] = useState<TrackingStats>({
    score: 0,
    accuracy: 0,
    timeOnTarget: 0,
    targetsHit: 0
  });
  const [speed, setSpeed] = useState(3);
  const [speedDirection, setSpeedDirection] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const trackingTimerRef = useRef<NodeJS.Timeout>();
  const statsTimerRef = useRef<NodeJS.Timeout>();
  const mouseCheckRef = useRef<NodeJS.Timeout>();

  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [containerRef]);

  const updateTrackingTarget = useCallback(() => {
    if (!trackingTarget || !isPlaying) return;

    const bounds = getContainerBounds();
    const size = TARGET_SIZE;
    const topBarHeight = 60;

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
      
      // Bounce off top/bottom, avoiding time bar
      if (newY <= size / 2 + topBarHeight || newY >= bounds.height - size / 2) {
        newVy = -newVy;
        newY = Math.max(size / 2 + topBarHeight, Math.min(bounds.height - size / 2, newY));
      }

      return { x: newX, y: newY, vx: newVx, vy: newVy };
    });

    // Update speed gradually - mais rápido
    setSpeed(prev => {
      const newSpeed = prev + speedDirection * 0.05; // Incremento maior
      if (newSpeed >= 6) { // Velocidade máxima maior
        setSpeedDirection(-1);
        return 6;
      } else if (newSpeed <= 2) { // Velocidade mínima maior
        setSpeedDirection(1);
        return 2;
      }
      return newSpeed;
    });
  }, [trackingTarget, isPlaying, getContainerBounds, speed, speedDirection]);

  // Sistema de hitbox: verifica constantemente se o mouse está dentro do alvo
  const checkHitbox = useCallback(() => {
    if (!trackingTarget || !isPlaying || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Mouse relativo ao container
    const mouseRelativeX = mousePosition.x - rect.left;
    const mouseRelativeY = mousePosition.y - rect.top;
    
    const distance = Math.sqrt(
      Math.pow(mouseRelativeX - trackingTarget.x, 2) + 
      Math.pow(mouseRelativeY - trackingTarget.y, 2)
    );

    const nowOnTarget = distance <= TARGET_SIZE / 2;
    console.log('Hitbox Check - Mouse Relativo:', mouseRelativeX, mouseRelativeY, 'Target:', trackingTarget.x, trackingTarget.y, 'Distance:', distance, 'OnTarget:', nowOnTarget);
    
    if (isOnTarget !== nowOnTarget) {
      setIsOnTarget(nowOnTarget);
    }
  }, [trackingTarget, isPlaying, mousePosition, containerRef, isOnTarget]);

  // Atualiza posição global do mouse
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    if (isPlaying) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isPlaying]);

  // Timer para verificar hitbox constantemente
  useEffect(() => {
    if (isPlaying) {
      mouseCheckRef.current = setInterval(checkHitbox, 16); // 60 FPS
    }

    return () => {
      if (mouseCheckRef.current) clearInterval(mouseCheckRef.current);
    };
  }, [isPlaying, checkHitbox]);

  // Calculate accuracy and update stats every frame
  useEffect(() => {
    if (isPlaying) {
      statsTimerRef.current = setInterval(() => {
        setTotalTime(prev => {
          const newTotalTime = prev + 1;
          setStats(prevStats => {
            const newTimeOnTarget = isOnTarget ? prevStats.timeOnTarget + 1 : prevStats.timeOnTarget;
            const accuracy = newTotalTime > 0 ? (newTimeOnTarget / newTotalTime) * 100 : 0;
            const newStats = { 
              ...prevStats, 
              timeOnTarget: newTimeOnTarget,
              accuracy, 
              targetsHit: Math.floor(newTimeOnTarget / 30), // Mais fácil conseguir pontos com alvo maior
              score: Math.floor(newTimeOnTarget / 30) * 15 // Score ajustado para compensar velocidade
            };
            console.log('Tracking - Atualizando stats:', newStats, 'isOnTarget:', isOnTarget);
            onStatsUpdate(newStats);
            return newStats;
          });
          return newTotalTime;
        });
      }, 16); // 60 FPS
    }

    return () => {
      if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    };
  }, [isPlaying, onStatsUpdate, isOnTarget]);

  // Initialize and cleanup
  useEffect(() => {
    if (isPlaying) {
      console.log('Iniciando Tracking Mode');
      const bounds = getContainerBounds();
      const topBarHeight = 60;
      const size = TARGET_SIZE;
      
      const x = Math.random() * (bounds.width - 2 * size) + size;
      const y = Math.random() * (bounds.height - topBarHeight - 2 * size) + size + topBarHeight;
      
      setTrackingTarget({
        x,
        y,
        vx: Math.random() > 0.5 ? 1 : -1,
        vy: Math.random() > 0.5 ? 1 : -1
      });
      
      setSpeed(3); // Velocidade inicial maior
      setSpeedDirection(1);
      setIsOnTarget(false);
      setTotalTime(0);
      setStats({
        score: 0,
        accuracy: 0,
        timeOnTarget: 0,
        targetsHit: 0
      });
      
      // Start movement timer
      trackingTimerRef.current = setInterval(() => {
        setTrackingTarget(prev => {
          if (!prev || !isPlaying) return prev;

          const bounds = getContainerBounds();
          const size = TARGET_SIZE;
          const topBarHeight = 60;

          let newX = prev.x + prev.vx * speed;
          let newY = prev.y + prev.vy * speed;
          let newVx = prev.vx;
          let newVy = prev.vy;

          // Bounce off walls
          if (newX <= size / 2 || newX >= bounds.width - size / 2) {
            newVx = -newVx;
            newX = Math.max(size / 2, Math.min(bounds.width - size / 2, newX));
          }
          
          // Bounce off top/bottom, avoiding time bar
          if (newY <= size / 2 + topBarHeight || newY >= bounds.height - size / 2) {
            newVy = -newVy;
            newY = Math.max(size / 2 + topBarHeight, Math.min(bounds.height - size / 2, newY));
          }

          return { x: newX, y: newY, vx: newVx, vy: newVy };
        });

        // Update speed gradually - mais rápido
        setSpeed(prev => {
          const newSpeed = prev + speedDirection * 0.05; // Incremento maior
          if (newSpeed >= 6) { // Velocidade máxima maior
            setSpeedDirection(-1);
            return 6;
          } else if (newSpeed <= 2) { // Velocidade mínima maior
            setSpeedDirection(1);
            return 2;
          }
          return newSpeed;
        });
      }, 16); // 60 FPS
      
      console.log('Tracking target criado e timer iniciado');
    } else {
      setTrackingTarget(null);
      if (trackingTimerRef.current) {
        clearInterval(trackingTimerRef.current);
        console.log('Tracking timer limpo');
      }
    }

    return () => {
      if (trackingTimerRef.current) clearInterval(trackingTimerRef.current);
      if (statsTimerRef.current) clearInterval(statsTimerRef.current);
      if (mouseCheckRef.current) clearInterval(mouseCheckRef.current);
    };
  }, [isPlaying, getContainerBounds]);

  return (
    <>
      {/* Tracking Target */}
      {isPlaying && trackingTarget && (
        <div
          className={`absolute rounded-full border-4 border-white shadow-lg transition-all duration-150 ${
            isOnTarget 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}
          style={{
            left: trackingTarget.x - TARGET_SIZE / 2,
            top: trackingTarget.y - TARGET_SIZE / 2,
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            zIndex: 10,
          }}
        />
      )}
      
      {/* Hitbox invisível que acompanha o alvo */}
      {isPlaying && trackingTarget && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: trackingTarget.x - TARGET_SIZE / 2,
            top: trackingTarget.y - TARGET_SIZE / 2,
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            borderRadius: '50%',
            backgroundColor: isOnTarget ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)', // Debug visual
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            zIndex: 5,
          }}
        />
      )}
    </>
  );
};