import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { SimpleAimTrainer } from "@/components/aim/SimpleAimTrainer";
import { AimTrainerStats } from "@/components/aim/AimTrainerStats";
import { AimModeSelector } from "@/components/aim/AimModeSelector";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Zap, Focus, Crosshair } from "lucide-react";

const AimTrainer = () => {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'flick' | 'tracking' | 'gridshot' | 'precision' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Aim Trainer</h1>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para usar o Aim Trainer.
            </p>
          </div>
        </div>
        <Footer isVisible={false} />
      </div>
    );
  }

  const gameModes = [
    {
      id: "gridshot",
      name: "GridShot",
      description: "Alvos em grid que aparecem sequencialmente. Ideal para precisão básica.",
      icon: Target,
      color: "text-blue-500",
      difficulty: "Iniciante"
    },
    {
      id: "flick",
      name: "Flick Shot",
      description: "Alvos que aparecem aleatoriamente. Treina flicks rápidos e precisos.",
      icon: Zap,
      color: "text-yellow-500",
      difficulty: "Intermediário"
    },
    {
      id: "tracking",
      name: "Tracking",
      description: "Alvos que se movem constantemente. Desenvolve rastreamento suave.",
      icon: Focus,
      color: "text-green-500",
      difficulty: "Avançado"
    },
    {
      id: "precision",
      name: "Precision",
      description: "Alvos pequenos estáticos. Máxima precisão em alvos minúsculos.",
      icon: Crosshair,
      color: "text-red-500",
      difficulty: "Expert"
    }
  ];

  if (isPlaying && selectedMode) {
    console.log(`[AIM TRAINER PAGE] Rendering game component for mode: ${selectedMode}`);
    return (
      <div className="min-h-screen bg-background">
        <SimpleAimTrainer 
          mode={selectedMode} 
          onGameEnd={() => {
            console.log("[AIM TRAINER PAGE] Game ended, returning to menu");
            setIsPlaying(false);
            setSelectedMode(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Aim Trainer
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Treine sua pontaria com diferentes modos de jogo. Melhore precisão, velocidade e tempo de reação.
          </p>
        </div>

        {selectedMode ? (
          <AimModeSelector
            mode={selectedMode}
            onStart={() => {
              console.log(`[AIM TRAINER PAGE] Start button clicked for mode: ${selectedMode}`);
              setIsPlaying(true);
            }}
            onBack={() => {
              console.log("[AIM TRAINER PAGE] Back button clicked");
              setSelectedMode(null);
            }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {gameModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <Card 
                    key={mode.id}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                    onClick={() => {
                      console.log(`[AIM TRAINER PAGE] Mode selected: ${mode.id}`);
                      setSelectedMode(mode.id as 'flick' | 'tracking' | 'gridshot' | 'precision');
                    }}
                  >
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-3">
                        <IconComponent className={`w-12 h-12 ${mode.color} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                      <CardTitle className="text-xl">{mode.name}</CardTitle>
                      <CardDescription className="text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                          mode.difficulty === 'Iniciante' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          mode.difficulty === 'Intermediário' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          mode.difficulty === 'Avançado' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {mode.difficulty}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground text-center">
                        {mode.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <AimTrainerStats />
          </>
        )}
      </div>

      <Footer isVisible={false} />
    </div>
  );
};

export default AimTrainer;