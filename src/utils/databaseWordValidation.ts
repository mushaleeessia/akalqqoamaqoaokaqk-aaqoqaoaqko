import { supabase } from "@/integrations/supabase/client";

// Cache para evitar múltiplas consultas da mesma palavra
const wordCache = new Map<string, { isValid: boolean; correctForm?: string }>();

// Função para normalizar palavra (remover acentos) - igual à do banco
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
  const pluralVariations: string[] = [];
  
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

// Função principal de validação usando o banco de dados
export const validatePortugueseWordDatabase = async (word: string): Promise<{ isValid: boolean; correctForm: string }> => {
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
    
    // Buscar no banco de dados usando word_normalized para performance
    const normalizedVariations = variations.map(v => normalizeWord(v));
    
    const { data, error } = await supabase
      .from('portuguese_words')
      .select('word, word_normalized')
      .in('word_normalized', normalizedVariations)
      .eq('is_valid', true)
      .limit(1);
    
    if (error) {
      console.error('Erro ao consultar banco de palavras:', error);
      // Fallback para validação antiga em caso de erro
      const { validatePortugueseWord } = await import('./portugueseWords');
      return await validatePortugueseWord(originalWord);
    }
    
    if (data && data.length > 0) {
      const validWord = data[0];
      const validResult = { isValid: true, correctForm: validWord.word };
      wordCache.set(normalizedWord, validResult);
      return validResult;
    }
    
    // Se não encontrou no banco, palavra é inválida
    wordCache.set(normalizedWord, { isValid: false });
    return { isValid: false, correctForm: originalWord };
    
  } catch (error) {
    console.error('Erro na validação de palavra:', error);
    // Fallback para validação antiga em caso de erro
    const { validatePortugueseWord } = await import('./portugueseWords');
    return await validatePortugueseWord(originalWord);
  }
};

// Função para adicionar nova palavra ao banco (apenas admin)
export const addWordToDatabase = async (word: string): Promise<boolean> => {
  try {
    const cleanWord = word.toLowerCase().trim();
    const { error } = await supabase
      .from('portuguese_words')
      .insert([{ 
        word: cleanWord,
        word_normalized: normalizeWord(cleanWord)
      }]);
    
    if (error) {
      console.error('Erro ao adicionar palavra:', error);
      return false;
    }
    
    // Limpar cache para forçar nova busca
    const normalizedWord = normalizeWord(word);
    wordCache.delete(normalizedWord);
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar palavra:', error);
    return false;
  }
};

export const getRandomWord = (): string => {
  const commonWords = [
    'navio', 'termo', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
    'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
    'pedra', 'árvore', 'flor', 'fruto', 'folha', 'animal', 'gato', 'cão', 'peixe',
    'pessoa', 'homem', 'mulher', 'filho', 'filha', 'pai', 'mãe', 'amigo', 'livro',
    'único', 'única', 'união', 'túnel'
  ];
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};