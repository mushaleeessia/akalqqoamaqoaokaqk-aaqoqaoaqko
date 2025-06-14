
// Translation service with multiple API fallbacks
export const translateText = async (text: string, targetLang: string = 'en'): Promise<string> => {
  if (!text || text.trim() === '') return text;
  
  // Preserve Minecraft color codes and formatting codes by replacing them with placeholders
  const colorCodeRegex = /&[0-9a-fklmnor]/gi;
  const colorCodes: string[] = [];
  let processedText = text;
  
  // Extract and replace color codes with unique placeholders
  processedText = processedText.replace(colorCodeRegex, (match) => {
    const index = colorCodes.length;
    colorCodes.push(match);
    return `__MCCOLOR${index}__`;
  });

  // Function to restore color codes
  const restoreColorCodes = (translatedText: string): string => {
    let result = translatedText;
    colorCodes.forEach((colorCode, index) => {
      const placeholder = `__MCCOLOR${index}__`;
      result = result.replace(new RegExp(placeholder, 'gi'), colorCode);
    });
    return result;
  };

  // Fallback: Simple translations for common words/phrases
  const simpleTranslations: { [key: string]: string } = {
    'Moderadora Secundária': 'Secondary Moderator',
    'Staff desde': 'Staff since',
    'Partner desde': 'Partner since',
    'Primeiro post': 'First post',
    'Drops': 'Drops',
    'aleeessia': 'aleeessia',
    'Olá!': 'Hello!',
    'Sou a': 'I am',
    'moderadora': 'moderator',
    'servidor': 'server',
    'Bem-vindos': 'Welcome',
    'ao meu cantinho!': 'to my corner!',
    'Esse é o primeiro post no meu blog!': 'This is the first post on my blog!',
    'Agora que percebi': 'Now that I realized',
    'eu posso do nada soltar uma chave': 'I can randomly drop a key',
    'que doido né?': 'that\'s crazy right?',
    'Até parece que eu faria isso': 'As if I would do that',
    'até parece...': 'as if...',
    'Olha que legal': 'Look how cool',
    'É verdade né...': 'It\'s true right...',
    'da rede de servidores': 'from the server network',
    'Mush': 'Mush'
  };

  // Try simple word-by-word translation first
  let simpleTranslation = processedText;
  for (const [portuguese, english] of Object.entries(simpleTranslations)) {
    simpleTranslation = simpleTranslation.replace(new RegExp(portuguese, 'gi'), english);
  }

  if (simpleTranslation !== processedText) {
    console.log('Using simple translation fallback');
    return restoreColorCodes(simpleTranslation);
  }

  const encodedText = encodeURIComponent(processedText);
  
  // API 1: Google Translate (most reliable for our use case)
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodedText}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        // Google Translate sometimes returns multiple segments, join them
        let translatedText = '';
        if (Array.isArray(data[0])) {
          translatedText = data[0].map((segment: any) => segment[0] || '').join('');
        } else {
          translatedText = data[0][0][0];
        }
        console.log('Google Translate success');
        return restoreColorCodes(translatedText);
      }
    }
  } catch (error) {
    console.log('Google Translate API failed, trying fallback...');
  }

  // API 2: MyMemory (fallback)
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=pt|${targetLang}`);
    if (response.ok) {
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        console.log('MyMemory success');
        return restoreColorCodes(data.responseData.translatedText);
      }
    }
  } catch (error) {
    console.log('MyMemory API failed');
  }

  // If all APIs fail, return original text
  console.log('All translation APIs failed, returning original text');
  return text;
};
