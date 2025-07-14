import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, userId, nickname, isGuest, metadata, timestamp } = await req.json();
    
    console.log('Activity log received:', { type, userId, nickname, isGuest, metadata });

    const webhookUrl = Deno.env.get('DISCORD_OTHER_WEBHOOK');
    if (!webhookUrl) {
      console.error('DISCORD_OTHER_WEBHOOK not configured');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let embed;
    const userName = nickname || (isGuest ? 'Alguém' : 'Usuário');
    const now = new Date(timestamp);
    const timeString = now.toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (type) {
      case 'game_start':
        embed = {
          title: '🎮 Novo Jogo Iniciado',
          color: 0x00ff00,
          description: `**${userName}** iniciou um jogo no modo **${metadata.gameMode}**`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      case 'mode_change':
        embed = {
          title: '🔄 Mudança de Modo',
          color: 0xffaa00,
          description: `**${userName}** mudou do modo **${metadata.fromMode}** para **${metadata.toMode}**`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      case 'first_game':
        embed = {
          title: '🌟 Primeiro Jogo',
          color: 0xff69b4,
          description: `**${userName}** jogou seu primeiro jogo no modo **${metadata.gameMode}**!`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      case 'high_streak':
        let streakEmoji = '🔥';
        if (metadata.streak >= 20) streakEmoji = '💥';
        else if (metadata.streak >= 10) streakEmoji = '⚡';
        
        embed = {
          title: `${streakEmoji} Streak Alta!`,
          color: 0xff0000,
          description: `**${userName}** alcançou **${metadata.streak} vitórias** seguidas no modo **${metadata.gameMode}**!`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      case 'long_game':
        const minutes = Math.floor(metadata.gameDuration / 60);
        embed = {
          title: '⏰ Jogo Longo',
          color: 0x9932cc,
          description: `**${userName}** jogou por **${minutes} minutos** no modo **${metadata.gameMode}**`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      case 'new_user':
        embed = {
          title: '🎉 Novo Usuário',
          color: 0x00ffff,
          description: `**${userName}** se cadastrou no Termo!`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      case 'page_visit':
        // Só logar visitas interessantes (não homepage)
        if (metadata.page === '/' || metadata.page === '') return new Response('OK', { headers: corsHeaders });
        
        let pageEmoji = '📄';
        if (metadata.page.includes('cruzadas')) pageEmoji = '🧩';
        else if (metadata.page.includes('music')) pageEmoji = '🎵';
        
        embed = {
          title: `${pageEmoji} Página Visitada`,
          color: 0x87ceeb,
          description: `**${userName}** acessou: **${metadata.page}**`,
          timestamp: timestamp,
          footer: { text: `Termo • ${timeString}` }
        };
        break;

      default:
        console.log('Unknown activity type:', type);
        return new Response('Unknown type', { headers: corsHeaders });
    }

    // Enviar para Discord
    const discordPayload = {
      embeds: [embed]
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      console.error('Discord webhook failed:', await discordResponse.text());
      return new Response(JSON.stringify({ error: 'Discord webhook failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Activity log sent successfully');
    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Error processing activity log:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});