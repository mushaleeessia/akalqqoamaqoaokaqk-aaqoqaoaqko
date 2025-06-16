
// Lista básica de palavras válidas em português de 5 letras
const validWords = new Set([
  'termo', 'palavra', 'jogo', 'casa', 'vida', 'tempo', 'mundo', 'amor', 'morte', 'terra',
  'agua', 'fogo', 'vento', 'luz', 'noite', 'sol', 'lua', 'mar', 'rio', 'monte',
  'pedra', 'arvore', 'flor', 'fruto', 'folha', 'raiz', 'tronco', 'galho', 'semente', 'broto',
  'animal', 'gato', 'cao', 'passaro', 'peixe', 'cobra', 'rato', 'boi', 'porco', 'ovelha',
  'pessoa', 'homem', 'mulher', 'filho', 'filha', 'pai', 'mae', 'avo', 'neto', 'primo',
  'amigo', 'inimigo', 'chefe', 'servo', 'rei', 'rainha', 'conde', 'duque', 'baron', 'nobre',
  'livro', 'carta', 'papel', 'tinta', 'lapis', 'caneta', 'mesa', 'cadeira', 'cama', 'sofa',
  'porta', 'janela', 'parede', 'teto', 'chao', 'escada', 'telhado', 'quintal', 'jardim', 'praca',
  'rua', 'cidade', 'pais', 'estado', 'nacao', 'continente', 'planeta', 'estrela', 'galaxia', 'universo',
  'comida', 'bebida', 'pao', 'leite', 'agua', 'vinho', 'cafe', 'cha', 'suco', 'refrigerante',
  'carne', 'peixe', 'frango', 'ovo', 'queijo', 'manteiga', 'azeite', 'sal', 'acucar', 'mel',
  'fruta', 'maca', 'banana', 'laranja', 'uva', 'limao', 'manga', 'abacaxi', 'melancia', 'morango',
  'verdura', 'alface', 'tomate', 'cebola', 'alho', 'batata', 'cenoura', 'beterraba', 'pepino', 'abobrinha',
  'roupa', 'camisa', 'calca', 'saia', 'vestido', 'blusa', 'casaco', 'jaqueta', 'sapato', 'sandalia',
  'chapeu', 'boné', 'oculos', 'relogio', 'anel', 'colar', 'brinco', 'pulseira', 'corrente', 'alianca',
  'escola', 'faculdade', 'universidade', 'biblioteca', 'museu', 'teatro', 'cinema', 'parque', 'zoologico', 'circo',
  'hospital', 'clinica', 'farmacia', 'banco', 'correio', 'policia', 'bombeiro', 'exercito', 'governo', 'politica',
  'trabalho', 'emprego', 'profissao', 'medico', 'enfermeiro', 'professor', 'advogado', 'engenheiro', 'arquiteto', 'dentista',
  'esporte', 'futebol', 'basquete', 'tenis', 'natacao', 'corrida', 'ciclismo', 'ginastica', 'yoga', 'danca',
  'musica', 'canção', 'ritmo', 'melodia', 'harmonia', 'instrumento', 'piano', 'violao', 'bateria', 'flauta',
  'cor', 'branco', 'preto', 'vermelho', 'azul', 'verde', 'amarelo', 'roxo', 'rosa', 'laranja',
  'numero', 'zero', 'um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito',
  'forma', 'circulo', 'quadrado', 'triangulo', 'retangulo', 'losango', 'oval', 'linha', 'ponto', 'curva',
  'tamanho', 'grande', 'pequeno', 'medio', 'alto', 'baixo', 'largo', 'estreito', 'grosso', 'fino',
  'temperatura', 'quente', 'frio', 'morno', 'gelado', 'fresco', 'calor', 'frio', 'neve', 'gelo',
  'clima', 'chuva', 'sol', 'vento', 'tempestade', 'raio', 'trovao', 'nuvem', 'ceu', 'arco',
  'direcao', 'norte', 'sul', 'leste', 'oeste', 'frente', 'tras', 'direita', 'esquerda', 'cima',
  'movimento', 'andar', 'correr', 'pular', 'voar', 'nadar', 'cair', 'subir', 'descer', 'girar',
  'acao', 'fazer', 'criar', 'destruir', 'construir', 'quebrar', 'consertar', 'limpar', 'sujar', 'lavar',
  'sentimento', 'alegria', 'tristeza', 'raiva', 'medo', 'amor', 'odio', 'paixao', 'saudade', 'esperanca',
  'pensamento', 'ideia', 'opiniao', 'crenca', 'duvida', 'certeza', 'verdade', 'mentira', 'segredo', 'historia',
  'evento', 'festa', 'casamento', 'nascimento', 'morte', 'viagem', 'mudanca', 'encontro', 'despedida', 'reuniao',
  // Adicionando mais palavras comuns
  'sobre', 'entre', 'antes', 'depois', 'durante', 'contra', 'favor', 'junto', 'longe', 'perto',
  'muito', 'pouco', 'mais', 'menos', 'tanto', 'quanto', 'sempre', 'nunca', 'talvez', 'quase',
  'hoje', 'ontem', 'amanha', 'agora', 'logo', 'cedo', 'tarde', 'noite', 'manha', 'meio',
  'pobre', 'rico', 'jovem', 'velho', 'novo', 'antigo', 'moderno', 'classico', 'simples', 'complexo',
  'facil', 'dificil', 'possivel', 'impossivel', 'certo', 'errado', 'bom', 'mau', 'melhor', 'pior',
  'primeiro', 'ultimo', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'setimo', 'oitavo', 'nono',
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro',
  'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo', 'semana', 'mes', 'ano'
]);

export const validatePortugueseWord = (word: string): boolean => {
  return validWords.has(word.toLowerCase());
};

export const getRandomWord = (): string => {
  const wordsArray = Array.from(validWords);
  return wordsArray[Math.floor(Math.random() * wordsArray.length)];
};
