
// Translation service with reliable free API
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

  // Simple translations for common words/phrases (expanded)
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
    'servidores': 'servers',
    'Bem-vindos': 'Welcome',
    'ao meu cantinho!': 'to my corner!',
    'Esse é o primeiro post no meu blog!': 'This is the first post on my blog!',
    'Agora que percebi': 'Now that I realized',
    'eu posso do nada soltar uma chave': 'I can randomly drop a key',
    'de um vip aqui': 'of a VIP here',
    'e ela não seria resgatada por muuuito tempo': 'and it wouldn\'t be claimed for a very long time',
    'que doido né?': 'that\'s crazy right?',
    'Até parece que eu faria isso': 'As if I would do that',
    'até parece...': 'as if...',
    'Olha que legal': 'Look how cool',
    'É verdade né...': 'It\'s true right...',
    'da rede de servidores': 'from the server network',
    'Mush': 'Mush',
    'cantinho': 'corner',
    'blog': 'blog',
    'post': 'post',
    'primeiro': 'first'
  };

  // Try simple word-by-word translation first
  let result = processedText;
  for (const [portuguese, english] of Object.entries(simpleTranslations)) {
    result = result.replace(new RegExp(portuguese, 'gi'), english);
  }

  // If we made significant changes with simple translation, use it
  const changesMade = processedText !== result;
  if (changesMade) {
    console.log('Using enhanced simple translation');
    return restoreColorCodes(result);
  }

  // Try with a reliable free translation API
  try {
    // Using translate.googleapis.com endpoint which is more reliable
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(processedText)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && Array.isArray(data[0])) {
        // Google Translate returns an array of translation segments
        let translatedText = '';
        for (const segment of data[0]) {
          if (segment && segment[0]) {
            translatedText += segment[0];
          }
        }
        
        if (translatedText && translatedText.trim() !== '') {
          console.log('Google Translate API success');
          return restoreColorCodes(translatedText);
        }
      }
    }
  } catch (error) {
    console.log('Google Translate failed, trying fallback...');
  }

  // Fallback: Use another free API
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(processedText)}&langpair=pt|${targetLang}`);
    if (response.ok) {
      const data = await response.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        console.log('MyMemory API success');
        return restoreColorCodes(data.responseData.translatedText);
      }
    }
  } catch (error) {
    console.log('MyMemory API failed');
  }

  // If all else fails, try a more comprehensive simple translation
  const comprehensiveTranslation = processedText
    .replace(/da rede de/gi, 'from the network of')
    .replace(/servidor/gi, 'server')
    .replace(/desde/gi, 'since')
    .replace(/Moderadora/gi, 'Moderator')
    .replace(/Secundária/gi, 'Secondary')
    .replace(/Staff/gi, 'Staff')
    .replace(/Partner/gi, 'Partner')
    .replace(/Primeiro/gi, 'First')
    .replace(/post/gi, 'post')
    .replace(/blog/gi, 'blog')
    .replace(/Olá/gi, 'Hello')
    .replace(/Sou a/gi, 'I am')
    .replace(/Bem-vindos/gi, 'Welcome')
    .replace(/cantinho/gi, 'corner')
    .replace(/Esse é o/gi, 'This is the')
    .replace(/no meu/gi, 'on my')
    .replace(/Agora que percebi/gi, 'Now that I realized')
    .replace(/eu posso/gi, 'I can')
    .replace(/do nada/gi, 'randomly')
    .replace(/soltar/gi, 'drop')
    .replace(/uma chave/gi, 'a key')
    .replace(/que doido/gi, 'that\'s crazy')
    .replace(/né\?/gi, 'right?')
    .replace(/Até parece/gi, 'As if')
    .replace(/faria isso/gi, 'would do that')
    .replace(/Olha que legal/gi, 'Look how cool')
    .replace(/É verdade/gi, 'It\'s true')
    .replace(/verdade/gi, 'true');

  if (comprehensiveTranslation !== processedText) {
    console.log('Using comprehensive simple translation fallback');
    return restoreColorCodes(comprehensiveTranslation);
  }

  // Final fallback: return original text
  console.log('All translation methods failed, returning original text');
  return text;
};
