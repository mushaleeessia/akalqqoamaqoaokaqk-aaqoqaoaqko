
// Cache para evitar múltiplas consultas da mesma palavra
const wordCache = new Map<string, boolean>();

// Função para validar palavra usando API de dicionário
export const validatePortugueseWord = async (word: string): Promise<boolean> => {
  const normalizedWord = word.toLowerCase().trim();
  
  // Verificar cache primeiro
  if (wordCache.has(normalizedWord)) {
    return wordCache.get(normalizedWord)!;
  }

  try {
    // Usando a API do Dicio (dicionário português brasileiro)
    const response = await fetch(`https://api.dicionario-aberto.net/word/${normalizedWord}`);
    
    if (response.ok) {
      const data = await response.json();
      const isValid = data && data.length > 0;
      wordCache.set(normalizedWord, isValid);
      return isValid;
    }
    
    // Fallback: se a API falhar, tentar outra fonte
    const fallbackResponse = await fetch(`https://significado.herokuapp.com/v2/significado/${normalizedWord}`);
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      const isValid = fallbackData && !fallbackData.error;
      wordCache.set(normalizedWord, isValid);
      return isValid;
    }
    
    // Se ambas as APIs falharem, aceitar palavras comuns básicas
    const basicWords = ['navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra'];
    const isBasicWord = basicWords.includes(normalizedWord);
    wordCache.set(normalizedWord, isBasicWord);
    return isBasicWord;
    
  } catch (error) {
    console.warn('Erro ao validar palavra:', error);
    
    // Em caso de erro de rede, aceitar palavras básicas
    const basicWords = [
      'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
      'agua', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
      'pedra', 'arvore', 'flor', 'fruto', 'folha', 'raiz', 'broto', 'animal', 'gato', 'cao'
    ];
    const isBasicWord = basicWords.includes(normalizedWord);
    wordCache.set(normalizedWord, isBasicWord);
    return isBasicWord;
  }
};

export const getRandomWord = (): string => {
  const commonWords = [
    'navio', 'termo', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
    'agua', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
    'pedra', 'arvore', 'flor', 'fruto', 'folha', 'animal', 'gato', 'cao', 'peixe',
    'pessoa', 'homem', 'mulher', 'filho', 'filha', 'pai', 'mae', 'amigo', 'livro'
  ];
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};
