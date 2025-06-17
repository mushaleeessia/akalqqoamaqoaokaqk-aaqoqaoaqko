
import React from 'react';
import { LetterState } from "@/hooks/useForcaGameState";

interface ForcaKeyboardProps {
  onKeyPress: (key: string) => void;
  keyStates: Record<string, LetterState>;
  isDarkMode: boolean;
  disabled?: boolean;
}

export const ForcaKeyboard = ({ onKeyPress, keyStates, isDarkMode, disabled = false }: ForcaKeyboardProps) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'NOVA']
  ];

  const getKeyClass = (key: string): string => {
    const normalizedKey = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const state = keyStates[normalizedKey];
    
    const baseClass = `h-12 rounded font-bold text-sm transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
    }`;
    
    if (key === 'NOVA') {
      return `${baseClass} px-3 text-xs ${
        isDarkMode 
          ? 'bg-blue-600 text-white hover:bg-blue-500' 
          : 'bg-blue-500 text-white hover:bg-blue-400'
      }`;
    }
    
    const colorClass = isDarkMode
      ? (state === 'correct' ? 'bg-green-600 text-white' :
         state === 'wrong' ? 'bg-red-600 text-white' :
         'bg-gray-600 text-white hover:bg-gray-500')
      : (state === 'correct' ? 'bg-green-500 text-white' :
         state === 'wrong' ? 'bg-red-500 text-white' :
         'bg-gray-200 text-gray-800 hover:bg-gray-300');
    
    return `${baseClass} w-10 ${colorClass}`;
  };

  const handleClick = (key: string) => {
    if (!disabled) {
      onKeyPress(key);
    }
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-lg">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handleClick(key)}
              className={getKeyClass(key)}
              disabled={disabled}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
