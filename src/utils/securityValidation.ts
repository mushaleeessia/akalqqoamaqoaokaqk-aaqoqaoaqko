
// Lista de palavras ofensivas básica (você pode expandir)
const OFFENSIVE_WORDS = [
  'fdp', 'puta', 'merda', 'caralho', 'porra', 'buceta', 'cu', 'bosta',
  'nazi', 'hitler', 'kkk', 'fuck', 'shit', 'bitch', 'asshole', 'damn',
  'cunt', 'dick', 'pussy', 'whore', 'slut', 'fag', 'nigger', 'retard'
];

// Padrões suspeitos
const SUSPICIOUS_PATTERNS = [
  /(.)\1{4,}/, // Muitos caracteres repetidos
  /[^\w\s\-\_\.\!]/g, // Caracteres especiais demais
  /^\d+$/, // Só números
  /^[^a-zA-Z]*$/, // Sem letras
  /(admin|mod|bot|test)/i, // Palavras reservadas
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  severity: 'low' | 'medium' | 'high';
  originalValue: string;
  sanitizedValue?: string;
}

export const validateNickname = (nickname: string): ValidationResult => {
  const original = nickname;
  
  // Verificações básicas
  if (!nickname || nickname.trim().length === 0) {
    return {
      isValid: false,
      reason: 'Nickname vazio',
      severity: 'low',
      originalValue: original
    };
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return {
      isValid: false,
      reason: 'Nickname deve ter entre 2 e 20 caracteres',
      severity: 'low',
      originalValue: original
    };
  }

  // Verificar palavras ofensivas
  const lowerNickname = nickname.toLowerCase();
  for (const word of OFFENSIVE_WORDS) {
    if (lowerNickname.includes(word)) {
      return {
        isValid: false,
        reason: `Conteúdo ofensivo detectado: ${word}`,
        severity: 'high',
        originalValue: original
      };
    }
  }

  // Verificar padrões suspeitos
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(nickname)) {
      return {
        isValid: false,
        reason: 'Padrão suspeito detectado',
        severity: 'medium',
        originalValue: original
      };
    }
  }

  // Sanitizar nickname
  const sanitized = nickname
    .trim()
    .replace(/[^\w\s\-\_\.\!]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, ' ') // Remove espaços extras
    .substring(0, 20); // Limita tamanho

  return {
    isValid: true,
    severity: 'low',
    originalValue: original,
    sanitizedValue: sanitized
  };
};

export const validateGameData = (gameData: any): ValidationResult => {
  try {
    // Verificar estrutura básica
    if (!gameData || typeof gameData !== 'object') {
      return {
        isValid: false,
        reason: 'Dados de jogo inválidos',
        severity: 'high',
        originalValue: JSON.stringify(gameData)
      };
    }

    // Verificar campos obrigatórios
    const requiredFields = ['shareText', 'gameState'];
    for (const field of requiredFields) {
      if (!gameData[field]) {
        return {
          isValid: false,
          reason: `Campo obrigatório ausente: ${field}`,
          severity: 'medium',
          originalValue: JSON.stringify(gameData)
        };
      }
    }

    // Verificar tamanho do shareText
    if (gameData.shareText && gameData.shareText.length > 2000) {
      return {
        isValid: false,
        reason: 'ShareText muito longo',
        severity: 'medium',
        originalValue: JSON.stringify(gameData)
      };
    }

    return {
      isValid: true,
      severity: 'low',
      originalValue: JSON.stringify(gameData)
    };
  } catch (error) {
    return {
      isValid: false,
      reason: 'Erro ao validar dados',
      severity: 'high',
      originalValue: 'Error parsing data'
    };
  }
};
