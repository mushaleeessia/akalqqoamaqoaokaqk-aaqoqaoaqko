
interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: DiscordEmbedField[];
  footer?: {
    text: string;
  };
  timestamp?: string;
  author?: {
    name: string;
    icon_url?: string;
  };
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1386154009617891488/Vu4BqRLLm3TDhMVOpiaDU-hM_Irl720APsuUTlxogI7V7gAMpR5CGqOLI-Ale2CJp-Ch";
const ACCOUNT_DELETION_WEBHOOK_URL = "https://discord.com/api/webhooks/1387603966199730388/LUoJhmv0OQ-C4P_YcbNm2JHDIBnqECrcchRpFCle7EOS5SDUaXaXt-7fdBjoYmvWHG1B";

export type GameState = 'playing' | 'win' | 'lose' | 'already_won' | 'already_lost';

export const sendGameResultToDiscord = async (shareText: string, isGuest: boolean, gameState: GameState, userInfo?: { nickname?: string; discordUsername?: string; discordAvatar?: string }) => {
  try {
    // Só enviar webhook se o jogo terminou (win ou lose)
    if (gameState !== 'win' && gameState !== 'lose') {
      return;
    }

    // Validar se o shareText tem conteúdo suficiente
    if (!shareText || shareText.length < 10) {
      return;
    }

    // Extrair informações do shareText
    const lines = shareText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length < 2) {
      return;
    }

    const titleLine = lines[0]; // Ex: "Termo Solo 🎯 22/06/2025"
    const resultLine = lines[1]; // Ex: "✅ 3/6" ou "❌ X/6"
    
    const isWin = resultLine.includes('✅');
    const color = isWin ? 0x00ff00 : 0xff0000; // Verde para vitória, vermelho para derrota
    
    // Pegar só a parte do grid (entre as linhas vazias ou após a linha do resultado)
    let gridStartIndex = 2; // Começa após título e resultado
    
    // Procurar por uma linha vazia que separa o cabeçalho do grid
    const emptyLineIndex = lines.findIndex((line, index) => index > 1 && line.trim() === '');
    if (emptyLineIndex > -1) {
      gridStartIndex = emptyLineIndex + 1;
    }
    
    // Encontrar onde termina o grid (antes do link do site)
    const gridEndIndex = lines.findIndex((line, index) => 
      index > gridStartIndex && line.includes('aleeessia.com')
    );
    
    const actualGridEndIndex = gridEndIndex > -1 ? gridEndIndex : lines.length;
    const gridLines = lines.slice(gridStartIndex, actualGridEndIndex).filter(line => line.trim() !== '');
    const gridText = gridLines.join('\n');

    let embedTitle = "🎮 Alguém jogou Termo!";
    let authorConfig = undefined;
    let footerText = "aleeessia.com/termo";

    if (!isGuest && userInfo) {
      // Usuário conectado - mostrar nome no título e informações do autor
      const displayName = userInfo.nickname || "Usuário";
      embedTitle = `🎮 ${displayName} jogou Termo!`;
      
      if (userInfo.discordUsername) {
        authorConfig = {
          name: userInfo.discordUsername,
          icon_url: userInfo.discordAvatar
        };
      }
    } else {
      // Convidado - manter título genérico
      footerText = "Convidado • aleeessia.com/termo";
    }

    const embed: DiscordEmbed = {
      title: embedTitle,
      description: `**${titleLine}**\n**${resultLine}**`,
      color: color,
      author: authorConfig,
      fields: [
        {
          name: "📊 Resultado",
          value: gridText ? `\`\`\`\n${gridText}\n\`\`\`` : "Grid não disponível",
          inline: false
        }
      ],
      footer: {
        text: footerText
      },
      timestamp: new Date().toISOString()
    };

    const payload: DiscordWebhookPayload = {
      embeds: [embed]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw error; // Re-throw para que o erro seja capturado no hook
  }
};

export const sendAccountDeletionToDiscord = async (userProfile: any) => {
  try {
    const embed: DiscordEmbed = {
      title: "🗑️ Conta Deletada",
      description: `O usuário **${userProfile.nickname}** deletou sua conta.`,
      color: 0xff4444,
      footer: {
        text: "aleeessia.com/termo"
      },
      timestamp: new Date().toISOString()
    };

    const payload: DiscordWebhookPayload = {
      embeds: [embed]
    };

    await fetch(ACCOUNT_DELETION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silently fail
  }
};
