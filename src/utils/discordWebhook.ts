
interface DiscordWebhookPayload {
  content: string;
}

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1386154009617891488/Vu4BqRLLm3TDhMVOpiaDU-hM_Irl720APsuUTlxogI7V7gAMpR5CGqOLI-Ale2CJp-Ch";

export const sendGameResultToDiscord = async (shareText: string, playerIP: string) => {
  try {
    const payload: DiscordWebhookPayload = {
      content: `🎮 **Uma pessoa jogou Termo!**\n\n\`\`\`\n${shareText}\n\`\`\`\n\n📍 **IP:** \`${playerIP}\``
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
