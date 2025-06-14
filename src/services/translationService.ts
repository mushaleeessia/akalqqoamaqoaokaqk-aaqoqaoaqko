
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
      result = result.replace(new RegExp(placeholder, 'g'), colorCode);
    });
    return result;
  };

  const encodedText = encodeURIComponent(processedText);
  
  // API 1: MyMemory
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=pt|${targetLang}`);
    if (response.ok) {
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return restoreColorCodes(data.responseData.translatedText);
      }
    }
  } catch (error) {
    console.log('MyMemory API failed, trying next...');
  }

  // API 2: LibreTranslate (public instance)
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: processedText,
        source: 'pt',
        target: targetLang,
        format: 'text'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.translatedText) {
        return restoreColorCodes(data.translatedText);
      }
    }
  } catch (error) {
    console.log('LibreTranslate API failed, trying next...');
  }

  // API 3: Google Translate (unofficial)
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodedText}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return restoreColorCodes(data[0][0][0]);
      }
    }
  } catch (error) {
    console.log('Google Translate API failed, trying next...');
  }

  // API 4: Microsoft Translator (public endpoint)
  try {
    const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=pt&to=${targetLang}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text: processedText }])
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].translations && data[0].translations[0]) {
        return restoreColorCodes(data[0].translations[0].text);
      }
    }
  } catch (error) {
    console.log('Microsoft Translator API failed, trying next...');
  }

  // Fallback: Simple translations for common words
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
    'É verdade né...': 'It\'s true right...'
  };

  // Try simple word-by-word translation
  let simpleTranslation = processedText;
  for (const [portuguese, english] of Object.entries(simpleTranslations)) {
    simpleTranslation = simpleTranslation.replace(new RegExp(portuguese, 'gi'), english);
  }

  if (simpleTranslation !== processedText) {
    return restoreColorCodes(simpleTranslation);
  }

  // If all APIs fail, return original text
  console.log('All translation APIs failed, returning original text');
  return text;
};
