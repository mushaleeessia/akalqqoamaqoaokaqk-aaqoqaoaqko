
import { GameState } from "./TermoGame";
import { MultiModeGameState } from "@/hooks/useMultiModeGameState";
import { GameMode } from "./GameModeSelector";
import { GameOverDisplay } from "./GameOverDisplay";
import { ShareButton } from "./ShareButton";
import { SecretWordsReveal } from "./SecretWordsReveal";
import { useSecretWordsReveal } from "@/hooks/useSecretWordsReveal";

interface TermoGameOverProps {
  gameState: GameState | MultiModeGameState;
  targetWord: string;
  isDarkMode: boolean;
  mode?: GameMode;
  allTargetWords?: string[];
}

export const TermoGameOver = ({ 
  gameState, 
  targetWord, 
  isDarkMode, 
  mode = 'solo',
  allTargetWords = [targetWord]
}: TermoGameOverProps) => {
  const { showSecretWords } = useSecretWordsReveal();
  
  const isWin = gameState.gameStatus === 'won';
  const attempts = gameState.guesses.length;

  return (
    <div className="flex flex-col items-center space-y-6 p-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
      <GameOverDisplay 
        isWin={isWin}
        attempts={attempts}
        mode={mode}
      />

      <SecretWordsReveal 
        showSecretWords={showSecretWords}
        allTargetWords={allTargetWords}
      />

      <div className="flex justify-center">
        <ShareButton
          gameState={gameState}
          mode={mode}
          isWin={isWin}
          attempts={attempts}
          allTargetWords={allTargetWords}
          isDarkMode={isDarkMode}
        />
      </div>

      <p className="text-white/50 text-sm text-center">
        Uma nova palavra estará disponível amanhã!
      </p>
    </div>
  );
};
