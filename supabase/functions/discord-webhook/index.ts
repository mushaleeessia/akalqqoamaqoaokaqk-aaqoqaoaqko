
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (type === 'game_result') {
      const { shareText, isGuest, gameState, userInfo } = data;
      
      // Só enviar webhook se o jogo terminou (win ou lose)
      if (gameState !== 'win' && gameState !== 'lose') {
        return new Response(JSON.stringify({ success: false, message: 'Game not finished' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validar se o shareText tem conteúdo suficiente
      if (!shareText || shareText.length < 10) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid share text' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Extrair informações do shareText
      const lines = shareText.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length < 2) {
        return new Response(JSON.stringify({ success: false, message: 'Insufficient content' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const titleLine = lines[0];
      const resultLine = lines[1];
      const isWin = resultLine.includes('✅');
      const color = isWin ? 0x00ff00 : 0xff0000;
      
      // Pegar só a parte do grid
      let gridStartIndex = 2;
      const emptyLineIndex = lines.findIndex((line, index) => index > 1 && line.trim() === '');
      if (emptyLineIndex > -1) {
        gridStartIndex = emptyLineIndex + 1;
      }
      
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
        const displayName = userInfo.nickname || "Usuário";
        embedTitle = `🎮 ${displayName} jogou Termo!`;
        
        if (userInfo.discordUsername) {
          authorConfig = {
            name: userInfo.discordUsername,
            icon_url: userInfo.discordAvatar
          };
        }
      } else {
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

      // URL do webhook protegida como variável de ambiente
      const DISCORD_WEBHOOK_URL = Deno.env.get('DISCORD_WEBHOOK_URL');
      
      if (!DISCORD_WEBHOOK_URL) {
        throw new Error('Discord webhook URL not configured');
      }

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Discord webhook failed: ${response.status}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (type === 'account_deletion') {
      const { userProfile } = data;
      
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

      const ACCOUNT_DELETION_WEBHOOK_URL = Deno.env.get('ACCOUNT_DELETION_WEBHOOK_URL');
      
      if (!ACCOUNT_DELETION_WEBHOOK_URL) {
        throw new Error('Account deletion webhook URL not configured');
      }

      await fetch(ACCOUNT_DELETION_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid type' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
