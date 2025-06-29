
export interface WordDefinition {
  word: string;
  clue: string;
  category: string;
}

export const CROSSWORD_WORDS: WordDefinition[] = [
  // Natureza
  { word: 'FLORESTA', clue: 'Área com muitas árvores', category: 'natureza' },
  { word: 'TERRA', clue: 'Solo ou planeta', category: 'natureza' },
  { word: 'LAGO', clue: 'Corpo de água cercado por terra', category: 'natureza' },
  { word: 'VALE', clue: 'Região entre montanhas', category: 'natureza' },
  { word: 'GELO', clue: 'Água congelada', category: 'natureza' },
  { word: 'VENTO', clue: 'Movimento do ar', category: 'natureza' },
  { word: 'NEVOA', clue: 'Nuvem baixa sobre o solo', category: 'natureza' },
  { word: 'FLORES', clue: 'Parte colorida de algumas plantas', category: 'natureza' },
  { word: 'RAIZ', clue: 'Parte subterrânea de uma planta', category: 'natureza' },
  { word: 'ORVALHO', clue: 'Gotas d\'água que se formam de manhã', category: 'natureza' },
  { word: 'RIO', clue: 'Curso natural de água', category: 'natureza' },

  // Ações
  { word: 'CORRER', clue: 'Mover-se rapidamente com os pés', category: 'acoes' },
  { word: 'VOAR', clue: 'Deslocar-se pelo ar', category: 'acoes' },
  { word: 'LER', clue: 'Interpretar palavras escritas', category: 'acoes' },
  { word: 'COMER', clue: 'Ingerir alimento', category: 'acoes' },
  { word: 'DORMIR', clue: 'Estado de repouso do corpo', category: 'acoes' },
  { word: 'BEIJAR', clue: 'Tocar com os lábios em sinal de carinho', category: 'acoes' },
  { word: 'NADAR', clue: 'Deslocar-se na água', category: 'acoes' },
  { word: 'CANTAR', clue: 'Emitir som com melodia', category: 'acoes' },
  { word: 'RIR', clue: 'Demonstrar alegria com som', category: 'acoes' },
  { word: 'ANDAR', clue: 'Mover-se caminhando', category: 'acoes' },

  // Animais
  { word: 'GATO', clue: 'Animal doméstico que mia', category: 'animais' },
  { word: 'CAO', clue: 'Melhor amigo do homem', category: 'animais' },
  { word: 'PEIXE', clue: 'Animal aquático com guelras', category: 'animais' },
  { word: 'CAVALO', clue: 'Animal usado para montaria', category: 'animais' },
  { word: 'ABELHA', clue: 'Inseto que produz mel', category: 'animais' },
  { word: 'CORUJA', clue: 'Ave noturna com olhos grandes', category: 'animais' },
  { word: 'LEAO', clue: 'Animal considerado o rei da selva', category: 'animais' },
  { word: 'TARTARUGA', clue: 'Animal com casco duro', category: 'animais' },
  { word: 'CISNE', clue: 'Ave aquática branca e elegante', category: 'animais' },
  { word: 'PANDA', clue: 'Urso que come bambu', category: 'animais' },

  // Objetos
  { word: 'SOFA', clue: 'Móvel para sentar', category: 'objetos' },
  { word: 'LIVRO', clue: 'Conjunto de páginas escritas', category: 'objetos' },
  { word: 'LAMPADA', clue: 'Objeto que emite luz', category: 'objetos' },
  { word: 'ESPELHO', clue: 'Reflete a imagem', category: 'objetos' },
  { word: 'PORTA', clue: 'Entrada ou saída de um lugar', category: 'objetos' },
  { word: 'COBERTOR', clue: 'Usado para se aquecer', category: 'objetos' },
  { word: 'CADEIRA', clue: 'Objeto para sentar', category: 'objetos' },
  { word: 'FOGAO', clue: 'Usado para cozinhar', category: 'objetos' },
  { word: 'GELADEIRA', clue: 'Conserva alimentos frios', category: 'objetos' },
  { word: 'TELHADO', clue: 'Cobre a casa', category: 'objetos' },

  // Cores
  { word: 'VERDE', clue: 'Cor da natureza', category: 'cores' },
  { word: 'AZUL', clue: 'Cor do céu', category: 'cores' },
  { word: 'AMARELO', clue: 'Cor do sol', category: 'cores' },
  { word: 'ROXO', clue: 'Mistura de azul com vermelho', category: 'cores' },
  { word: 'LARANJA', clue: 'Cor e também fruta', category: 'cores' },
  { word: 'PRETO', clue: 'Ausência de luz', category: 'cores' },
  { word: 'BRANCO', clue: 'Todas as cores juntas na luz', category: 'cores' },
  { word: 'CINZA', clue: 'Cor intermediária entre branco e preto', category: 'cores' },
  { word: 'BEGE', clue: 'Cor clara, parecida com areia', category: 'cores' },
  { word: 'DOURADO', clue: 'Cor de ouro', category: 'cores' },

  // Sentimentos
  { word: 'ALEGRIA', clue: 'Sentimento de felicidade', category: 'sentimentos' },
  { word: 'RAIVA', clue: 'Emoção forte e irritada', category: 'sentimentos' },
  { word: 'AMOR', clue: 'Forte afeto por alguém', category: 'sentimentos' },
  { word: 'MEDO', clue: 'Sensação de perigo', category: 'sentimentos' },
  { word: 'TRISTEZA', clue: 'Estado de desânimo', category: 'sentimentos' },
  { word: 'CANSADO', clue: 'Quando falta energia', category: 'sentimentos' },
  { word: 'ANSIEDADE', clue: 'Preocupação excessiva', category: 'sentimentos' },
  { word: 'PAZ', clue: 'Ausência de conflito', category: 'sentimentos' },
  { word: 'FELIZ', clue: 'Quem está alegre', category: 'sentimentos' },
  { word: 'CALMA', clue: 'Estado de tranquilidade', category: 'sentimentos' },

  // Clima e Estações
  { word: 'VERAO', clue: 'Estação quente do ano', category: 'clima' },
  { word: 'OUTONO', clue: 'Estação em que folhas caem', category: 'clima' },
  { word: 'INVERNO', clue: 'Estação fria do ano', category: 'clima' },
  { word: 'PRIMAVERA', clue: 'Estação das flores', category: 'clima' },
  { word: 'CALOR', clue: 'Alta temperatura', category: 'clima' },
  { word: 'FRIO', clue: 'Baixa temperatura', category: 'clima' },
  { word: 'NEVE', clue: 'Água congelada que cai do céu', category: 'clima' },
  { word: 'CHUVA', clue: 'Gotas de água que caem do céu', category: 'clima' },
  { word: 'NUBLADO', clue: 'Quando o céu está coberto', category: 'clima' },
  { word: 'SECO', clue: 'Sem umidade', category: 'clima' },

  // Geografia
  { word: 'PAIS', clue: 'Unidade territorial soberana', category: 'geografia' },
  { word: 'CIDADE', clue: 'Centro urbano', category: 'geografia' },
  { word: 'ILHA', clue: 'Terra cercada de água', category: 'geografia' },
  { word: 'DESERTO', clue: 'Região árida', category: 'geografia' },
  { word: 'MONTANHA', clue: 'Elevação natural do solo', category: 'geografia' },
  { word: 'PLANALTO', clue: 'Terreno plano em altitude', category: 'geografia' },
  { word: 'LITORAL', clue: 'Região próxima ao mar', category: 'geografia' },
  { word: 'CONTINENTE', clue: 'Grande massa de terra', category: 'geografia' },
  { word: 'VULCAO', clue: 'Montanha que libera lava', category: 'geografia' },

  // Palavras originais mantidas
  { word: 'BRASIL', clue: 'País onde ficam as Cataratas do Iguaçu', category: 'geografia' },
  { word: 'CASA', clue: 'Local onde moramos', category: 'objetos' },
  { word: 'SOL', clue: 'Estrela do nosso sistema solar', category: 'natureza' },
  { word: 'FLOR', clue: 'Parte colorida da planta', category: 'natureza' },
  { word: 'CARRO', clue: 'Veículo de quatro rodas', category: 'objetos' },
  { word: 'MUSICA', clue: 'Arte dos sons organizados', category: 'arte' },
  { word: 'PAPEL', clue: 'Material feito de celulose', category: 'objetos' },
  { word: 'ESCOLA', clue: 'Local de ensino', category: 'lugares' },
  { word: 'TEMPO', clue: 'Duração dos acontecimentos', category: 'conceitos' },
  { word: 'AGUA', clue: 'Líquido essencial para a vida', category: 'natureza' },
  { word: 'AMIGO', clue: 'Pessoa querida e próxima', category: 'relacionamentos' },
  { word: 'PONTE', clue: 'Estrutura que atravessa obstáculos', category: 'construcoes' },
  { word: 'JANELA', clue: 'Abertura na parede para luz', category: 'objetos' },
  { word: 'MESA', clue: 'Móvel com tampo horizontal', category: 'objetos' },
  { word: 'NOITE', clue: 'Período de escuridão', category: 'tempo' }
];

// Função para obter palavras aleatórias
export const getRandomWords = (count: number = 15): WordDefinition[] => {
  const shuffled = [...CROSSWORD_WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Função para obter palavras que se encaixam bem (diferentes tamanhos)
export const getBalancedWords = (): WordDefinition[] => {
  const words = [...CROSSWORD_WORDS];
  
  // Separar por tamanho
  const short = words.filter(w => w.word.length <= 4);
  const medium = words.filter(w => w.word.length >= 5 && w.word.length <= 7);
  const long = words.filter(w => w.word.length >= 8);
  
  // Selecionar um mix balanceado
  const selected = [
    ...short.sort(() => 0.5 - Math.random()).slice(0, 4),
    ...medium.sort(() => 0.5 - Math.random()).slice(0, 8),
    ...long.sort(() => 0.5 - Math.random()).slice(0, 3)
  ];
  
  return selected.sort(() => 0.5 - Math.random());
};
