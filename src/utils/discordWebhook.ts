
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

export const sendGameResultToDiscord = async (shareText: string, playerIP: string) => {
  try {
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
        text: `IP: ${playerIP} • aleeessia.com/termo`
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
      console.error('Failed to send to Discord webhook:', response.status);
    }
  } catch (error) {
    console.error('Error sending to Discord webhook:', error);
  }
};
