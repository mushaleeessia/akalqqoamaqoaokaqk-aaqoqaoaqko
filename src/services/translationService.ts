
// Usando a API gratuita do Google Translate via mymemory.translated.net
const TRANSLATION_API_URL = 'https://api.mymemory.translated.net/get';

export interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
  responseStatus: number;
}

export const translateText = async (text: string, targetLang: string = 'en'): Promise<string> => {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const sourceLang = targetLang === 'en' ? 'pt' : 'en';
    const url = `${TRANSLATION_API_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    const response = await fetch(url);
    const data: TranslationResponse = await response.json();
    
    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    } else {
      console.warn('Translation failed, returning original text');
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};

// Cache para evitar traduções repetidas
const translationCache = new Map<string, string>();

export const translateTextCached = async (text: string, targetLang: string = 'en'): Promise<string> => {
  const cacheKey = `${text}_${targetLang}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  const translated = await translateText(text, targetLang);
  translationCache.set(cacheKey, translated);
  
  return translated;
};
