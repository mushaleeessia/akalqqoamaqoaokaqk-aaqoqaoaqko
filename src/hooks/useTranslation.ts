
import { useState, useEffect } from 'react';
import { translateTextCached } from '@/services/translationService';

export const useTranslation = (text: string, shouldTranslate: boolean) => {
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!shouldTranslate || !text) {
      setTranslatedText(text);
      return;
    }

    const translateContent = async () => {
      setIsTranslating(true);
      try {
        const translated = await translateTextCached(text, 'en');
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(text); // Fallback para o texto original
      } finally {
        setIsTranslating(false);
      }
    };

    translateContent();
  }, [text, shouldTranslate]);

  return { translatedText, isTranslating };
};
