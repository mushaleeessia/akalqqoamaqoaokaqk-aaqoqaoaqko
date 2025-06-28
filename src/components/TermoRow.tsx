
import { TermoCell } from "./TermoCell";
import { LetterState } from "@/hooks/useTermoGameState";

interface TermoRowProps {
  letters: string[];
  states: LetterState[];
  isDarkMode: boolean;
  rowIndex: number;
  activeCell?: number;
  onCellClick?: (row: number, col: number) => void;
  isInteractive?: boolean;
}

export const TermoRow = ({ 
  letters, 
  states, 
  isDarkMode, 
  rowIndex,
  activeCell,
  onCellClick,
  isInteractive = false
}: TermoRowProps) => {
  
  return (
    <div className="flex space-x-2">
      {Array.from({ length: 5 }, (_, colIndex) => (
        <TermoCell
          key={colIndex}
          letter={letters[colIndex] || ''}
          state={states[colIndex] || 'empty'}
          isDarkMode={isDarkMode}
          isActive={isInteractive && activeCell === colIndex}
          onClick={isInteractive && onCellClick ? () => onCellClick(rowIndex, colIndex) : undefined}
        />
      ))}
    </div>
  );
};
