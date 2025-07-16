import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface TestTarget {
  id: string;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

interface AimTrainerTestProps {
  mode: string;
  onGameEnd: () => void;
}

export const AimTrainerTest = ({ mode, onGameEnd }: AimTrainerTestProps) => {
  const [targets, setTargets] = useState<TestTarget[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos para teste
  const gameAreaRef = useRef<HTMLDivElement>(null);

  console.log(`[TEST TRAINER] Iniciado modo: ${mode}`);

  const createTarget = useCallback(() => {
    console.log("[TEST TRAINER] Criando alvo...");
    if (!gameAreaRef.current) {
      console.warn("[TEST TRAINER] Sem referência da área de jogo");
      return;
    }

    const gameArea = gameAreaRef.current.getBoundingClientRect();
    const size = 60;
    const margin = size / 2;
    
    const x = Math.random() * (gameArea.width - size - margin * 2) + margin;
    const y = Math.random() * (gameArea.height - size - margin * 2) + margin;

    const newTarget: TestTarget = {
      id: Date.now().toString(),
      x,
      y,
      size,
      createdAt: Date.now(),
    };

    console.log(`[TEST TRAINER] Alvo criado: ${newTarget.id} na posição (${x}, ${y})`);
    setTargets(prev => [...prev, newTarget]);
  }, []);

  const handleTargetClick = (targetId: string) => {
    console.log(`[TEST TRAINER] Alvo clicado: ${targetId}`);
    setTargets(prev => prev.filter(t => t.id !== targetId));
    setScore(prev => prev + 10);
  };

  const handleMiss = () => {
    console.log("[TEST TRAINER] Erro - clicou fora do alvo");
  };

  // Timer do jogo
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          console.log("[TEST TRAINER] Tempo esgotado!");
          setGameStarted(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft]);

  // Criação de alvos
  useEffect(() => {
    if (!gameStarted) return;

    console.log("[TEST TRAINER] Iniciando criação de alvos...");
    
    // Criar primeiro alvo imediatamente
    createTarget();

    // Criar novos alvos a cada 2 segundos
    const spawnTimer = setInterval(() => {
      if (targets.length < 3) { // Máximo 3 alvos por vez
        createTarget();
      }
    }, 2000);

    return () => clearInterval(spawnTimer);
  }, [gameStarted, targets.length, createTarget]);

  if (timeLeft <= 0 && gameStarted) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Teste Finalizado!</h2>
            <p className="mb-4">Pontuação: {score}</p>
            <Button onClick={onGameEnd}>
              Voltar ao Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onGameEnd}>
            <X className="w-4 h-4 mr-2" />
            Sair
          </Button>
          <h1 className="text-xl font-bold">Teste {mode}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-muted-foreground">Pontos:</span> <span className="font-bold">{score}</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Tempo:</span> <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {!gameStarted ? (
          <div className="flex items-center justify-center h-full">
            <Card className="w-96">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Teste do {mode}</h2>
                <p className="text-muted-foreground mb-6">
                  Versão simplificada para teste. Clique nos alvos que aparecem!
                </p>
                <Button onClick={() => {
                  console.log("[TEST TRAINER] Iniciando jogo...");
                  setGameStarted(true);
                }} size="lg">
                  Iniciar Teste
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
            {targets.map((target) => (
              <div
                key={target.id}
                className="absolute bg-red-500 hover:bg-red-400 rounded-full cursor-pointer transition-colors duration-150 border-2 border-white shadow-lg"
                style={{
                  left: target.x,
                  top: target.y,
                  width: target.size,
                  height: target.size,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTargetClick(target.id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};