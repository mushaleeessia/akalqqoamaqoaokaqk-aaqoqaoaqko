
import { LetterState } from "./TermoGame";
import { Button } from "@/components/ui/button";

interface TermoKeyboardProps {
  onKeyPress: (key: string) => void;
  keyStates: Record<string, LetterState>;
  isDarkMode: boolean;
}

export const TermoKeyboard = ({ onKeyPress, keyStates, isDarkMode }: TermoKeyboardProps) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
    ['ENTER', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACKSPACE']
  ];

  const getKeyClass = (key: string, state: LetterState | undefined): string => {
    const baseClass = "h-12 text-sm font-semibold rounded transition-all duration-200 active:scale-95";
    
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return `${baseClass} px-3 ${
        isDarkMode 
          ? 'bg-gray-600 hover:bg-gray-500 text-white border border-gray-500' 
          : 'bg-gray-300 hover:bg-gray-400 text-gray-800 border border-gray-400'
      }`;
    }

    if (isDarkMode) {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-600 hover:bg-green-500 text-white border border-green-500`;
        case 'present':
          return `${baseClass} bg-yellow-600 hover:bg-yellow-500 text-white border border-yellow-500`;
        case 'absent':
          return `${baseClass} bg-gray-700 hover:bg-gray-600 text-white border border-gray-600`;
        default:
          return `${baseClass} bg-gray-500 hover:bg-gray-400 text-white border border-gray-400`;
      }
    } else {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-500 hover:bg-green-400 text-white border border-green-400`;
        case 'present':
          return `${baseClass} bg-yellow-500 hover:bg-yellow-400 text-white border border-yellow-400`;
        case 'absent':
          return `${baseClass} bg-gray-500 hover:bg-gray-400 text-white border border-gray-400`;
        default:
          return `${baseClass} bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300`;
      }
    }
  };

  const getKeyLabel = (key: string): string => {
    if (key === 'BACKSPACE') return '⌫';
    if (key === 'ENTER') return '↵';
    return key.toUpperCase();
  };

  return (
    <div className="flex flex-col space-y-2 w-full max-w-lg">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1">
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => onKeyPress(key)}
              className={getKeyClass(key, keyStates[key])}
              style={{ 
                minWidth: key === 'ENTER' || key === 'BACKSPACE' ? '65px' : '40px',
                height: '48px'
              }}
            >
              {getKeyLabel(key)}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
};
