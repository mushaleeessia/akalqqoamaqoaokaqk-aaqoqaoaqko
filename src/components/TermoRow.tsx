
import { TermoCell } from "./TermoCell";
import { LetterState } from "@/hooks/useTermoGameState";

interface TermoRowProps {
  letters: string[];
  states: LetterState[];
  isDarkMode: boolean;
  rowIndex: number;
  isCurrentRow?: boolean;
}

export const TermoRow = ({ 
  letters, 
  states, 
  isDarkMode, 
  rowIndex,
  isCurrentRow = false
}: TermoRowProps) => {
  
  return (
    <div className="flex space-x-2">
      {Array.from({ length: 5 }, (_, colIndex) => (
        <TermoCell
          key={`${rowIndex}-${colIndex}`}
          letter={letters[colIndex] || ''}
          state={states[colIndex] || 'empty'}
          isDarkMode={isDarkMode}
          isCurrentRow={isCurrentRow}
        />
      ))}
    </div>
  );
};
