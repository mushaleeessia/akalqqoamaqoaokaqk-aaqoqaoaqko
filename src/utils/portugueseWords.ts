
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
    // Gerar todas as variações da palavra (singular, plural, acentos)
    const variations = generateWordVariations(originalWord);
    
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
        continue;
      }
    }
    
    // Lista expandida de palavras básicas incluindo verbos
    const basicWords = [
      // Substantivos
      'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
      'agua', 'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
      'pedra', 'arvore', 'árvore', 'flor', 'fruto', 'folha', 'raiz', 'broto', 'animal', 'gato', 'cao', 'cão',
      'aureo', 'áureo', 'acido', 'ácido', 'musica', 'música', 'historia', 'história', 'homem', 'mulher',
      'papel', 'livro', 'mesa', 'porta', 'janela', 'carro', 'aviao', 'avião', 'trem', 'barca',
      // Plurais
      'navios', 'termos', 'palavras', 'jogos', 'casas', 'vidas', 'tempos', 'mundos', 'amores', 'terras',
      'aguas', 'águas', 'fogos', 'ventos', 'luzes', 'noites', 'sóis', 'luas', 'mares', 'rios', 'montes',
      'pedras', 'arvores', 'árvores', 'flores', 'frutos', 'folhas', 'raízes', 'brotos', 'animais', 'gatos', 'caes', 'cães',
      'aureos', 'áureos', 'acidos', 'ácidos', 'musicas', 'músicas', 'historias', 'histórias', 'homens', 'mulheres',
      'papeis', 'papéis', 'livros', 'mesas', 'portas', 'janelas', 'carros', 'avioes', 'aviões', 'trens', 'barcas',
      // Verbos infinitivos
      'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer', 'partir', 'chegar', 'voltar',
      'entrar', 'sair', 'subir', 'descer', 'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar',
      'dormir', 'comer', 'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir', 'tocar', 'pegar',
      'soltar', 'abrir', 'fechar', 'ligar', 'parar', 'começar', 'acabar', 'ganhar', 'perder',
      'jogar', 'ler', 'escrever', 'cantar', 'dançar', 'rir', 'chorar', 'gritar',
      // Verbos conjugados
      'amou', 'viveu', 'morreu', 'soube', 'pôde', 'disse', 'partiu', 'chegou', 'voltou',
      'entrou', 'saiu', 'subiu', 'desceu', 'correu', 'andou', 'saltou', 'pulou', 'voou',
      'nadou', 'dormiu', 'comeu', 'bebeu', 'falou', 'ouviu', 'viu', 'olhou', 'sentiu',
      'tocou', 'pegou', 'soltou', 'abriu', 'fechou', 'ligou', 'parou', 'ganhou', 'perdeu',
      'jogou', 'leu', 'cantou', 'dançou', 'riu', 'chorou', 'gritou'
    ];
    
    // Procurar todas as variações nas palavras básicas
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
    // Em caso de erro de rede, usar lista básica expandida
    const basicWords = [
      'navio', 'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'terra',
      'agua', 'água', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
      'pedra', 'arvore', 'árvore', 'flor', 'fruto', 'folha', 'raiz', 'broto', 'animal', 'gato', 'cao', 'cão',
      'aureo', 'áureo', 'acido', 'ácido', 'musica', 'música', 'historia', 'história', 'homem', 'mulher',
      'navios', 'termos', 'palavras', 'jogos', 'casas', 'vidas', 'tempos', 'mundos', 'amores', 'terras',
      'aguas', 'águas', 'fogos', 'ventos', 'luzes', 'noites', 'sóis', 'luas', 'mares', 'rios', 'montes',
      'pedras', 'arvores', 'árvores', 'flores', 'frutos', 'folhas', 'raízes', 'brotos', 'animais', 'gatos', 'caes', 'cães',
      'papeis', 'papéis', 'livros', 'mesas', 'portas', 'janelas', 'carros', 'avioes', 'aviões', 'trens', 'barcas',
      // Verbos
      'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer', 'partir', 'chegar', 'voltar',
      'entrar', 'sair', 'subir', 'descer', 'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar',
      'dormir', 'comer', 'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir', 'tocar', 'pegar',
      'amou', 'viveu', 'morreu', 'soube', 'pôde', 'disse', 'partiu', 'chegou', 'voltou', 'entrou'
    ];
    
    const variations = generateWordVariations(originalWord);
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
    'pessoa', 'homem', 'mulher', 'filho', 'filha', 'pai', 'mãe', 'amigo', 'livro',
    // Verbos
    'amar', 'viver', 'saber', 'fazer', 'dizer', 'partir', 'chegar', 'voltar',
    'entrar', 'sair', 'correr', 'andar', 'voar', 'nadar', 'dormir', 'comer'
  ];
  return commonWords[Math.floor(Math.random() * commonWords.length)];
};
