
import React from 'react';

interface TNTDisplayProps {
  wrongGuesses: number;
  maxWrongGuesses: number;
  gameStatus: 'playing' | 'won' | 'lost';
  isDarkMode?: boolean;
}

export const TNTDisplay = ({ wrongGuesses, maxWrongGuesses, gameStatus, isDarkMode = true }: TNTDisplayProps) => {
  const getRedstoneCount = () => wrongGuesses;
  const isExploded = gameStatus === 'lost';
  
  return (
    <div className={`flex flex-col items-center p-6 rounded-lg ${
      isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
    } border-2 ${isExploded ? 'border-red-500' : 'border-gray-400'}`}>
      {/* TNT Block */}
      <div className={`relative mb-4 transition-all duration-500 ${
        isExploded ? 'animate-pulse scale-110' : ''
      }`}>
        <div className={`w-16 h-16 rounded ${
          isExploded 
            ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-lg shadow-red-500/50' 
            : 'bg-gradient-to-br from-red-500 to-red-700'
        } border-2 border-red-800 flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">TNT</span>
        </div>
        
        {/* Explosion effect */}
        {isExploded && (
          <div className="absolute -inset-4 bg-gradient-radial from-orange-400 via-red-500 to-transparent opacity-75 rounded-full animate-ping"></div>
        )}
      </div>

      {/* Redstone Trail */}
      <div className="flex flex-col items-center space-y-2">
        {/* Lever */}
        <div className={`w-4 h-8 rounded ${
          wrongGuesses > 0 ? 'bg-brown-600' : 'bg-gray-600'
        } border border-gray-800 relative`}>
          <div className={`absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-3 rounded-sm ${
            wrongGuesses > 0 ? 'bg-yellow-400' : 'bg-gray-400'
          } transition-all duration-300 ${wrongGuesses > 0 ? 'rotate-45' : ''}`}></div>
        </div>

        {/* Redstone Dust Trail */}
        <div className="flex flex-col items-center space-y-1">
          {Array.from({ length: maxWrongGuesses }, (_, index) => (
            <div key={index} className={`w-3 h-3 rounded transition-all duration-300 ${
              index < wrongGuesses 
                ? 'bg-red-500 shadow-md shadow-red-500/50 animate-pulse' 
                : 'bg-gray-600'
            }`}></div>
          ))}
        </div>
      </div>

      {/* Status Text */}
      <div className="mt-4 text-center">
        <p className={`text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Redstone: {wrongGuesses}/{maxWrongGuesses}
        </p>
        {isExploded && (
          <p className="text-red-500 font-bold text-lg mt-2 animate-bounce">
            💥 BOOM! 💥
          </p>
        )}
        {gameStatus === 'won' && (
          <p className="text-green-500 font-bold text-lg mt-2">
            🎉 Sucesso! 🎉
          </p>
        )}
      </div>
    </div>
  );
};
