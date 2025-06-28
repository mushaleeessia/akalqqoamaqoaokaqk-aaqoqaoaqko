
import { validateWithMultipleAPIs } from './wordValidationAPIs';

// Cache para evitar múltiplas consultas da mesma palavra
const wordCache = new Map<string, { isValid: boolean; correctForm?: string }>();

// Função para normalizar palavra (remover acentos)
const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

// Função para gerar variações plurais e com acentos
const generateWordVariations = (word: string): string[] => {
  const variations = [word.toLowerCase()];
  const normalizedWord = normalizeWord(word);
  variations.push(normalizedWord);
  
  // Variações com acentos comuns
  const accentVariations = [
    normalizedWord.replace(/a/g, 'á'),
    normalizedWord.replace(/e/g, 'é'),
    normalizedWord.replace(/o/g, 'ó'),
    normalizedWord.replace(/u/g, 'ú'),
    normalizedWord.replace(/i/g, 'í'),
    normalizedWord.replace(/c/g, 'ç'),
  ];
  
  // Variações plurais
  const pluralVariations = [];
  
  // Para cada variação base, gerar formas plurais
  [...variations, ...accentVariations].forEach(baseWord => {
    // Plurais regulares
    if (baseWord.endsWith('s')) {
      pluralVariations.push(baseWord); // já é plural
      pluralVariations.push(baseWord.slice(0, -1)); // singular
    } else {
      pluralVariations.push(baseWord + 's'); // plural simples
    }
    
    // Plurais especiais
    if (baseWord.endsWith('ão')) {
      pluralVariations.push(baseWord.slice(0, -2) + 'ões'); // ação -> ações
      pluralVariations.push(baseWord.slice(0, -2) + 'ãos'); // mão -> mãos
    }
    
    if (baseWord.endsWith('al')) {
      pluralVariations.push(baseWord.slice(0, -2) + 'ais'); // animal -> animais
    }
    
    if (baseWord.endsWith('el')) {
      pluralVariations.push(baseWord.slice(0, -2) + 'éis'); // papel -> papéis
    }
    
    if (baseWord.endsWith('ol')) {
      pluralVariations.push(baseWord.slice(0, -2) + 'óis'); // farol -> faróis
    }
    
    if (baseWord.endsWith('il') && baseWord.length > 3) {
      pluralVariations.push(baseWord.slice(0, -2) + 'is'); // perfil -> perfis
    }
    
    if (baseWord.endsWith('r') || baseWord.endsWith('z')) {
      pluralVariations.push(baseWord + 'es'); // flor -> flores, luz -> luzes
    }
    
    if (baseWord.endsWith('m')) {
      pluralVariations.push(baseWord.slice(0, -1) + 'ns'); // homem -> homens
    }
  });
  
  return [...new Set([...variations, ...accentVariations, ...pluralVariations])];
};

// Função principal de validação usando múltiplas fontes
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
    // Gerar todas as variações da palavra (singular, plural, acentos)
    const variations = generateWordVariations(originalWord);
    
    // Testar cada variação no novo sistema de múltiplas APIs
    for (const variation of variations) {
      try {
        const result = await validateWithMultipleAPIs(variation);
        
        if (result.isValid) {
          const validResult = { isValid: true, correctForm: variation };
          wordCache.set(normalizedWord, validResult);
          return validResult;
        }
      } catch (error) {
        continue;
      }
    }
    
    // Fallback final: lista expandida de palavras críticas (incluindo "olhos")
    const criticalWords = [
      // Palavras que sabemos que são válidas mas podem falhar nas APIs
      'olhos', 'dentes', 'bracos', 'pernas', 'cabecas', 'corpos', 'aguas', 'fogos', 'ventos',
      'noites', 'mortes', 'homens', 'mulheres', 'filhos', 'casas', 'portas', 'mesas', 'livros',
      'papeis', 'bocas', 'amores', 'guerras', 'forcas', 'poderes', 'ordens', 'festas', 'jogos',
      'artes', 'obras', 'nomes', 'ideias', 'planos', 'sortes', 'calores', 'frios', 'verdes',
      'azuis', 'pretos', 'brancos', 'carros', 'avioes', 'pontes', 'radios', 'musicas', 'dancas',
      'filmes', 'bancos', 'praias', 'campos', 'flores', 'arvores', 'pedras', 'metais', 'vidros',
      // Palavras específicas que podem dar problema
      'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
      'agua', 'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
      'pedra', 'arvore', 'árvore', 'flor', 'fruto', 'folha', 'raiz', 'broto', 'animal', 'gato', 'cao', 'cão'
    ];
    
    // Procurar todas as variações nas palavras críticas
    for (const variation of variations) {
      const foundCritical = criticalWords.find(critical => 
        normalizeWord(critical) === normalizeWord(variation) || critical === variation
      );
      if (foundCritical) {
        const validResult = { isValid: true, correctForm: foundCritical };
        wordCache.set(normalizedWord, validResult);
        return validResult;
      }
    }
    
    wordCache.set(normalizedWord, { isValid: false });
    return { isValid: false, correctForm: originalWord };
    
  } catch (error) {
    // Em caso de erro total, usar apenas as palavras críticas
    const criticalWords = ['olhos', 'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo'];
    
    const variations = generateWordVariations(originalWord);
    for (const variation of variations) {
      const foundCritical = criticalWords.find(critical => 
        normalizeWord(critical) === normalizeWord(variation) || critical === variation
      );
      if (foundCritical) {
        const validResult = { isValid: true, correctForm: foundCritical };
        wordCache.set(normalizedWord, validResult);
        return validResult;
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
    'pessoa', 'homem', 'mulher', 'filho', 'filha', 'pai', 'mãe', 'amigo', 'livro',
    // Verbos
    'amar', 'viver', 'saber', 'fazer', 'dizer', 'partir', 'chegar', 'voltar',
    'entrar', 'sair', 'correr', 'andar', 'voar', 'nadar', 'dormir', 'comer'
  ];
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};
