
import { LetterState } from "@/hooks/useTermoGameState";

interface TermoCellProps {
  letter: string;
  state: LetterState;
  isDarkMode: boolean;
  isActive?: boolean;
  onClick?: () => void;
  isCurrentRow?: boolean;
}

export const TermoCell = ({ 
  letter, 
  state, 
  isDarkMode, 
  isActive = false,
  onClick,
  isCurrentRow = false
}: TermoCellProps) => {
  
  const getLetterClass = (): string => {
    const baseClass = "w-14 h-14 border-2 flex items-center justify-center text-xl font-bold rounded transition-all duration-200";
    
    // Tornar clicável apenas se for linha atual
    const clickableClass = isCurrentRow && onClick ? "cursor-pointer hover:scale-105" : "";
    
    // Add active state styling
    const activeClass = isActive ? "ring-2 ring-blue-400 ring-offset-1" : "";
    
    if (isDarkMode) {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-600 border-green-600 text-white ${activeClass} ${clickableClass}`;
        case 'present':
          return `${baseClass} bg-yellow-600 border-yellow-600 text-white ${activeClass} ${clickableClass}`;
        case 'absent':
          return `${baseClass} bg-gray-700 border-gray-700 text-white ${activeClass} ${clickableClass}`;
        default:
          return `${baseClass} bg-gray-800 border-gray-600 text-white ${activeClass} ${clickableClass}`;
      }
    } else {
      switch (state) {
        case 'correct':
          return `${baseClass} bg-green-500 border-green-500 text-white ${activeClass} ${clickableClass}`;
        case 'present':
          return `${baseClass} bg-yellow-500 border-yellow-500 text-white ${activeClass} ${clickableClass}`;
        case 'absent':
          return `${baseClass} bg-gray-500 border-gray-500 text-white ${activeClass} ${clickableClass}`;
        default:
          return `${baseClass} bg-white border-gray-300 text-gray-800 ${activeClass} ${clickableClass}`;
      }
    }
  };

  return (
    <div
      className={getLetterClass()}
      onClick={isCurrentRow ? onClick : undefined}
    >
      {letter?.toUpperCase() || ''}
    </div>
  );
};
