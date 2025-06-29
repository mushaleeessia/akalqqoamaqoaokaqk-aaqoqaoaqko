
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
  { word: 'SOL', clue: 'Estrela do nosso sistema solar', category: 'natureza' },
  { word: 'FLOR', clue: 'Parte colorida da planta', category: 'natureza' },
  { word: 'AGUA', clue: 'Líquido essencial para a vida', category: 'natureza' },

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
  { word: 'PEIXE', clue: 'Alimento comum em pratos litorâneos', category: 'animais' },
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
  { word: 'CASA', clue: 'Local onde moramos', category: 'objetos' },
  { word: 'CARRO', clue: 'Veículo de quatro rodas', category: 'objetos' },
  { word: 'PAPEL', clue: 'Material feito de celulose', category: 'objetos' },
  { word: 'JANELA', clue: 'Abertura na parede para luz', category: 'objetos' },
  { word: 'MESA', clue: 'Móvel com tampo horizontal', category: 'objetos' },

  // Cores
  { word: 'VERDE', clue: 'Cor da natureza', category: 'cores' },
  { word: 'AZUL', clue: 'Cor do céu', category: 'cores' },
  { word: 'AMARELO', clue: 'Cor do sol', category: 'cores' },
  { word: 'ROXO', clue: 'Mistura de azul com vermelho', category: 'cores' },
  { word: 'LARANJA', clue: 'Fruta cítrica e redonda', category: 'cores' },
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
  { word: 'BRASIL', clue: 'País onde ficam as Cataratas do Iguaçu', category: 'geografia' },

  // Esportes
  { word: 'CORRIDA', clue: 'Prova de velocidade', category: 'esportes' },
  { word: 'FUTEBOL', clue: 'Esporte com bola e gol', category: 'esportes' },
  { word: 'CICLISMO', clue: 'Esporte com bicicleta', category: 'esportes' },
  { word: 'SKATE', clue: 'Esporte com prancha de rodinhas', category: 'esportes' },
  { word: 'VOLEI', clue: 'Esporte com rede e manchete', category: 'esportes' },
  { word: 'SURFE', clue: 'Esporte em cima de ondas', category: 'esportes' },
  { word: 'CARATE', clue: 'Luta com golpes de mão e pé', category: 'esportes' },
  { word: 'PATINACAO', clue: 'Feita com rodas ou lâminas nos pés', category: 'esportes' },
  { word: 'HIPISMO', clue: 'Esporte praticado com cavalos', category: 'esportes' },
  { word: 'TENIS', clue: 'Esporte com raquetes', category: 'esportes' },
  { word: 'GINASTICA', clue: 'Modalidade olímpica com solo e aparelhos', category: 'esportes' },
  { word: 'HANDEBOL', clue: 'Esporte coletivo com as mãos', category: 'esportes' },
  { word: 'BASQUETE', clue: 'Esporte com cestas', category: 'esportes' },
  { word: 'RUGBY', clue: 'Parecido com futebol americano', category: 'esportes' },
  { word: 'GOLFE', clue: 'Esporte de taco e buracos', category: 'esportes' },
  { word: 'BOXE', clue: 'Luta com luvas', category: 'esportes' },
  { word: 'JUDO', clue: 'Arte marcial de origem japonesa', category: 'esportes' },
  { word: 'NATACAO', clue: 'Esporte praticado na água', category: 'esportes' },
  { word: 'ESGRIMA', clue: 'Luta com espadas', category: 'esportes' },
  { word: 'ESCALADA', clue: 'Subida em paredes ou montanhas', category: 'esportes' },

  // Profissões
  { word: 'ATOR', clue: 'Interpreta personagens', category: 'profissoes' },
  { word: 'COZINHEIRO', clue: 'Prepara refeições', category: 'profissoes' },
  { word: 'JORNALISTA', clue: 'Informa a população', category: 'profissoes' },
  { word: 'PROGRAMADOR', clue: 'Cria códigos e softwares', category: 'profissoes' },
  { word: 'ENGENHEIRO', clue: 'Profissional que projeta construções e máquinas', category: 'profissoes' },
  { word: 'CANTOR', clue: 'Trabalha com música e voz', category: 'profissoes' },
  { word: 'PROFESSOR', clue: 'Ensina alunos', category: 'profissoes' },
  { word: 'ENFERMEIRO', clue: 'Auxilia médicos e pacientes', category: 'profissoes' },
  { word: 'ARQUITETO', clue: 'Desenha casas e prédios', category: 'profissoes' },
  { word: 'PINTOR', clue: 'Trabalha com tintas', category: 'profissoes' },
  { word: 'MOTORISTA', clue: 'Conduz veículos', category: 'profissoes' },
  { word: 'BOMBEIRO', clue: 'Apaga incêndios', category: 'profissoes' },
  { word: 'ADVOGADO', clue: 'Defende causas na justiça', category: 'profissoes' },
  { word: 'DESIGNER', clue: 'Cria imagens ou produtos visuais', category: 'profissoes' },
  { word: 'POLICIAL', clue: 'Zela pela segurança', category: 'profissoes' },
  { word: 'MEDICO', clue: 'Cuida da saúde das pessoas', category: 'profissoes' },
  { word: 'DENTISTA', clue: 'Cuida dos dentes', category: 'profissoes' },
  { word: 'GARCOM', clue: 'Atende em restaurantes', category: 'profissoes' },
  { word: 'PSICOLOGO', clue: 'Trabalha com saúde mental', category: 'profissoes' },
  { word: 'VETERINARIO', clue: 'Cuida da saúde dos animais', category: 'profissoes' },

  // Tecnologia
  { word: 'MOUSE', clue: 'Dispositivo de apontamento', category: 'tecnologia' },
  { word: 'NUVEM', clue: 'Armazenamento de dados online', category: 'tecnologia' },
  { word: 'SENHA', clue: 'Código de acesso', category: 'tecnologia' },
  { word: 'ROTEADOR', clue: 'Distribui sinal Wi-Fi', category: 'tecnologia' },
  { word: 'PLANILHA', clue: 'Documento com tabelas e células', category: 'tecnologia' },
  { word: 'COMPUTADOR', clue: 'Máquina de processamento digital', category: 'tecnologia' },
  { word: 'BLUETOOTH', clue: 'Conexão sem fio de curto alcance', category: 'tecnologia' },
  { word: 'APLICATIVO', clue: 'Programa instalado em celular', category: 'tecnologia' },
  { word: 'CARREGADOR', clue: 'Recarrega baterias', category: 'tecnologia' },
  { word: 'HARDWARE', clue: 'Parte física de um computador', category: 'tecnologia' },
  { word: 'FONE', clue: 'Usado para ouvir áudio', category: 'tecnologia' },
  { word: 'TECLADO', clue: 'Dispositivo para digitar', category: 'tecnologia' },
  { word: 'CAMERA', clue: 'Capta imagens e vídeos', category: 'tecnologia' },
  { word: 'TELA', clue: 'Parte visível de aparelhos eletrônicos', category: 'tecnologia' },
  { word: 'SOFTWARE', clue: 'Programa de computador', category: 'tecnologia' },
  { word: 'NAVEGADOR', clue: 'Acessa páginas da internet', category: 'tecnologia' },
  { word: 'INTERNET', clue: 'Rede mundial de computadores', category: 'tecnologia' },
  { word: 'CELULAR', clue: 'Dispositivo de comunicação móvel', category: 'tecnologia' },
  { word: 'IMPRESSORA', clue: 'Reproduz documentos no papel', category: 'tecnologia' },
  { word: 'WIFI', clue: 'Rede sem fio', category: 'tecnologia' },

  // Alimentos
  { word: 'CHA', clue: 'Infusão de folhas ou ervas', category: 'alimentos' },
  { word: 'OVO', clue: 'Usado em omeletes e bolos', category: 'alimentos' },
  { word: 'BOLACHA', clue: 'Doce crocante, às vezes recheado', category: 'alimentos' },
  { word: 'ARROZ', clue: 'Grão branco comum em refeições', category: 'alimentos' },
  { word: 'BANANA', clue: 'Fruta amarela, rica em potássio', category: 'alimentos' },
  { word: 'LEITE', clue: 'Líquido branco vindo da vaca', category: 'alimentos' },
  { word: 'CARNE', clue: 'Alimento derivado de animal', category: 'alimentos' },
  { word: 'MEL', clue: 'Substância doce produzida por abelhas', category: 'alimentos' },
  { word: 'CHOCOLATE', clue: 'Doce marrom feito de cacau', category: 'alimentos' },
  { word: 'MACA', clue: 'Fruta vermelha ou verde, crocante', category: 'alimentos' },
  { word: 'PAO', clue: 'Feito com farinha, comum no café da manhã', category: 'alimentos' },
  { word: 'CAFE', clue: 'Bebida escura e energética', category: 'alimentos' },
  { word: 'BOLO', clue: 'Doce de aniversário', category: 'alimentos' },
  { word: 'FEIJAO', clue: 'Grão rico em ferro, comum no Brasil', category: 'alimentos' },
  { word: 'QUEIJO', clue: 'Derivado do leite, pode ser fatiado', category: 'alimentos' },
  { word: 'MANGA', clue: 'Fruta tropical com polpa amarela', category: 'alimentos' },
  { word: 'SORVETE', clue: 'Doce gelado consumido no verão', category: 'alimentos' },

  // Conceitos e outros
  { word: 'MUSICA', clue: 'Arte dos sons organizados', category: 'arte' },
  { word: 'ESCOLA', clue: 'Local de ensino', category: 'lugares' },
  { word: 'TEMPO', clue: 'Duração dos acontecimentos', category: 'conceitos' },
  { word: 'AMIGO', clue: 'Pessoa querida e próxima', category: 'relacionamentos' },
  { word: 'PONTE', clue: 'Estrutura que atravessa obstáculos', category: 'construcoes' },
  { word: 'NOITE', clue: 'Período de escuridão', category: 'tempo' },
  { word: 'SORVETE', clue: 'Doce gelado consumido no verão', category: 'alimentos' },
  { word: 'CAMERA', clue: 'Capta imagens e vídeos', category: 'tecnologia' },
  { word: 'MANGA', clue: 'Fruta tropical com polpa amarela', category: 'alimentos' },
  { word: 'CAFE', clue: 'Bebida escura e energética', category: 'alimentos' },
  { word: 'BOLO', clue: 'Doce de aniversário', category: 'alimentos' },
  { word: 'CARREGADOR', clue: 'Recarrega baterias', category: 'tecnologia' },
  { word: 'PLANILHA', clue: 'Documento com tabelas e células', category: 'tecnologia' },
  { word: 'CICLISMO', clue: 'Esporte com bicicleta', category: 'esportes' },
  { word: 'ESCALADA', clue: 'Subida em paredes ou montanhas', category: 'esportes' },
  { word: 'TECLADO', clue: 'Dispositivo para digitar', category: 'tecnologia' },
  { word: 'HARDWARE', clue: 'Parte física de um computador', category: 'tecnologia' },
  { word: 'FONE', clue: 'Usado para ouvir áudio', category: 'tecnologia' },
  { word: 'TELA', clue: 'Parte visível de aparelhos eletrônicos', category: 'tecnologia' },
  { word: 'WIFI', clue: 'Rede sem fio', category: 'tecnologia' },
  { word: 'NUVEM', clue: 'Armazenamento de dados online', category: 'tecnologia' },
  { word: 'BLUETOOTH', clue: 'Conexão sem fio de curto alcance', category: 'tecnologia' },
  { word: 'IMPRESSORA', clue: 'Reproduz documentos no papel', category: 'tecnologia' },
  { word: 'PINTOR', clue: 'Trabalha com tintas', category: 'profissoes' },
  { word: 'GARCOM', clue: 'Atende em restaurantes', category: 'profissoes' },
  { word: 'JORNALISTA', clue: 'Informa a população', category: 'profissoes' },
  { word: 'SENHA', clue: 'Código de acesso', category: 'tecnologia' },
  { word: 'ATOR', clue: 'Interpreta personagens', category: 'profissoes' },
  { word: 'CANTOR', clue: 'Trabalha com música e voz', category: 'profissoes' },
  { word: 'ESGRIMA', clue: 'Luta com espadas', category: 'esportes' },
  { word: 'SURFE', clue: 'Esporte em cima de ondas', category: 'esportes' },
  { word: 'FEIJOADA', clue: 'Prato típico brasileiro com feijão e carnes', category: 'culturageral' },
  { word: 'CARNAVAL', clue: 'Maior festa popular do Brasil', category: 'culturageral' },
  { word: 'SAMBA', clue: 'Gênero musical associado ao carnaval', category: 'culturageral' },
  { word: 'CAIPIRINHA', clue: 'Bebida brasileira feita com limão e cachaça', category: 'culturageral' },
  { word: 'FUTEBOL', clue: 'Esporte mais popular do Brasil', category: 'culturageral' },
  { word: 'BRASILIA', clue: 'Capital do Brasil', category: 'culturageral' },
  { word: 'AMAZONAS', clue: 'Maior estado brasileiro em extensão', category: 'culturageral' },
  { word: 'PELOTAS', clue: 'Cidade famosa por doces no Rio Grande do Sul', category: 'culturageral' },
  { word: 'MARACATU', clue: 'Ritmo tradicional de Pernambuco', category: 'culturageral' },
  { word: 'CAPOEIRA', clue: 'Luta afro-brasileira com movimentos rítmicos', category: 'culturageral' },
  { word: 'MANDIOCA', clue: 'Raiz comestível base de muitos pratos', category: 'culturageral' },
  { word: 'CARIOCA', clue: 'Gentílico de quem nasce no Rio de Janeiro', category: 'culturageral' },
  { word: 'PAULISTA', clue: 'Gentílico de quem nasce em São Paulo', category: 'culturageral' },
  { word: 'SERTANEJO', clue: 'Estilo musical comum no interior do Brasil', category: 'culturageral' },
  { word: 'FORRO', clue: 'Gênero musical dançante do nordeste', category: 'culturageral' },
  { word: 'CHIMARRAO', clue: 'Bebida quente típica do sul', category: 'culturageral' },
  { word: 'GUARANA', clue: 'Fruta amazônica usada em refrigerantes', category: 'culturageral' },
  { word: 'ARARA', clue: 'Ave colorida típica do Brasil', category: 'culturageral' },
  { word: 'FAVELA', clue: 'Comunidade urbana de ocupação informal', category: 'culturageral' },
  { word: 'REBOCO', clue: 'Camada de argamassa em paredes', category: 'culturageral' },
  { word: 'BERIMBAU', clue: 'Instrumento musical da capoeira', category: 'culturageral' },
  { word: 'QUILOMBO', clue: 'Comunidade formada por escravizados fugidos', category: 'culturageral' },
  { word: 'PASTEL', clue: 'Salgado frito recheado, popular em feiras', category: 'culturageral' },
  { word: 'BOLODEROLO', clue: 'Doce feito com camadas finas enroladas', category: 'culturageral' },
  { word: 'PIPOCA', clue: 'Milho estourado, comum em festas juninas', category: 'culturageral' },
  { word: 'JUNINA', clue: 'Festa típica celebrada em junho', category: 'culturageral' },
  { word: 'CANJICA', clue: 'Doce feito com milho branco e leite', category: 'culturageral' },
  { word: 'PAMONHA', clue: 'Prato feito com milho ralado e cozido', category: 'culturageral' },
  { word: 'MOQUECA', clue: 'Prato de peixe cozido com temperos', category: 'culturageral' },
  { word: 'COXINHA', clue: 'Salgado com recheio de frango desfiado', category: 'culturageral' },
  { word: 'BRIGADEIRO', clue: 'Doce de chocolate enrolado', category: 'culturageral' },
  { word: 'LAMBADA', clue: 'Dança de ritmo rápido popular nos anos 80', category: 'culturageral' },
  { word: 'CURUPIRA', clue: 'Criatura folclórica de pés virados', category: 'culturageral' },
  { word: 'SACI', clue: 'Menino de uma perna só do folclore', category: 'culturageral' },
  { word: 'BOTO', clue: 'Animal amazônico presente em lendas', category: 'culturageral' },
  { word: 'CACIQUE', clue: 'Líder indígena tradicional', category: 'culturageral' },
  { word: 'ALDEIA', clue: 'Comunidade indígena', category: 'culturageral' },
  { word: 'CUICA', clue: 'Instrumento de percussão com som agudo', category: 'culturageral' },
  { word: 'REPIQUE', clue: 'Tambor usado no samba', category: 'culturageral' },
  { word: 'PANDEIRO', clue: 'Instrumento com platinelas muito usado no Brasil', category: 'culturageral' },
  { word: 'VIOLA', clue: 'Instrumento musical de cordas usado no sertanejo', category: 'culturageral' }

];

// Função para obter palavras aleatórias
export const getRandomWords = (count: number = 20): WordDefinition[] => {
  const shuffled = [...CROSSWORD_WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Função para obter palavras que se encaixam bem (diferentes tamanhos)
export const getBalancedWords = (): WordDefinition[] => {
  const words = [...CROSSWORD_WORDS];
  
  // Separar por tamanho para um mix melhor
  const short = words.filter(w => w.word.length <= 4);
  const medium = words.filter(w => w.word.length >= 5 && w.word.length <= 7);
  const long = words.filter(w => w.word.length >= 8);
  
  // Selecionar um mix balanceado com mais palavras
  const selected = [
    ...short.sort(() => 0.5 - Math.random()).slice(0, 8),
    ...medium.sort(() => 0.5 - Math.random()).slice(0, 15),
    ...long.sort(() => 0.5 - Math.random()).slice(0, 6)
  ];
  
  return selected.sort(() => 0.5 - Math.random());
};
