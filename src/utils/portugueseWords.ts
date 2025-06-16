
// Cache para evitar múltiplas consultas da mesma palavra
const wordCache = new Map<string, { isValid: boolean; correctForm?: string }>();

// Função para normalizar palavra (remover acentos)
const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

// Função para gerar variações com acentos possíveis
const generateAccentVariations = (word: string): string[] => {
  const variations = [word];
  const accentMap: Record<string, string[]> = {
    'a': ['a', 'á', 'à', 'â', 'ã'],
    'e': ['e', 'é', 'ê'],
    'i': ['i', 'í'],
    'o': ['o', 'ó', 'ô', 'õ'],
    'u': ['u', 'ú', 'ü'],
    'c': ['c', 'ç'],
    'n': ['n', 'ñ']
  };

  const normalizedWord = normalizeWord(word);
  
  // Gerar algumas variações comuns
  const commonVariations = [
    normalizedWord,
    normalizedWord.replace(/a/g, 'á'),  // aureo -> áureo
    normalizedWord.replace(/e/g, 'é'),  
    normalizedWord.replace(/o/g, 'ó'),  
    normalizedWord.replace(/u/g, 'ú'),  
    normalizedWord.replace(/i/g, 'í'),  
    normalizedWord.replace(/c/g, 'ç'),  
  ];

  return [...new Set([...variations, ...commonVariations])];
};

// Função para validar palavra usando API de dicionário
export const validatePortugueseWord = async (word: string): Promise<{ isValid: boolean; correctForm: string }> => {
  const originalWord = word.toLowerCase().trim();
  const normalizedWord = normalizeWord(originalWord);
  
  // Verificar cache primeiro
  if (wordCache.has(normalizedWord)) {
    const cached = wordCache.get(normalizedWord)!;
    return { 
      isValid: cached.isValid, 
      correctForm: cached.correctForm || originalWord 
    };
  }

  try {
    // Gerar variações da palavra para testar
    const variations = generateAccentVariations(originalWord);
    
    // Testar cada variação na API
    for (const variation of variations) {
      try {
        const response = await fetch(`https://api.dicionario-aberto.net/word/${variation}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const correctForm = data[0].word || variation;
            wordCache.set(normalizedWord, { isValid: true, correctForm });
            return { isValid: true, correctForm };
          }
        }
      } catch (error) {
        console.warn(`Erro ao testar variação "${variation}":`, error);
        continue;
      }
    }
    
    // Fallback: tentar outra fonte com as variações
    for (const variation of variations) {
      try {
        const fallbackResponse = await fetch(`https://significado.herokuapp.com/v2/significado/${variation}`);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && !fallbackData.error) {
            wordCache.set(normalizedWord, { isValid: true, correctForm: variation });
            return { isValid: true, correctForm: variation };
          }
        }
      } catch (error) {
        console.warn(`Erro ao testar variação "${variation}" no fallback:`, error);
        continue;
      }
    }
    
    // Se ambas as APIs falharem, verificar palavras básicas
    const basicWords = [
      'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
      'agua', 'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
      'pedra', 'arvore', 'árvore', 'flor', 'fruto', 'folha', 'raiz', 'broto', 'animal', 'gato', 'cao', 'cão',
      'aureo', 'áureo', 'acido', 'ácido', 'musica', 'música', 'historia', 'história'
    ];
    
    // Procurar tanto a palavra original quanto suas variações nas palavras básicas
    for (const variation of variations) {
      const foundBasic = basicWords.find(basic => 
        normalizeWord(basic) === normalizeWord(variation) || basic === variation
      );
      if (foundBasic) {
        wordCache.set(normalizedWord, { isValid: true, correctForm: foundBasic });
        return { isValid: true, correctForm: foundBasic };
      }
    }
    
    wordCache.set(normalizedWord, { isValid: false });
    return { isValid: false, correctForm: originalWord };
    
  } catch (error) {
    console.warn('Erro ao validar palavra:', error);
    
    // Em caso de erro de rede, aceitar palavras básicas
    const basicWords = [
      'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
      'agua', 'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
      'pedra', 'arvore', 'árvore', 'flor', 'fruto', 'folha', 'raiz', 'broto', 'animal', 'gato', 'cao', 'cão',
      'aureo', 'áureo', 'acido', 'ácido', 'musica', 'música', 'historia', 'história'
    ];
    
    const variations = generateAccentVariations(originalWord);
    for (const variation of variations) {
      const foundBasic = basicWords.find(basic => 
        normalizeWord(basic) === normalizeWord(variation) || basic === variation
      );
      if (foundBasic) {
        wordCache.set(normalizedWord, { isValid: true, correctForm: foundBasic });
        return { isValid: true, correctForm: foundBasic };
      }
    }
    
    wordCache.set(normalizedWord, { isValid: false });
    return { isValid: false, correctForm: originalWord };
  }
};

export const getRandomWord = (): string => {
  const commonWords = [
    'navio', 'termo', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
    'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
    'pedra', 'árvore', 'flor', 'fruto', 'folha', 'animal', 'gato', 'cão', 'peixe',
    'pessoa', 'homem', 'mulher', 'filho', 'filha', 'pai', 'mãe', 'amigo', 'livro'
  ];
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};
