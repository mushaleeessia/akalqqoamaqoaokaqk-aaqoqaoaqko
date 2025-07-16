import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  isHit: boolean;
  createdAt: number;
}

interface GridshotStats {
  score: number;
  targetsHit: number;
  targetsMissed: number;
  totalTargets: number;
  accuracy: number;
  totalClicks: number;
}

interface GridshotModeProps {
  isPlaying: boolean;
  onStatsUpdate: (stats: GridshotStats) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const TARGET_SIZE = 40;

export const GridshotMode: React.FC<GridshotModeProps> = ({ isPlaying, onStatsUpdate, containerRef }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<GridshotStats>({
    score: 0,
    targetsHit: 0,
    targetsMissed: 0,
    totalTargets: 0,
    accuracy: 0,
    totalClicks: 0
  });
  const nextTargetIdRef = useRef(1);

  const getContainerBounds = useCallback(() => {
    if (!containerRef.current) return { width: 800, height: 600 };
    const rect = containerRef.current.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }, [containerRef]);

  const createGridTargets = useCallback(() => {
    const bounds = getContainerBounds();
    const size = TARGET_SIZE;
    const cols = 4;
    const rows = 3;
    const totalWidth = cols * size;
    const totalHeight = rows * size;
    const marginX = (bounds.width - totalWidth) / (cols + 1);
    const marginY = (bounds.height - 60 - totalHeight) / (rows + 1);

    const newTargets: Target[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        newTargets.push({
          id: nextTargetIdRef.current++,
          x: marginX + col * (marginX + size) + size / 2,
          y: marginY + row * (marginY + size) + size / 2 + 60, // Add 60px for top bar
          size,
          isHit: false,
          createdAt: Date.now()
        });
      }
    }

    setTargets(newTargets);
    setStats(prev => ({
      ...prev,
      totalTargets: prev.totalTargets + newTargets.length
    }));
  }, [getContainerBounds]);

  const handleTargetClick = useCallback((targetId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const target = targets.find(t => t.id === targetId);
    if (!target || target.isHit) return;

    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    setStats(prev => {
      const newStats = {
        ...prev,
        score: prev.score + 100,
        targetsHit: prev.targetsHit + 1,
        totalClicks: prev.totalClicks + 1,
        accuracy: ((prev.targetsHit + 1) / (prev.totalClicks + 1)) * 100
      };
      onStatsUpdate(newStats);
      return newStats;
    });
  }, [targets, onStatsUpdate]);

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    // Only count missed clicks, not clicks on targets
    const target = event.target as HTMLElement;
    if (target.closest('[data-target]')) return;
    
    setStats(prev => {
      const newStats = {
        ...prev,
        targetsMissed: prev.targetsMissed + 1,
        totalClicks: prev.totalClicks + 1,
        accuracy: prev.totalClicks > 0 ? (prev.targetsHit / (prev.totalClicks + 1)) * 100 : 0
      };
      onStatsUpdate(newStats);
      return newStats;
    });
  }, [onStatsUpdate]);

  // Auto-restart gridshot when all targets are hit
  useEffect(() => {
    if (isPlaying && targets.length === 0 && stats.totalTargets > 0) {
      setTimeout(createGridTargets, 500);
    }
  }, [isPlaying, targets.length, stats.totalTargets, createGridTargets]);

  // Initialize game
  useEffect(() => {
    if (isPlaying) {
      console.log('Iniciando Gridshot Mode');
      setTargets([]);
      setStats({
        score: 0,
        targetsHit: 0,
        targetsMissed: 0,
        totalTargets: 0,
        accuracy: 0,
        totalClicks: 0
      });
      nextTargetIdRef.current = 1;
      setTimeout(createGridTargets, 100);
    } else {
      setTargets([]);
    }
  }, [isPlaying, createGridTargets]);

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
          }}
          onClick={(e) => handleTargetClick(target.id, e)}
        />
      ))}
      
      {/* Container click handler */}
      <div
        className="absolute inset-0 w-full h-full"
        onClick={handleContainerClick}
        style={{ zIndex: -1 }}
      />
    </>
  );
};