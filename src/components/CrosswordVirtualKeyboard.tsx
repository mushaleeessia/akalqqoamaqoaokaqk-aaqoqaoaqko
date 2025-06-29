
import { Button } from '@/components/ui/button';

interface CrosswordVirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  isDarkMode?: boolean;
}

export const CrosswordVirtualKeyboard = ({ 
  onKeyPress, 
  onDelete, 
  isDarkMode = false 
}: CrosswordVirtualKeyboardProps) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const getKeyClass = () => {
    return `h-10 w-8 text-sm font-bold transition-all duration-200 ${
      isDarkMode 
        ? 'bg-gray-600 text-white hover:bg-gray-500 border-gray-500' 
        : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
    }`;
  };

  return (
    <div className="flex flex-col space-y-2 p-4 bg-white/10 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-white/20 dark:border-gray-700">
      <div className="text-center text-sm font-semibold mb-2 text-white">
        Teclado Virtual
      </div>
      
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1">
          {row.map((key) => (
            <Button
              key={key}
              onClick={() => onKeyPress(key)}
              className={getKeyClass()}
              variant="outline"
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
      
      <div className="flex justify-center space-x-2 mt-2">
        <Button
          onClick={onDelete}
          className="h-10 px-4 text-sm font-bold bg-red-600 hover:bg-red-700 text-white"
        >
          ⌫ Apagar
        </Button>
      </div>
    </div>
  );
};
