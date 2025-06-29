import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  footer?: {
    text: string;
  };
  timestamp?: string;
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

    if (type === 'click_log') {
      // Log individual click - versão simplificada
      const { linkTitle, linkUrl } = data;
      
      const embed: DiscordEmbed = {
        title: "🔗 Link Clicado",
        description: `**${linkTitle}**\n${linkUrl}`,
        color: 0x3498db,
        footer: {
          text: "aleeessia.com"
        },
        timestamp: new Date().toISOString()
      };

      const payload: DiscordWebhookPayload = {
        embeds: [embed]
      };

      const DISCORD_CLICKS_WEBHOOK = Deno.env.get('DISCORD_CLICKS_WEBHOOK');
      
      if (!DISCORD_CLICKS_WEBHOOK) {
        throw new Error('Discord clicks webhook URL not configured');
      }

      await fetch(DISCORD_CLICKS_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (type === 'stats_update') {
      // Update static stats message
      const { stats } = data;
      
      let description = "📊 **Estatísticas de Cliques nos Links**\n\n";
      
      if (stats.length === 0) {
        description += "Nenhum clique registrado ainda.";
      } else {
        stats.forEach((stat: any) => {
          description += `**🔗 ${stat.link_title}**\n`;
          description += `└ Total: ${stat.total_clicks} | Hoje: ${stat.clicks_today} | Esta semana: ${stat.clicks_this_week}\n`;
          description += `└ Último clique: ${stat.last_click ? new Date(stat.last_click).toLocaleString('pt-BR') : 'Nunca'}\n\n`;
        });
      }

      const embed: DiscordEmbed = {
        title: "📈 Estatísticas de Links - aleeessia.com",
        description: description,
        color: 0x2ecc71,
        footer: {
          text: `Última atualização: ${new Date().toLocaleString('pt-BR')}`
        },
        timestamp: new Date().toISOString()
      };

      const payload: DiscordWebhookPayload = {
        embeds: [embed]
      };

      const DISCORD_STATIC_MESSAGE = Deno.env.get('DISCORD_STATIC_MESSAGE');
      
      if (!DISCORD_STATIC_MESSAGE) {
        throw new Error('Discord static message URL not configured');
      }

      // Edit the existing message
      await fetch(DISCORD_STATIC_MESSAGE, {
        method: 'PATCH',
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
    console.error('Error in link-clicks-webhook:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
