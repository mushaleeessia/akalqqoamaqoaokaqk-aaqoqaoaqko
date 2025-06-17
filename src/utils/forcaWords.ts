
export interface ForcaWord {
  word: string;
  hint: string;
  category: string;
}

export const forcaWords: ForcaWord[] = [
  // Animais
  { word: 'gato', hint: 'Animal doméstico que mia', category: 'Animais' },
  { word: 'cachorro', hint: 'Melhor amigo do homem', category: 'Animais' },
  { word: 'pássaro', hint: 'Animal que voa e tem penas', category: 'Animais' },
  { word: 'peixe', hint: 'Animal aquático que nada', category: 'Animais' },
  { word: 'cavalo', hint: 'Animal usado para montaria', category: 'Animais' },
  { word: 'vaca', hint: 'Animal que produz leite', category: 'Animais' },
  { word: 'porco', hint: 'Animal que vive na lama', category: 'Animais' },
  { word: 'rato', hint: 'Pequeno roedor', category: 'Animais' },
  { word: 'leão', hint: 'Rei da selva', category: 'Animais' },
  { word: 'tigre', hint: 'Felino listrado', category: 'Animais' },
  
  // Objetos
  { word: 'mesa', hint: 'Móvel para comer ou trabalhar', category: 'Objetos' },
  { word: 'cadeira', hint: 'Móvel para sentar', category: 'Objetos' },
  { word: 'livro', hint: 'Objeto com páginas para ler', category: 'Objetos' },
  { word: 'carro', hint: 'Veículo de quatro rodas', category: 'Objetos' },
  { word: 'casa', hint: 'Local onde moramos', category: 'Objetos' },
  { word: 'relógio', hint: 'Marca as horas', category: 'Objetos' },
  { word: 'telefone', hint: 'Aparelho para comunicação', category: 'Objetos' },
  { word: 'espelho', hint: 'Reflete nossa imagem', category: 'Objetos' },
  { word: 'chave', hint: 'Abre fechaduras', category: 'Objetos' },
  { word: 'lápis', hint: 'Instrumento para escrever', category: 'Objetos' },
  
  // Comidas
  { word: 'pizza', hint: 'Comida italiana redonda', category: 'Comidas' },
  { word: 'hambúrguer', hint: 'Sanduíche com carne', category: 'Comidas' },
  { word: 'sorvete', hint: 'Doce gelado', category: 'Comidas' },
  { word: 'chocolate', hint: 'Doce marrom', category: 'Comidas' },
  { word: 'maçã', hint: 'Fruta vermelha ou verde', category: 'Comidas' },
  { word: 'banana', hint: 'Fruta amarela', category: 'Comidas' },
  { word: 'arroz', hint: 'Grão básico da alimentação', category: 'Comidas' },
  { word: 'feijão', hint: 'Grão que acompanha o arroz', category: 'Comidas' },
  { word: 'pão', hint: 'Alimento feito de farinha', category: 'Comidas' },
  { word: 'queijo', hint: 'Derivado do leite', category: 'Comidas' },
  
  // Cores
  { word: 'vermelho', hint: 'Cor do sangue', category: 'Cores' },
  { word: 'azul', hint: 'Cor do céu', category: 'Cores' },
  { word: 'verde', hint: 'Cor da grama', category: 'Cores' },
  { word: 'amarelo', hint: 'Cor do sol', category: 'Cores' },
  { word: 'roxo', hint: 'Mistura de vermelho e azul', category: 'Cores' },
  { word: 'rosa', hint: 'Cor suave e delicada', category: 'Cores' },
  { word: 'laranja', hint: 'Cor da fruta cítrica', category: 'Cores' },
  { word: 'preto', hint: 'Ausência de cor', category: 'Cores' },
  { word: 'branco', hint: 'Cor da neve', category: 'Cores' },
  { word: 'cinza', hint: 'Mistura de preto e branco', category: 'Cores' },
  
  // Natureza
  { word: 'árvore', hint: 'Planta grande com tronco', category: 'Natureza' },
  { word: 'flor', hint: 'Parte colorida da planta', category: 'Natureza' },
  { word: 'rio', hint: 'Corrente de água doce', category: 'Natureza' },
  { word: 'montanha', hint: 'Elevação natural do terreno', category: 'Natureza' },
  { word: 'praia', hint: 'Encontro do mar com a terra', category: 'Natureza' },
  { word: 'chuva', hint: 'Água que cai do céu', category: 'Natureza' },
  { word: 'vento', hint: 'Movimento do ar', category: 'Natureza' },
  { word: 'sol', hint: 'Estrela que ilumina a Terra', category: 'Natureza' },
  { word: 'lua', hint: 'Satélite natural da Terra', category: 'Natureza' },
  { word: 'estrela', hint: 'Ponto brilhante no céu noturno', category: 'Natureza' }
];

export const getRandomWord = (): ForcaWord => {
  const randomIndex = Math.floor(Math.random() * forcaWords.length);
  return forcaWords[randomIndex];
};

export const validateWord = (word: string): boolean => {
  return /^[a-záàâãéèêíìîóòôõúùûçñ]+$/i.test(word);
};
