
import { GameMode } from "./GameModeSelector";

interface MultiModeCompletedMessageProps {
  mode: GameMode;
  sessionInfo: {
    completed?: boolean;
    failed?: boolean;
    attempts: number;
  };
}

export const MultiModeCompletedMessage = ({ mode, sessionInfo }: MultiModeCompletedMessageProps) => {
  const modeLabels = {
    solo: 'Solo',
    duo: 'Duo', 
    trio: 'Trio',
    quarteto: 'Quarteto'
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          {sessionInfo.completed ? '✅ Você já jogou hoje!' : '❌ Tentativas esgotadas!'}
        </h2>
        <p className="text-white/80 mb-2">
          {sessionInfo.completed 
            ? `Parabéns! Você completou o Termo ${modeLabels[mode]} de hoje.`
            : `Você esgotou suas tentativas para o modo ${modeLabels[mode]} hoje.`
          }
        </p>
        <p className="text-white/60 text-sm">
          Uma nova palavra estará disponível amanhã!
        </p>
        <div className="mt-4 text-white/50 text-xs">
          Tentativas realizadas: {sessionInfo.attempts}
        </div>
      </div>
    </div>
  );
};
