
import { GameMode } from "@/components/GameModeSelector";
import { GameState } from "@/components/TermoGame";
import { MultiModeGameState } from "@/hooks/useMultiModeGameState";
import { getModeEmoji, getModeLabel, getMaxAttempts } from "./gameModeUtils";

const evaluateGuess = (guess: string, word: string) => {
  const result = [];
  const targetArray = word.toLowerCase().split('');
  const guessArray = guess.toLowerCase().split('');
  
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === targetArray[i]) {
      result[i] = 'correct';
      targetArray[i] = '#';
    } else {
      result[i] = 'absent';
    }
  }
  
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'absent') {
      const letterIndex = targetArray.indexOf(guessArray[i]);
      if (letterIndex !== -1) {
        result[i] = 'present';
        targetArray[letterIndex] = '#';
      }
    }
  }
  
  return result;
};

export const generateShareText = (
  gameState: GameState | MultiModeGameState,
  mode: GameMode,
  isWin: boolean,
  attempts: number,
  allTargetWords: string[]
) => {
  const today = new Date().toLocaleDateString('pt-BR');
  const modeEmoji = getModeEmoji(mode);
  const modeLabel = getModeLabel(mode);
  const maxAttempts = getMaxAttempts(mode);
  
  let shareText = `Termo ${modeLabel} ${modeEmoji} ${today}\n`;
  
  if (isWin) {
    shareText += `✅ ${attempts}/${maxAttempts}\n\n`;
  } else {
    shareText += `❌ X/${maxAttempts}\n\n`;
  }

  // Rastrear quando cada palavra foi completada
  const wordCompletedAt: Record<string, number> = {};
  
  gameState.guesses.forEach((guess, guessIndex) => {
    allTargetWords.forEach((word) => {
      if (guess.toLowerCase() === word.toLowerCase() && !(word in wordCompletedAt)) {
        wordCompletedAt[word] = guessIndex;
      }
    });
  });

  // Gerar os quadrados para cada tentativa
  gameState.guesses.forEach((guess, guessIndex) => {
    if (mode === 'solo') {
      const evaluation = evaluateGuess(guess, allTargetWords[0]);
      shareText += evaluation.map(state => {
        switch (state) {
          case 'correct': return '🟩';
          case 'present': return '🟨';
          default: return '⬛';
        }
      }).join('');
      shareText += '\n';
    } else {
      // Para modos multi-palavra, mostrar uma linha por palavra
      allTargetWords.forEach((word, wordIndex) => {
        // Se a palavra já foi completada em uma tentativa anterior, mostrar cinza
        if (word in wordCompletedAt && wordCompletedAt[word] < guessIndex) {
          shareText += '⬛⬛⬛⬛⬛';
        } else {
          const evaluation = evaluateGuess(guess, word);
          shareText += evaluation.map(state => {
            switch (state) {
              case 'correct': return '🟩';
              case 'present': return '🟨';
              default: return '⬛';
            }
          }).join('');
        }
        if (wordIndex < allTargetWords.length - 1) shareText += ' ';
      });
      shareText += '\n';
    }
  });

  shareText += '\naleeessia.com/termo';
  return shareText;
};
