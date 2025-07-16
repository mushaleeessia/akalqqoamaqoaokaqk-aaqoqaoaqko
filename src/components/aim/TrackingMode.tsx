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

const TARGET_SIZE = 30;

export const TrackingMode: React.FC<TrackingModeProps> = ({ isPlaying, onStatsUpdate, containerRef }) => {
  const [trackingTarget, setTrackingTarget] = useState<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const [isOnTarget, setIsOnTarget] = useState(false);
  const [stats, setStats] = useState<TrackingStats>({
    score: 0,
    accuracy: 0,
    timeOnTarget: 0,
    targetsHit: 0
  });
  const [speed, setSpeed] = useState(2);
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

    // Update speed gradually
    setSpeed(prev => {
      const newSpeed = prev + speedDirection * 0.03;
      if (newSpeed >= 4) {
        setSpeedDirection(-1);
        return 4;
      } else if (newSpeed <= 1) {
        setSpeedDirection(1);
        return 1;
      }
      return newSpeed;
    });
  }, [trackingTarget, isPlaying, getContainerBounds, speed, speedDirection]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!trackingTarget || !isPlaying) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const size = TARGET_SIZE;

    const distance = Math.sqrt(
      Math.pow(mouseX - trackingTarget.x, 2) + Math.pow(mouseY - trackingTarget.y, 2)
    );

    const nowOnTarget = distance <= size / 2;
    setIsOnTarget(nowOnTarget);
  }, [trackingTarget, isPlaying, containerRef]);

  // Calculate accuracy and update stats every frame
  useEffect(() => {
    if (isPlaying) {
      statsTimerRef.current = setInterval(() => {
        setTotalTime(prev => prev + 1);
        setStats(prev => {
          const newTimeOnTarget = isOnTarget ? prev.timeOnTarget + 1 : prev.timeOnTarget;
          const accuracy = totalTime > 0 ? (newTimeOnTarget / (totalTime + 1)) * 100 : 0;
          const newStats = { 
            ...prev, 
            timeOnTarget: newTimeOnTarget,
            accuracy, 
            targetsHit: Math.floor(newTimeOnTarget / 60), // Score based on time on target
            score: Math.floor(newTimeOnTarget / 60) * 10
          };
          onStatsUpdate(newStats);
          return newStats;
        });
      }, 16); // 60 FPS
    }

    return () => {
      if (statsTimerRef.current) clearInterval(statsTimerRef.current);
    };
  }, [isPlaying, onStatsUpdate, isOnTarget, totalTime]);

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
      
      setSpeed(2);
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

        // Update speed gradually
        setSpeed(prev => {
          const newSpeed = prev + speedDirection * 0.03;
          if (newSpeed >= 4) {
            setSpeedDirection(-1);
            return 4;
          } else if (newSpeed <= 1) {
            setSpeedDirection(1);
            return 1;
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
      {trackingTarget && (
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
          }}
        />
      )}
      
      {/* Mouse move handler */}
      <div
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleMouseMove}
        style={{ zIndex: -1 }}
      />
    </>
  );
};