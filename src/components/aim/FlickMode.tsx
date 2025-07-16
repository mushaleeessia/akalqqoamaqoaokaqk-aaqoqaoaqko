import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  isHit: boolean;
  createdAt: number;
}

interface FlickStats {
  score: number;
  targetsHit: number;
  targetsMissed: number;
  totalTargets: number;
  accuracy: number;
  avgReactionTime: number;
  reactionTimes: number[];
  totalClicks: number;
}

interface FlickModeProps {
  isPlaying: boolean;
  onStatsUpdate: (stats: FlickStats) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const TARGET_SIZE = 35;

export const FlickMode: React.FC<FlickModeProps> = ({ isPlaying, onStatsUpdate, containerRef }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<FlickStats>({
    score: 0,
    targetsHit: 0,
    targetsMissed: 0,
    totalTargets: 0,
    accuracy: 0,
    avgReactionTime: 0,
    reactionTimes: [],
    totalClicks: 0
  });
  const nextTargetIdRef = useRef(1);

  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [containerRef]);

  const generateRandomPosition = useCallback(() => {
    const bounds = getContainerBounds();
    const size = TARGET_SIZE;
    const margin = size / 2 + 10;
    const topBarHeight = 60;
    
    return {
      x: Math.random() * (bounds.width - 2 * margin) + margin,
      y: Math.random() * (bounds.height - topBarHeight - 2 * margin) + margin + topBarHeight
    };
  }, [getContainerBounds]);

  const createTarget = useCallback(() => {
    const position = generateRandomPosition();
    
    const newTarget: Target = {
      id: nextTargetIdRef.current++,
      x: position.x,
      y: position.y,
      size: TARGET_SIZE,
      isHit: false,
      createdAt: Date.now()
    };

    setTargets([newTarget]); // Only one target for flick mode
    setStats(prev => ({
      ...prev,
      totalTargets: prev.totalTargets + 1
    }));
  }, [generateRandomPosition]);

  const handleTargetClick = useCallback((targetId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const target = targets.find(t => t.id === targetId);
    if (!target || target.isHit) return;

    const reactionTime = Date.now() - target.createdAt;
    
    setTargets([]);
    
    setStats(prev => {
      const newReactionTimes = [...prev.reactionTimes, reactionTime];
      const newStats = {
        ...prev,
        score: prev.score + 100,
        targetsHit: prev.targetsHit + 1,
        totalClicks: prev.totalClicks + 1,
        reactionTimes: newReactionTimes,
        avgReactionTime: newReactionTimes.reduce((a, b) => a + b, 0) / newReactionTimes.length,
        accuracy: ((prev.targetsHit + 1) / (prev.totalClicks + 1)) * 100
      };
      onStatsUpdate(newStats);
      return newStats;
    });

    // Create new target after delay
    setTimeout(createTarget, 200);
  }, [targets, onStatsUpdate, createTarget]);

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    // Only count missed clicks, not clicks on targets
    const target = event.target as HTMLElement;
    if (target.closest('[data-target]')) return;
    
    setStats(prev => {
      const newTargetsMissed = prev.targetsMissed + 1;
      const newTotalClicks = prev.totalClicks + 1;
      const accuracy = newTotalClicks > 0 ? (prev.targetsHit / newTotalClicks) * 100 : 0;
      
      const newStats = {
        ...prev,
        targetsMissed: newTargetsMissed,
        totalClicks: newTotalClicks,
        accuracy
      };
      onStatsUpdate(newStats);
      return newStats;
    });
  }, [onStatsUpdate]);

  // Initialize game
  useEffect(() => {
    if (isPlaying) {
      console.log('Iniciando Flick Mode');
      setTargets([]);
      setStats({
        score: 0,
        targetsHit: 0,
        targetsMissed: 0,
        totalTargets: 0,
        accuracy: 0,
        avgReactionTime: 0,
        reactionTimes: [],
        totalClicks: 0
      });
      nextTargetIdRef.current = 1;
      setTimeout(createTarget, 500);
    } else {
      setTargets([]);
    }
  }, [isPlaying, createTarget]);

  return (
    <>
      {/* Targets */}
      {targets.map((target) => (
        <div
          key={target.id}
          data-target="true"
          className="absolute rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border-2 border-white shadow-lg cursor-pointer transition-all duration-150 hover:scale-110"
          style={{
            left: target.x - target.size / 2,
            top: target.y - target.size / 2,
            width: target.size,
            height: target.size,
            zIndex: 10,
          }}
          onClick={(e) => handleTargetClick(target.id, e)}
        />
      ))}
      
      {/* Container click handler */}
      <div
        className="absolute inset-0 w-full h-full"
        onClick={handleContainerClick}
        style={{ zIndex: 1 }}
      />
    </>
  );
};