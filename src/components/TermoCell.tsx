
import { LetterState } from "@/hooks/useTermoGameState";

interface TermoCellProps {
  letter: string;
  state: LetterState;
  isDarkMode: boolean;
  isCurrentRow?: boolean;
}

export const TermoCell = ({ 
  letter, 
  state, 
  isDarkMode, 
  isCurrentRow = false
}: TermoCellProps) => {
  
  const getLetterClass = (): string => {
    const baseClass = "w-14 h-14 border-2 flex items-center justify-center text-xl font-bold rounded transition-all duration-200";
    
    if (isDarkMode) {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-600 border-green-600 text-white`;
        case 'present':
          return `${baseClass} bg-yellow-600 border-yellow-600 text-white`;
        case 'absent':
          return `${baseClass} bg-gray-700 border-gray-700 text-white`;
        default:
          return `${baseClass} bg-gray-800 border-gray-600 text-white`;
      }
    } else {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-500 border-green-500 text-white`;
        case 'present':
          return `${baseClass} bg-yellow-500 border-yellow-500 text-white`;
        case 'absent':
          return `${baseClass} bg-gray-500 border-gray-500 text-white`;
        default:
          return `${baseClass} bg-white border-gray-300 text-gray-800`;
      }
    }
  };

  return (
    <div className={getLetterClass()}>
      {letter?.toUpperCase() || ''}
    </div>
  );
};
