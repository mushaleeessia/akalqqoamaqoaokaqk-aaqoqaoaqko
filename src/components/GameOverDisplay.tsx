
import { GameMode } from "./GameModeSelector";
import { getModeLabel, getModeEmoji } from "@/utils/gameModeUtils";

interface GameOverDisplayProps {
  isWin: boolean;
  attempts: number;
  mode: GameMode;
}

export const GameOverDisplay = ({ isWin, attempts, mode }: GameOverDisplayProps) => {
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">
        {isWin ? '🎉' : '😢'}
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">
        {isWin ? 'Parabéns!' : 'Que pena!'}
      </h2>
      <p className="text-white/80 text-lg mb-4">
        {isWin 
          ? `Você acertou em ${attempts} tentativa${attempts !== 1 ? 's' : ''}!`
          : 'Suas tentativas acabaram!'
        }
      </p>
      
      <div className="text-white/70 text-sm mb-6">
        <p className="mb-2">
          <strong>Modo:</strong> {getModeLabel(mode)} {getModeEmoji(mode)}
        </p>
      </div>
    </div>
  );
};
