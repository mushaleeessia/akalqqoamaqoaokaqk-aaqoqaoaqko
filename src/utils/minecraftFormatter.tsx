
import React from 'react';

// Mapeamento dos códigos de cor do Minecraft para classes Tailwind
const colorMap: { [key: string]: string } = {
  '0': 'text-black',           // Preto
  '1': 'text-blue-800',        // Azul escuro
  '2': 'text-green-600',       // Verde escuro
  '3': 'text-cyan-600',        // Azul-ciano escuro
  '4': 'text-red-700',         // Vermelho escuro
  '5': 'text-purple-600',      // Roxo
  '6': 'text-yellow-600',      // Dourado
  '7': 'text-gray-300',        // Cinza claro
  '8': 'text-gray-600',        // Cinza escuro
  '9': 'text-blue-400',        // Azul
  'a': 'text-green-400',       // Verde claro
  'b': 'text-cyan-400',        // Azul-ciano claro
  'c': 'text-red-400',         // Vermelho claro
  'd': 'text-pink-400',        // Rosa claro
  'e': 'text-yellow-400',      // Amarelo
  'f': 'text-white',           // Branco
};

// Códigos de formatação
const formatMap: { [key: string]: string } = {
  'l': 'font-bold',            // Negrito
  'o': 'italic',               // Itálico
  'n': 'underline',            // Sublinhado
  'm': 'line-through',         // Riscado
  'k': 'animate-pulse',        // Obfuscado (usando pulse como aproximação)
  'r': 'reset',                // Reset
};

interface TextSegment {
  text: string;
  classes: string[];
}

export const parseMinecraftText = (text: string): TextSegment[] => {
  if (!text) return [];
  
  const segments: TextSegment[] = [];
  let currentClasses: string[] = ['text-gray-200']; // Cor padrão
  let currentText = '';
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '&' && i + 1 < text.length) {
      const code = text[i + 1].toLowerCase();
      
      // Se temos texto acumulado, adiciona como segmento
      if (currentText) {
        segments.push({
          text: currentText,
          classes: [...currentClasses]
        });
        currentText = '';
      }
      
      // Processa o código
      if (colorMap[code]) {
        // Remove cores anteriores e adiciona nova cor
        currentClasses = currentClasses.filter(cls => !Object.values(colorMap).includes(cls));
        currentClasses.push(colorMap[code]);
      } else if (formatMap[code]) {
        if (code === 'r') {
          // Reset - volta para o padrão
          currentClasses = ['text-gray-200'];
        } else {
          // Adiciona formatação se ainda não existe
          const formatClass = formatMap[code];
          if (!currentClasses.includes(formatClass)) {
            currentClasses.push(formatClass);
          }
        }
      } else {
        // Código não reconhecido, trata como texto normal
        currentText += text[i];
        continue;
      }
      
      i++; // Pula o próximo caractere (código)
    } else {
      currentText += text[i];
    }
  }
  
  // Adiciona o último segmento se houver texto
  if (currentText) {
    segments.push({
      text: currentText,
      classes: [...currentClasses]
    });
  }
  
  return segments;
};

export const renderMinecraftText = (text: string): React.ReactNode => {
  if (!text) return null;
  
  // Processa quebras de linha primeiro
  const lines = text.split('\\n');
  
  return lines.map((line, lineIndex) => (
    <React.Fragment key={lineIndex}>
      {lineIndex > 0 && <br />}
      {parseMinecraftText(line).map((segment, segmentIndex) => (
        <span
          key={`${lineIndex}-${segmentIndex}`}
          className={segment.classes.join(' ')}
        >
          {segment.text}
        </span>
      ))}
    </React.Fragment>
  ));
};
