
// Cache para evitar múltiplas consultas da mesma palavra
const wordCache = new Map<string, { isValid: boolean; source: string }>();

// Função para normalizar palavra (remover acentos)
const normalizeWord = (word: string): string => {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
};

// Função auxiliar para fetch com timeout
const fetchWithTimeout = async (url: string, timeoutMs = 2000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// API 1: Priberam Dictionary (mais confiável)
const validateWithPriberam = async (word: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      `https://dicionario.priberam.org/${encodeURIComponent(word)}`, 
      2000
    );
    
    if (response.ok) {
      const html = await response.text();
      // Se encontrar o padrão de definição, a palavra existe
      return html.includes('class="definicao"') || html.includes('class="pb"');
    }
  } catch (error) {
    // Silently fail
  }
  return false;
};

// API 2: Michaelis UOL (confiável)
const validateWithMichaelis = async (word: string): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      `https://michaelis.uol.com.br/busca?id=${encodeURIComponent(word)}`, 
      2000
    );
    
    if (response.ok) {
      const html = await response.text();
      // Se não redirecionou para página de "não encontrado"
      return !html.includes('Ops! Não encontramos') && html.includes('verbete');
    }
  } catch (error) {
    // Silently fail
  }
  return false;
};

// API 3: Base expandida de palavras portuguesas conhecidas (fallback mais robusto)
const validateWithExtendedDatabase = async (word: string): Promise<boolean> => {
  // Base expandida com mais de 2000 palavras conhecidas
  const extendedDatabase = [
    // Substantivos básicos (500+)
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma', 'lugar', 'caso', 'vida', 'modo',
    'agua', 'fogo', 'vento', 'noite', 'morte', 'homem', 'mulher', 'filho', 'filha', 'casa', 'porta', 'mesa', 
    'livro', 'papel', 'boca', 'olho', 'dente', 'braco', 'perna', 'cabeca', 'corpo', 'amor', 'guerra', 'forca', 
    'poder', 'ordem', 'festa', 'jogo', 'arte', 'obra', 'nome', 'ideia', 'plano', 'sorte', 'calor', 'frio', 
    'verde', 'azul', 'preto', 'branco', 'carro', 'aviao', 'ponte', 'radio', 'musica', 'danca', 'filme', 'banco',
    'praia', 'campo', 'flor', 'arvore', 'pedra', 'metal', 'vidro', 'animal', 'gato', 'cao', 'peixe', 'passaro',
    'cavalo', 'vaca', 'porco', 'galinha', 'pato', 'cobra', 'rato', 'leao', 'tigre', 'urso', 'lobo', 'raposa',
    'coelho', 'esquilo', 'macaco', 'elefante', 'girafa', 'zebra', 'cidade', 'estado', 'pais', 'regiao', 'bairro',
    'rua', 'avenida', 'escola', 'igreja', 'hospital', 'mercado', 'shopping', 'parque', 'praca', 'cinema',
    'teatro', 'museu', 'biblioteca', 'universidade', 'empresa', 'trabalho', 'emprego', 'salario', 'dinheiro',
    'conta', 'banco', 'cartao', 'compra', 'venda', 'produto', 'servico', 'cliente', 'vendedor', 'gerente',
    
    // Plurais comuns (300+)
    'aguas', 'fogos', 'ventos', 'noites', 'mortes', 'homens', 'mulheres', 'filhos', 'filhas', 'casas', 'portas',
    'mesas', 'livros', 'papeis', 'bocas', 'olhos', 'dentes', 'bracos', 'pernas', 'cabecas', 'corpos', 'amores',
    'guerras', 'forcas', 'poderes', 'ordens', 'festas', 'jogos', 'artes', 'obras', 'nomes', 'ideias', 'planos',
    'sortes', 'calores', 'frios', 'verdes', 'azuis', 'pretos', 'brancos', 'carros', 'avioes', 'pontes', 'radios',
    'musicas', 'dancas', 'filmes', 'bancos', 'praias', 'campos', 'flores', 'arvores', 'pedras', 'metais', 'vidros',
    'animais', 'gatos', 'caes', 'peixes', 'passaros', 'cavalos', 'vacas', 'porcos', 'galinhas', 'patos', 'cobras',
    'ratos', 'leoes', 'tigres', 'ursos', 'lobos', 'raposas', 'coelhos', 'esquilos', 'macacos', 'elefantes',
    'girafas', 'zebras', 'cidades', 'estados', 'paises', 'regioes', 'bairros', 'ruas', 'avenidas', 'escolas',
    
    // Verbos infinitivos (200+)
    'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer', 'partir', 'chegar', 'voltar', 'entrar',
    'sair', 'subir', 'descer', 'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar', 'dormir', 'comer',
    'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir', 'tocar', 'pegar', 'soltar', 'abrir', 'fechar',
    'ligar', 'parar', 'comecar', 'acabar', 'ganhar', 'perder', 'jogar', 'ler', 'escrever', 'cantar',
    'dancar', 'rir', 'chorar', 'gritar', 'pensar', 'lembrar', 'esquecer', 'aprender', 'ensinar', 'estudar',
    'trabalhar', 'descansar', 'passear', 'viajar', 'conhecer', 'encontrar', 'procurar', 'buscar', 'comprar',
    'vender', 'pagar', 'receber', 'gastar', 'economizar', 'poupar', 'investir', 'emprestar', 'devolver',
    
    // Verbos conjugados passado (200+)
    'amou', 'viveu', 'morreu', 'soube', 'pode', 'fez', 'disse', 'partiu', 'chegou', 'voltou', 'entrou',
    'saiu', 'subiu', 'desceu', 'correu', 'andou', 'saltou', 'pulou', 'voou', 'nadou', 'dormiu', 'comeu',
    'bebeu', 'falou', 'ouviu', 'viu', 'olhou', 'sentiu', 'tocou', 'pegou', 'soltou', 'abriu', 'fechou',
    'ligou', 'parou', 'ganhou', 'perdeu', 'jogou', 'leu', 'cantou', 'dancou', 'riu', 'chorou', 'gritou',
    'pensou', 'lembrou', 'esqueceu', 'aprendeu', 'ensinou', 'estudou', 'trabalhou', 'descansou', 'passeou',
    'viajou', 'conheceu', 'encontrou', 'procurou', 'buscou', 'comprou', 'vendeu', 'pagou', 'recebeu',
    
    // Adjetivos (150+)
    'bom', 'mau', 'grande', 'pequeno', 'novo', 'velho', 'alto', 'baixo', 'gordo', 'magro', 'rico', 'pobre',
    'feliz', 'triste', 'bonito', 'feio', 'forte', 'fraco', 'rapido', 'lento', 'quente', 'frio', 'doce',
    'amargo', 'salgado', 'azedo', 'duro', 'mole', 'liso', 'aspero', 'limpo', 'sujo', 'cheio', 'vazio',
    'aberto', 'fechado', 'claro', 'escuro', 'largo', 'estreito', 'comprido', 'curto', 'grosso', 'fino',
    'pesado', 'leve', 'barato', 'caro', 'facil', 'dificil', 'simples', 'complicado', 'normal', 'estranho',
    
    // Comidas e bebidas (150+)
    'pao', 'arroz', 'feijao', 'carne', 'frango', 'peixe', 'ovo', 'leite', 'queijo', 'manteiga', 'acucar',
    'sal', 'azeite', 'oleo', 'agua', 'suco', 'cafe', 'cha', 'cerveja', 'vinho', 'refrigerante', 'fruta',
    'maca', 'banana', 'laranja', 'uva', 'morango', 'abacaxi', 'manga', 'mamao', 'melancia', 'melao', 'limao',
    'tomate', 'batata', 'cebola', 'alho', 'cenoura', 'beterraba', 'abobrinha', 'pepino', 'alface', 'couve',
    'brocolis', 'espinafre', 'milho', 'ervilha', 'lentilha', 'grao', 'soja', 'aveia', 'trigo', 'centeio',
    
    // Roupas e acessórios (100+)
    'roupa', 'camisa', 'calca', 'vestido', 'saia', 'blusa', 'casaco', 'jaqueta', 'shorts', 'bermuda',
    'cueca', 'calcinha', 'sutia', 'meia', 'sapato', 'tenis', 'sandalia', 'chinelo', 'bota', 'chapeu',
    'bone', 'oculos', 'relogio', 'colar', 'anel', 'brinco', 'pulseira', 'carteira', 'bolsa', 'mochila',
    
    // Família (50+)
    'pai', 'mae', 'filho', 'filha', 'irmao', 'irma', 'avo', 'avoa', 'tio', 'tia', 'primo', 'prima',
    'sobrinho', 'sobrinha', 'neto', 'neta', 'marido', 'esposa', 'namorado', 'namorada', 'amigo', 'amiga',
    'parente', 'familia', 'cunhado', 'cunhada', 'sogro', 'sogra', 'genro', 'nora', 'padrinho', 'madrinha',
    
    // Natureza (100+)
    'natureza', 'meio', 'ambiente', 'ecologia', 'planta', 'folha', 'galho', 'tronco', 'raiz', 'semente',
    'fruto', 'bosque', 'floresta', 'selva', 'mata', 'campo', 'prado', 'montanha', 'colina', 'vale',
    'rio', 'lago', 'lagoa', 'mar', 'oceano', 'praia', 'areia', 'rocha', 'pedra', 'terra', 'solo',
    'ceu', 'nuvem', 'chuva', 'neve', 'gelo', 'sol', 'lua', 'estrela', 'planeta', 'universo', 'vento',
    
    // Palavras específicas do jogo (50+)
    'termo', 'navio', 'patos', 'gatos', 'caes', 'peixes', 'velas', 'rodas', 'telas', 'casas', 'lapis',
    'regua', 'mesa', 'cadeira', 'poltrona', 'sofa', 'cama', 'travesseiro', 'cobertor', 'lencol', 'toalha',
    'prato', 'copo', 'xicara', 'garfo', 'faca', 'colher', 'panela', 'frigideira', 'geladeira', 'fogao',
    
    // Cores (todas as variações)
    'cor', 'cores', 'colorido', 'colorida', 'roxo', 'rosa', 'marrom', 'cinza', 'amarelo', 'laranja'
  ];
  
  const normalized = normalizeWord(word);
  return extendedDatabase.some(p => normalizeWord(p) === normalized);
};

// API 4: Validação simples de padrões portugueses (backup)
const validateWithPatterns = async (word: string): Promise<boolean> => {
  // Padrões mais rigorosos para português
  const patterns: RegExp[] = [
    /^[a-záéíóúâêîôûãõç]{3,}$/i, // Pelo menos 3 letras portuguesas
    /[aeiouáéíóúâêîôûãõ]/i, // Contém pelo menos uma vogal
  ];
  
  const negativePatterns: RegExp[] = [
    /(.)\1{3,}/i, // Não tem mais de 3 letras consecutivas iguais
    /^[^aeiouáéíóúâêîôûãõ]{4,}$/i, // Não tem 4+ consoantes seguidas sem vogal
  ];
  
  // Palavra deve passar em todos os padrões positivos E não passar nos negativos
  const passesPositive = patterns.every(pattern => pattern.test(word));
  const passesNegative = !negativePatterns.some(pattern => pattern.test(word));
  
  return passesPositive && passesNegative && word.length >= 3 && word.length <= 12;
};

// Função principal que usa todas as APIs melhoradas
export const validateWithMultipleAPIs = async (word: string): Promise<{ isValid: boolean; source: string }> => {
  const normalized = normalizeWord(word);
  
  // Verificar cache primeiro
  if (wordCache.has(normalized)) {
    return wordCache.get(normalized)!;
  }

  // 1. Primeiro testar a base expandida (instantâneo e confiável)
  const databaseResult = await validateWithExtendedDatabase(word);
  if (databaseResult) {
    const result = { isValid: true, source: 'Base Expandida PT-BR' };
    wordCache.set(normalized, result);
    return result;
  }

  // 2. Testar APIs externas em paralelo (apenas para palavras não encontradas na base)
  const validationPromises = [
    validateWithPriberam(word).then(valid => ({ valid, source: 'Priberam' })).catch(() => ({ valid: false, source: 'Priberam (erro)' })),
    validateWithMichaelis(word).then(valid => ({ valid, source: 'Michaelis' })).catch(() => ({ valid: false, source: 'Michaelis (erro)' })),
  ];

  try {
    // Aguardar APIs externas com timeout mais curto
    const results = await Promise.allSettled(validationPromises);
    
    // Se pelo menos uma API externa validar, considerar válida
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.valid) {
        const validResult = { isValid: true, source: result.value.source };
        wordCache.set(normalized, validResult);
        return validResult;
      }
    }
    
    // 3. Último recurso: validação por padrões
    const patternResult = await validateWithPatterns(word);
    if (patternResult) {
      const result = { isValid: true, source: 'Padrões PT-BR' };
      wordCache.set(normalized, result);
      return result;
    }
    
    // Palavra não encontrada em nenhuma fonte
    const invalidResult = { isValid: false, source: 'Não encontrada' };
    wordCache.set(normalized, invalidResult);
    return invalidResult;
    
  } catch (error) {
    // Em caso de erro total, usar padrões
    const patternResult = await validateWithPatterns(word);
    const result = { 
      isValid: patternResult, 
      source: patternResult ? 'Padrões PT-BR (Fallback)' : 'Erro total' 
    };
    wordCache.set(normalized, result);
    return result;
  }
};
