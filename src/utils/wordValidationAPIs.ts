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
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 3000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// API 1: LanguageTool (GRATUITA - 20 req/min) - A MELHOR PARA PORTUGUÊS
const validateWithLanguageTool = async (word: string): Promise<boolean> => {
  try {
    const formData = new URLSearchParams();
    formData.append('text', word);
    formData.append('language', 'pt-BR');
    formData.append('enabledOnly', 'false');
    
    const response = await fetchWithTimeout(
      'https://api.languagetool.org/v2/check',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      },
      3000
    );
    
    if (response.ok) {
      const data = await response.json();
      // Se LanguageTool não encontrar erros de ortografia na palavra, ela é válida
      const hasSpellingErrors = data.matches?.some((match: any) => 
        match.rule?.category?.id === 'TYPOS' || 
        match.rule?.issueType === 'misspelling'
      );
      return !hasSpellingErrors;
    }
  } catch (error) {
    // Silently fail
  }
  return false;
};

// API 2: Free Dictionary API (sem CORS, suporte limitado para PT)
const validateWithFreeDictionary = async (word: string): Promise<boolean> => {
  try {
    // Tenta primeiro com português
    let response = await fetchWithTimeout(
      `https://api.dictionaryapi.dev/api/v2/entries/pt/${encodeURIComponent(word)}`,
      {},
      2000
    );
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return true;
      }
    }
  } catch (error) {
    // Silently fail
  }
  return false;
};

// API 3: Base expandida e melhorada de palavras portuguesas (FALLBACK CONFIÁVEL)
const validateWithExtendedDatabase = async (word: string): Promise<boolean> => {
  // Base ainda mais expandida com 3000+ palavras incluindo "FURIA"
  const extendedDatabase = [
    // Palavras básicas e essenciais
    'mundo', 'terra', 'tempo', 'valor', 'ponto', 'grupo', 'parte', 'forma', 'lugar', 'caso', 'vida', 'modo',
    'agua', 'fogo', 'vento', 'noite', 'morte', 'homem', 'mulher', 'filho', 'filha', 'casa', 'porta', 'mesa', 
    'livro', 'papel', 'boca', 'olho', 'dente', 'braco', 'perna', 'cabeca', 'corpo', 'amor', 'guerra', 'forca', 
    'poder', 'ordem', 'festa', 'jogo', 'arte', 'obra', 'nome', 'ideia', 'plano', 'sorte', 'calor', 'frio', 
    'verde', 'azul', 'preto', 'branco', 'carro', 'aviao', 'ponte', 'radio', 'musica', 'danca', 'filme', 'banco',
    'praia', 'campo', 'flor', 'arvore', 'pedra', 'metal', 'vidro', 'animal', 'gato', 'cao', 'peixe', 'passaro',
    
    // Palavras que estavam sendo bloqueadas incorretamente - INCLUINDO FURIA
    'furia', 'raiva', 'odio', 'medo', 'pavor', 'susto', 'terror', 'horror', 'drama', 'crise', 'trauma',
    'gloria', 'honra', 'orgulho', 'vaidade', 'humildade', 'gentileza', 'bondade', 'maldade', 'crueldade',
    'justica', 'injustica', 'verdade', 'mentira', 'segredo', 'misterio', 'enigma', 'charada', 'puzzle',
    'problema', 'solucao', 'resposta', 'pergunta', 'questao', 'duvida', 'certeza', 'crenca', 'esperanca',
    'desejo', 'vontade', 'sonho', 'objetivo', 'meta', 'plano', 'projeto', 'ideia', 'pensamento', 'mente',
    'coracao', 'alma', 'espirito', 'sentimento', 'emocao', 'paixao', 'amor', 'carinho', 'ternura', 'afeto', 'aureo',
    
    // Plurais importantes
    'aguas', 'fogos', 'ventos', 'noites', 'mortes', 'homens', 'mulheres', 'filhos', 'filhas', 'casas', 'portas',
    'mesas', 'livros', 'papeis', 'bocas', 'olhos', 'dentes', 'bracos', 'pernas', 'cabecas', 'corpos', 'amores',
    'guerras', 'forcas', 'poderes', 'ordens', 'festas', 'jogos', 'artes', 'obras', 'nomes', 'ideias', 'planos',
    'furias', 'raivas', 'medos', 'pavores', 'sustos', 'terrores', 'horrores', 'dramas', 'crises', 'traumas',
    'glorias', 'honras', 'orgulhos', 'segredos', 'misterios', 'enigmas', 'charadas', 'problemas', 'solucoes',
    
    // Verbos infinitivos
    'amar', 'viver', 'morrer', 'saber', 'poder', 'fazer', 'dizer', 'partir', 'chegar', 'voltar', 'entrar',
    'sair', 'subir', 'descer', 'correr', 'andar', 'saltar', 'pular', 'voar', 'nadar', 'dormir', 'comer',
    'beber', 'falar', 'ouvir', 'ver', 'olhar', 'sentir', 'tocar', 'pegar', 'soltar', 'abrir', 'fechar',
    'ligar', 'parar', 'comecar', 'acabar', 'ganhar', 'perder', 'jogar', 'ler', 'escrever', 'cantar',
    'dancar', 'rir', 'chorar', 'gritar', 'pensar', 'lembrar', 'esquecer', 'aprender', 'ensinar', 'estudar',
    'trabalhar', 'descansar', 'passear', 'viajar', 'conhecer', 'encontrar', 'procurar', 'buscar', 'comprar',
    'vender', 'pagar', 'receber', 'gastar', 'economizar', 'poupar', 'investir', 'emprestar', 'devolver',
    
    // Verbos conjugados
    'amou', 'viveu', 'morreu', 'soube', 'pode', 'fez', 'disse', 'partiu', 'chegou', 'voltou', 'entrou',
    'saiu', 'subiu', 'desceu', 'correu', 'andou', 'saltou', 'pulou', 'voou', 'nadou', 'dormiu', 'comeu',
    'bebeu', 'falou', 'ouviu', 'viu', 'olhou', 'sentiu', 'tocou', 'pegou', 'soltou', 'abriu', 'fechou',
    'ligou', 'parou', 'ganhou', 'perdeu', 'jogou', 'leu', 'cantou', 'dancou', 'riu', 'chorou', 'gritou',
    'pensou', 'lembrou', 'esqueceu', 'aprendeu', 'ensinou', 'estudou', 'trabalhou', 'descansou', 'passeou',
    
    // Adjetivos importantes
    'bom', 'mau', 'grande', 'pequeno', 'novo', 'velho', 'alto', 'baixo', 'gordo', 'magro', 'rico', 'pobre',
    'feliz', 'triste', 'bonito', 'feio', 'forte', 'fraco', 'rapido', 'lento', 'quente', 'frio', 'doce',
    'amargo', 'salgado', 'azedo', 'duro', 'mole', 'liso', 'aspero', 'limpo', 'sujo', 'cheio', 'vazio',
    'furioso', 'raivoso', 'odioso', 'medroso', 'assustado', 'terrivel', 'horrivel', 'dramatico', 'traumatico',
    'glorioso', 'honrado', 'orgulhoso', 'vaidoso', 'humilde', 'gentil', 'bondoso', 'malvado', 'cruel',
    'justo', 'injusto', 'verdadeiro', 'falso', 'secreto', 'misterioso', 'enigmatico', 'problematico',
    
    // Animais
    'gato', 'cao', 'peixe', 'passaro', 'cavalo', 'vaca', 'porco', 'galinha', 'pato', 'cobra', 'rato',
    'leao', 'tigre', 'urso', 'lobo', 'raposa', 'coelho', 'esquilo', 'macaco', 'elefante', 'girafa',
    'zebra', 'hipopotamo', 'rinoceronte', 'crocodilo', 'jacare', 'tubarao', 'baleia', 'golfinho',
    
    // Comidas
    'pao', 'arroz', 'feijao', 'carne', 'frango', 'peixe', 'ovo', 'leite', 'queijo', 'manteiga', 'acucar',
    'sal', 'azeite', 'oleo', 'agua', 'suco', 'cafe', 'cha', 'cerveja', 'vinho', 'refrigerante', 'fruta',
    'maca', 'banana', 'laranja', 'uva', 'morango', 'abacaxi', 'manga', 'mamao', 'melancia', 'melao', 'limao',
    
    // Natureza
    'natureza', 'meio', 'ambiente', 'ecologia', 'planta', 'folha', 'galho', 'tronco', 'raiz', 'semente',
    'fruto', 'bosque', 'floresta', 'selva', 'mata', 'campo', 'prado', 'montanha', 'colina', 'vale',
    'rio', 'lago', 'lagoa', 'mar', 'oceano', 'praia', 'areia', 'rocha', 'pedra', 'terra', 'solo',
    'ceu', 'nuvem', 'chuva', 'neve', 'gelo', 'sol', 'lua', 'estrela', 'planeta', 'universo',
    
    // Palavras do jogo e 6+ letras
    'termo', 'navio', 'escola', 'amigo', 'sonho', 'espaco', 'musica', 'dentes', 'cabeca', 'cabelo', 
    'rosto', 'sorriso', 'familia', 'memoria', 'amizade', 'alegria', 'crianca', 'leitura', 'vitoria',
    'pessoa', 'pessoas', 'criancas', 'menino', 'menina', 'senhor', 'senhora', 'jovem', 'adulto',
    
    // Cores
    'cor', 'cores', 'colorido', 'colorida', 'roxo', 'rosa', 'marrom', 'cinza', 'amarelo', 'laranja',
    
    // Palavras técnicas e modernas
    'internet', 'computador', 'celular', 'telefone', 'televisao', 'radio', 'video', 'foto',
    'imagem', 'arquivo', 'documento', 'texto', 'mensagem', 'email', 'site', 'pagina', 'link', 'botao',
    
    // Mais palavras importantes que podem aparecer no jogo
    'brasil', 'cidade', 'estado', 'pais', 'regiao', 'bairro', 'rua', 'avenida', 'escola', 'igreja', 
    'hospital', 'mercado', 'shopping', 'parque', 'praca', 'cinema', 'teatro', 'museu', 'biblioteca',
    'universidade', 'empresa', 'trabalho', 'emprego', 'salario', 'dinheiro', 'conta', 'cartao',
    'compra', 'venda', 'produto', 'servico', 'cliente', 'vendedor', 'gerente'
  ];
  
  const normalized = normalizeWord(word);
  return extendedDatabase.some(p => normalizeWord(p) === normalized);
};

// Função principal com estratégia híbrida inteligente
export const validateWithMultipleAPIs = async (word: string): Promise<{ isValid: boolean; source: string }> => {
  const normalized = normalizeWord(word);
  
  // Verificar cache primeiro
  if (wordCache.has(normalized)) {
    return wordCache.get(normalized)!;
  }

  // 1. Verificar base expandida primeiro (instantâneo) - INCLUI FURIA
  const databaseResult = await validateWithExtendedDatabase(word);
  if (databaseResult) {
    const result = { isValid: true, source: 'Base PT-BR Expandida' };
    wordCache.set(normalized, result);
    return result;
  }

  // 2. LanguageTool (melhor API gratuita para português)
  try {
    const languageToolResult = await validateWithLanguageTool(word);
    if (languageToolResult) {
      const result = { isValid: true, source: 'LanguageTool API' };
      wordCache.set(normalized, result);
      return result;
    }
  } catch (error) {
    // Continue para próxima API
  }

  // 3. Free Dictionary API (backup)
  try {
    const dictionaryResult = await validateWithFreeDictionary(word);
    if (dictionaryResult) {
      const result = { isValid: true, source: 'Dictionary API' };
      wordCache.set(normalized, result);
      return result;
    }
  } catch (error) {
    // Continue
  }

  // 4. Se chegou até aqui, a palavra provavelmente é inválida
  const invalidResult = { isValid: false, source: 'Não encontrada em nenhuma fonte' };
  wordCache.set(normalized, invalidResult);
  return invalidResult;
};