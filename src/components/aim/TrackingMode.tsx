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

const TARGET_SIZE = 60; // Aumentando o tamanho do alvo

export const TrackingMode: React.FC<TrackingModeProps> = ({ isPlaying, onStatsUpdate, containerRef }) => {
  const [trackingTarget, setTrackingTarget] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [stats, setStats] = useState<TrackingStats>({
    score: 0,
    accuracy: 0,
    timeOnTarget: 0,
    targetsHit: 0
  });
  const [speed, setSpeed] = useState(1); // Velocidade menor
  const [speedDirection, setSpeedDirection] = useState(1);
  const [totalTime, setTotalTime] = useState(0);
  
  const trackingTimerRef = useRef<NodeJS.Timeout>();
  const statsTimerRef = useRef<NodeJS.Timeout>();

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

    // Update speed gradually (mais devagar)
    setSpeed(prev => {
      const newSpeed = prev + speedDirection * 0.01; // Menor incremento
      if (newSpeed >= 2) { // Velocidade máxima menor
        setSpeedDirection(-1);
        return 2;
      } else if (newSpeed <= 0.5) { // Velocidade mínima
        setSpeedDirection(1);
        return 0.5;
      }
      return newSpeed;
    });
  }, [trackingTarget, isPlaying, getContainerBounds, speed, speedDirection]);

  const checkMousePosition = useCallback((mouseX: number, mouseY: number) => {
    if (!trackingTarget || !isPlaying) {
      console.log('TrackingMode - Não pode checar posição:', 'target:', !!trackingTarget, 'isPlaying:', isPlaying);
      return;
    }

    const distance = Math.sqrt(
      Math.pow(mouseX - trackingTarget.x, 2) + Math.pow(mouseY - trackingTarget.y, 2)
    );

    const nowOnTarget = distance <= TARGET_SIZE / 2;
    console.log('TrackingMode - Mouse:', mouseX, mouseY, 'Target:', trackingTarget.x, trackingTarget.y, 'Distance:', distance, 'SIZE/2:', TARGET_SIZE/2, 'OnTarget:', nowOnTarget);
    setIsOnTarget(nowOnTarget);
  }, [trackingTarget, isPlaying]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !isPlaying) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    console.log('TrackingMode - Mouse move detectado:', mouseX, mouseY, 'Target existe:', !!trackingTarget);
    checkMousePosition(mouseX, mouseY);
  }, [checkMousePosition, containerRef, isPlaying, trackingTarget]);

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
              targetsHit: Math.floor(newTimeOnTarget / 30), // Mais fácil conseguir pontos
              score: Math.floor(newTimeOnTarget / 10) // Score mais generoso
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
      
      setSpeed(1); // Velocidade inicial menor
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

        // Update speed gradually (mais devagar)
        setSpeed(prev => {
          const newSpeed = prev + speedDirection * 0.01; // Menor incremento
          if (newSpeed >= 2) { // Velocidade máxima menor
            setSpeedDirection(-1);
            return 2;
          } else if (newSpeed <= 0.5) { // Velocidade mínima
            setSpeedDirection(1);
            return 0.5;
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
      
      {/* Mouse move handler */}
      {isPlaying && (
      <div
        className="absolute inset-0 w-full h-full pointer-events-auto"
        onMouseMove={handleMouseMove}
        style={{ zIndex: 1 }}
      />
      )}
    </>
  );
};