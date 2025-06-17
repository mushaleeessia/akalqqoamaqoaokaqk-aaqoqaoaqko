
import React from 'react';
import { TNTDisplay } from './TNTDisplay';
import { ForcaKeyboard } from './ForcaKeyboard';
import { useForcaGameState } from '@/hooks/useForcaGameState';
import { useTermoKeyboardHandler } from '@/hooks/useTermoKeyboardHandler';

interface ForcaGameProps {
  isDarkMode?: boolean;
}

export const ForcaGame = ({ isDarkMode = true }: ForcaGameProps) => {
  const { gameState, keyStates, maxWrongGuesses, handleKeyPress, startNewGame } = useForcaGameState();
  
  useTermoKeyboardHandler(handleKeyPress);

  const getDisplayText = () => {
    return gameState.displayWord.join(' ').toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      {/* Category and Hint */}
      <div className="text-center max-w-md">
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
          isDarkMode 
            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {gameState.currentWord.category}
        </div>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          💡 {gameState.currentWord.hint}
        </p>
      </div>

      {/* TNT Display */}
      <TNTDisplay 
        wrongGuesses={gameState.wrongGuesses}
        maxWrongGuesses={maxWrongGuesses}
        gameStatus={gameState.gameStatus}
        isDarkMode={isDarkMode}
      />

      {/* Word Display */}
      <div className={`text-4xl font-mono font-bold tracking-wider p-4 rounded-lg ${
        isDarkMode ? 'bg-gray-800/30 text-white' : 'bg-gray-100/50 text-gray-900'
      } border-2 ${
        gameState.gameStatus === 'won' ? 'border-green-500' : 
        gameState.gameStatus === 'lost' ? 'border-red-500' : 'border-gray-400'
      }`}>
        {getDisplayText()}
      </div>

      {/* Game Over Message */}
      {gameState.gameStatus !== 'playing' && (
        <div className="text-center">
          {gameState.gameStatus === 'won' ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-500">🎉 Parabéns! 🎉</p>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Você salvou a TNT!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-2xl font-bold text-red-500">💥 Game Over! 💥</p>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                A palavra era: <span className="font-bold text-white">{gameState.currentWord.word.toUpperCase()}</span>
              </p>
            </div>
          )}
          <button
            onClick={startNewGame}
            className={`mt-4 px-6 py-2 rounded-lg font-bold transition-all duration-200 hover:scale-105 ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            Nova Palavra
          </button>
        </div>
      )}

      {/* Keyboard */}
      <ForcaKeyboard
        onKeyPress={handleKeyPress}
        keyStates={keyStates}
        isDarkMode={isDarkMode}
        disabled={gameState.gameStatus !== 'playing'}
      />

      {/* Instructions */}
      <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-md`}>
        <p>Digite uma letra ou clique no teclado virtual.</p>
        <p>6 erros e a TNT explode! 💣</p>
      </div>
    </div>
  );
};
