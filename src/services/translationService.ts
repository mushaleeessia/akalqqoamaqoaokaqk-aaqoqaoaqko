
// Simple translation service using MyMemory API (free, no key required)
export const translateText = async (text: string, targetLang: string = 'en'): Promise<string> => {
  if (!text || text.trim() === '') return text;
  
  try {
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
    
    console.log('Original text:', text);
    console.log('Processed text:', processedText);
    console.log('Color codes found:', colorCodes);
    
    const encodedText = encodeURIComponent(processedText);
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodedText}&langpair=pt|${targetLang}`);
    
    if (!response.ok) {
      console.error('Translation API error:', response.status);
      return text;
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      let translatedText = data.responseData.translatedText;
      
      console.log('Translated text before restoration:', translatedText);
      
      // Restore color codes from placeholders
      colorCodes.forEach((colorCode, index) => {
        const placeholder = `__MCCOLOR${index}__`;
        translatedText = translatedText.replace(new RegExp(placeholder, 'g'), colorCode);
      });
      
      console.log('Final translated text:', translatedText);
      
      return translatedText;
    }
    
    console.error('Translation failed:', data);
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
};
