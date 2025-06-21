
import { LetterState } from "@/hooks/useTermoGameState";

interface TermoKeyboardProps {
  onKeyPress: (key: string) => void;
  keyStates: Record<string, LetterState>;
  isDarkMode: boolean;
  disabled?: boolean;
}

export const TermoKeyboard = ({ onKeyPress, keyStates, isDarkMode, disabled = false }: TermoKeyboardProps) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  const getKeyClass = (key: string): string => {
    const state = keyStates[key.toLowerCase()];
    const baseClass = `h-14 rounded font-bold text-sm transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
    }`;
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return `${baseClass} px-3 text-xs`;
    }
    
    const colorClass = isDarkMode
      ? (state === 'correct' ? 'bg-green-600 text-white' :
         state === 'present' ? 'bg-yellow-600 text-white' :
         state === 'absent' ? 'bg-gray-700 text-white' :
         'bg-gray-600 text-white hover:bg-gray-500')
      : (state === 'correct' ? 'bg-green-500 text-white' :
         state === 'present' ? 'bg-yellow-500 text-white' :
         state === 'absent' ? 'bg-gray-500 text-white' :
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
              {key === 'BACKSPACE' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};
