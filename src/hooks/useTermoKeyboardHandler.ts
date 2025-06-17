
import { useEffect } from "react";

export const useTermoKeyboardHandler = (handleKeyPress: (key: string) => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) return;
      
      const key = event.key.toUpperCase();
      
      if (key === 'ENTER') {
        event.preventDefault();
        handleKeyPress('ENTER');
      } else if (key === 'BACKSPACE') {
        event.preventDefault();
        handleKeyPress('BACKSPACE');
      } else if (/^[A-Z]$/.test(key)) {
        event.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);
};
