
import { useEffect, useState } from 'react';

import { Language } from "@/contexts/LanguageContext";

interface ForeignerNoticeProps {
  language: Language;
}

export const ForeignerNotice = ({ language }: ForeignerNoticeProps) => {
  if (language === 'pt') return null;
  
  const getMessage = () => {
    switch (language) {
      case 'en':
        return "⚠️ You are viewing this website in English. Translations may not be 100% accurate.";
      case 'it':
        return "⚠️ Stai visualizzando questo sito web in italiano. Le traduzioni potrebbero non essere accurate al 100%.";
      default:
        return "⚠️ Você está visualizando este site traduzido. As traduções podem não estar 100% precisas.";
    }
  };

  const [shouldRender, setShouldRender] = useState(true);
  const [isAnimating, setIsAnimating] = useState(true);

  if (!shouldRender) return null;

  return (
    <div 
      className={`w-full max-w-sm p-3 bg-gradient-to-br from-amber-50/80 via-orange-100/70 to-red-200/60 backdrop-blur-sm rounded-lg border border-red-300/50 shadow-lg transition-all duration-500 ease-in-out ${
        isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
    >
      <div className="text-red-800 text-xs leading-relaxed">
        {getMessage()}
      </div>
    </div>
  );
};
