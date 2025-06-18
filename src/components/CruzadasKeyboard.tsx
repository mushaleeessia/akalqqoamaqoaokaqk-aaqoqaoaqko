
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Backspace } from 'lucide-react';

interface CruzadasKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  isDarkMode: boolean;
}

export const CruzadasKeyboard = ({ onKeyPress, onBackspace, isDarkMode }: CruzadasKeyboardProps) => {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map(letter => (
            <Button
              key={letter}
              variant="outline"
              size="sm"
              className={cn(
                "h-10 w-8 p-0 text-sm font-bold transition-all duration-200",
                isDarkMode 
                  ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
                  : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
              )}
              onClick={() => onKeyPress(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex justify-center mt-3">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-10 px-4 font-bold transition-all duration-200",
            isDarkMode 
              ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600" 
              : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
          )}
          onClick={onBackspace}
        >
          <Backspace className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
