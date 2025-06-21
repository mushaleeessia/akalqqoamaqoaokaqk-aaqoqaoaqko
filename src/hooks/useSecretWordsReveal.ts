
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useSecretWordsReveal = () => {
  const [showSecretWords, setShowSecretWords] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.altKey && 
          event.key.toLowerCase() === 's') {
        // Aguardar a próxima tecla 'O'
        const handleNextKey = (nextEvent: KeyboardEvent) => {
          if (nextEvent.key.toLowerCase() === 'o') {
            setShowSecretWords(true);
            toast({
              title: "Palavras reveladas!",
              description: "As palavras secretas estão sendo exibidas.",
            });
          }
          window.removeEventListener('keydown', handleNextKey);
        };
        
        // Adicionar listener temporário para a tecla 'O'
        setTimeout(() => {
          window.addEventListener('keydown', handleNextKey);
          // Remover o listener após 2 segundos se não pressionado
          setTimeout(() => {
            window.removeEventListener('keydown', handleNextKey);
          }, 2000);
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { showSecretWords };
};
