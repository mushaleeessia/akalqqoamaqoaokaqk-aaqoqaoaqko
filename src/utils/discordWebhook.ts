
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
}

interface DiscordWebhookPayload {
  embeds: DiscordEmbed[];
}

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1386154009617891488/Vu4BqRLLm3TDhMVOpiaDU-hM_Irl720APsuUTlxogI7V7gAMpR5CGqOLI-Ale2CJp-Ch";
const ACCOUNT_DELETION_WEBHOOK_URL = "https://discord.com/api/webhooks/1387603966199730388/LUoJhmv0OQ-C4P_YcbNm2JHDIBnqECrcchRpFCle7EOS5SDUaXaXt-7fdBjoYmvWHG1B";

export type GameState = 'playing' | 'win' | 'lose' | 'already_won' | 'already_lost';

export const sendGameResultToDiscord = async (shareText: string, isGuest: boolean, gameState: GameState) => {
  try {
    // Só enviar webhook se o jogo terminou (win ou lose)
    if (gameState !== 'win' && gameState !== 'lose') {
      return;
    }

    // Extrair informações do shareText
    const lines = shareText.split('\n');
    const titleLine = lines[0]; // Ex: "Termo Solo 🎯 22/06/2025"
    const resultLine = lines[1]; // Ex: "✅ 3/6" ou "❌ X/6"
    
    const isWin = resultLine.includes('✅');
    const color = isWin ? 0x00ff00 : 0xff0000; // Verde para vitória, vermelho para derrota
    
    // Pegar só a parte do grid (entre as linhas vazias)
    const gridStartIndex = lines.findIndex(line => line.trim() === '') + 1;
    const gridEndIndex = lines.findIndex((line, index) => index > gridStartIndex && line.includes('aleeessia.com'));
    const gridLines = lines.slice(gridStartIndex, gridEndIndex).filter(line => line.trim() !== '');
    const gridText = gridLines.join('\n');

    // Determinar status do usuário
    const userStatus = isGuest ? "Convidado" : "🔗 Discord conectado";

    const embed: DiscordEmbed = {
      title: "🎮 Alguém jogou Termo!",
      description: `**${titleLine}**\n**${resultLine}**`,
      color: color,
      fields: [
        {
          name: "📊 Resultado",
          value: `\`\`\`\n${gridText}\n\`\`\``,
          inline: false
        }
      ],
      footer: {
        text: `${userStatus} • aleeessia.com/termo`
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
      // Removido console.error
    }
  } catch (error) {
    // Removido console.error
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
