
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

// Função para normalizar títulos de links (mapear inglês para português)
const normalizeLinkTitle = (title: string): string => {
  const titleMap: { [key: string]: string } = {
    "Does Alessia ban wrongly or without reason?": "A Alessia bane errado ou sem motivo?",
    "Mush's Website": "Site Mush",
    "Mush's Discord": "Discord Mush",
    // Adicione outros mapeamentos conforme necessário
  };
  
  return titleMap[title] || title;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook chamado, processando...');
    const { type, data } = await req.json();
    console.log('Tipo de webhook:', type, 'Dados:', data);

    if (type === 'click_log') {
      // Log individual click
      const { linkTitle, linkUrl } = data;
      const normalizedTitle = normalizeLinkTitle(linkTitle);
      console.log('Processando clique individual:', normalizedTitle, linkUrl);
      
      const embed: DiscordEmbed = {
        title: "🔗 Link Clicado",
        description: `**${normalizedTitle}**\n${linkUrl}`,
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
        console.error('Discord clicks webhook URL not configured');
        throw new Error('Discord clicks webhook URL not configured');
      }

      console.log('Enviando clique individual para Discord...');
      const response = await fetch(DISCORD_CLICKS_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao enviar clique para Discord:', response.status, errorText);
        throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Clique enviado para Discord com sucesso:', responseText);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (type === 'self_update_message') {
      // Update self-updating message with organized statistics in separate embeds
      const { stats } = data;
      console.log('Atualizando mensagem auto-editável:', stats);
      
      // Normalizar e consolidar estatísticas por título
      const consolidatedStats = new Map();
      
      stats.forEach((stat: any) => {
        const normalizedTitle = normalizeLinkTitle(stat.link_title);
        
        if (consolidatedStats.has(normalizedTitle)) {
          const existing = consolidatedStats.get(normalizedTitle);
          existing.total_clicks += stat.total_clicks;
          existing.clicks_today += stat.clicks_today;
          existing.clicks_this_week += stat.clicks_this_week;
          existing.clicks_this_month += stat.clicks_this_month;
          
          // Manter o último clique mais recente
          if (new Date(stat.last_click) > new Date(existing.last_click)) {
            existing.last_click = stat.last_click;
          }
        } else {
          consolidatedStats.set(normalizedTitle, {
            link_title: normalizedTitle,
            total_clicks: stat.total_clicks,
            clicks_today: stat.clicks_today,
            clicks_this_week: stat.clicks_this_week,
            clicks_this_month: stat.clicks_this_month,
            last_click: stat.last_click
          });
        }
      });
      
      const consolidatedArray = Array.from(consolidatedStats.values());
      
      const embeds: DiscordEmbed[] = [];
      
      if (consolidatedArray.length === 0) {
        embeds.push({
          title: "📈 Contador de Cliques - aleeessia.com",
          description: "Nenhum clique registrado ainda.",
          color: 0xe74c3c,
          footer: {
            text: `Última atualização: ${new Date().toLocaleString('pt-BR')}`
          },
          timestamp: new Date().toISOString()
        });
      } else {
        // Calcular totais
        let totalGeral = 0;
        let totalHoje = 0;
        let totalSemana = 0;
        let totalMes = 0;

        consolidatedArray.forEach((stat: any) => {
          totalGeral += stat.total_clicks;
          totalHoje += stat.clicks_today;
          totalSemana += stat.clicks_this_week;
          totalMes += stat.clicks_this_month;
        });

        // Embed 1: Cliques Mensais
        let monthlyDescription = `📅 **Cliques Mensais: ${totalMes}**\n\n`;
        consolidatedArray.forEach((stat: any) => {
          monthlyDescription += `└ ${stat.link_title}: ${stat.clicks_this_month}\n`;
        });
        
        embeds.push({
          title: "📅 Cliques Mensais - aleeessia.com",
          description: monthlyDescription,
          color: 0x9b59b6,
          footer: {
            text: `Última atualização: ${new Date().toLocaleString('pt-BR')}`
          },
          timestamp: new Date().toISOString()
        });

        // Embed 2: Cliques Semanais
        let weeklyDescription = `📆 **Cliques Semanais: ${totalSemana}**\n\n`;
        consolidatedArray.forEach((stat: any) => {
          weeklyDescription += `└ ${stat.link_title}: ${stat.clicks_this_week}\n`;
        });
        
        embeds.push({
          title: "📆 Cliques Semanais - aleeessia.com",
          description: weeklyDescription,
          color: 0x3498db,
          footer: {
            text: `Última atualização: ${new Date().toLocaleString('pt-BR')}`
          },
          timestamp: new Date().toISOString()
        });

        // Embed 3: Cliques Diários
        let dailyDescription = `📊 **Cliques Diários: ${totalHoje}**\n\n`;
        consolidatedArray.forEach((stat: any) => {
          dailyDescription += `└ ${stat.link_title}: ${stat.clicks_today}\n`;
        });
        
        embeds.push({
          title: "📊 Cliques Diários - aleeessia.com",
          description: dailyDescription,
          color: 0x2ecc71,
          footer: {
            text: `Última atualização: ${new Date().toLocaleString('pt-BR')}`
          },
          timestamp: new Date().toISOString()
        });

        // Embed 4: Cliques Totais
        let totalDescription = `🔢 **Cliques Totais: ${totalGeral}**\n\n`;
        consolidatedArray.forEach((stat: any) => {
          totalDescription += `└ ${stat.link_title}: ${stat.total_clicks}\n`;
        });
        
        embeds.push({
          title: "🔢 Cliques Totais - aleeessia.com",
          description: totalDescription,
          color: 0xe74c3c,
          footer: {
            text: `Última atualização: ${new Date().toLocaleString('pt-BR')}`
          },
          timestamp: new Date().toISOString()
        });
      }

      const payload: DiscordWebhookPayload = {
        embeds: embeds
      };

      const DISCORD_SELFUPDATE_MESSAGE_ID = Deno.env.get('DISCORD_SELFUPDATE_MESSAGE');
      const DISCORD_SELFUPDATEMESSAGE_WEBHOOK = Deno.env.get('DISCORD_SELFUPDATEMESSAGE_WEBHOOK');
      
      if (!DISCORD_SELFUPDATE_MESSAGE_ID || !DISCORD_SELFUPDATEMESSAGE_WEBHOOK) {
        console.error('Discord self-update message ID or webhook URL not configured');
        throw new Error('Discord self-update message ID or webhook URL not configured');
      }

      // Construir a URL da API do Discord para editar mensagens
      // Extrair WEBHOOK_ID e WEBHOOK_TOKEN da URL do webhook
      const webhookUrlParts = DISCORD_SELFUPDATEMESSAGE_WEBHOOK.match(/webhooks\/(\d+)\/([^\/]+)/);
      if (!webhookUrlParts) {
        console.error('Invalid webhook URL format');
        throw new Error('Invalid webhook URL format');
      }

      const webhookId = webhookUrlParts[1];
      const webhookToken = webhookUrlParts[2];
      const editMessageUrl = `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}/messages/${DISCORD_SELFUPDATE_MESSAGE_ID}`;

      console.log('Tentando editar mensagem existente com ID:', DISCORD_SELFUPDATE_MESSAGE_ID);
      let response = await fetch(editMessageUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Se falhar (mensagem não existe), criar uma nova usando o webhook normal (POST)
      if (!response.ok) {
        console.log('Mensagem não existe ou erro ao editar, tentando criar nova...');
        response = await fetch(DISCORD_SELFUPDATEMESSAGE_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao atualizar/criar mensagem:', response.status, errorText);
        throw new Error(`Discord self-update message failed: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Mensagem auto-editável atualizada/criada com sucesso:', responseText);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (type === 'stats_update') {
      // Update static stats message (existing functionality)
      const { stats } = data;
      console.log('Atualizando estatísticas estáticas:', stats);
      
      // Normalizar e consolidar estatísticas por título
      const consolidatedStats = new Map();
      
      stats.forEach((stat: any) => {
        const normalizedTitle = normalizeLinkTitle(stat.link_title);
        
        if (consolidatedStats.has(normalizedTitle)) {
          const existing = consolidatedStats.get(normalizedTitle);
          existing.total_clicks += stat.total_clicks;
          existing.clicks_today += stat.clicks_today;
          existing.clicks_this_week += stat.clicks_this_week;
          
          // Manter o último clique mais recente
          if (new Date(stat.last_click) > new Date(existing.last_click)) {
            existing.last_click = stat.last_click;
          }
        } else {
          consolidatedStats.set(normalizedTitle, {
            link_title: normalizedTitle,
            total_clicks: stat.total_clicks,
            clicks_today: stat.clicks_today,
            clicks_this_week: stat.clicks_this_week,
            last_click: stat.last_click
          });
        }
      });
      
      const consolidatedArray = Array.from(consolidatedStats.values());
      
      let description = "📊 **Estatísticas de Cliques nos Links**\n\n";
      
      if (consolidatedArray.length === 0) {
        description += "Nenhum clique registrado ainda.";
      } else {
        consolidatedArray.forEach((stat: any) => {
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
        console.error('Discord static message URL not configured');
        throw new Error('Discord static message URL not configured');
      }

      // Edit the existing message
      const response = await fetch(DISCORD_STATIC_MESSAGE, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao atualizar mensagem estática:', response.status, errorText);
        throw new Error(`Discord static message update failed: ${response.status} - ${errorText}`);
      }

      const responseText = await response.text();
      console.log('Mensagem estática atualizada com sucesso:', responseText);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Tipo de webhook inválido:', type);
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
