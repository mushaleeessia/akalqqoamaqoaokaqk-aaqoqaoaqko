import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AimTrainerWebhookRequest {
  user_id: string;
  nickname: string;
  game_mode: string;
  score: number;
  accuracy: number;
  targets_hit: number;
  targets_missed: number;
  total_targets: number;
  avg_reaction_time: number;
  duration: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      user_id, 
      nickname, 
      game_mode, 
      score, 
      accuracy, 
      targets_hit, 
      targets_missed, 
      total_targets, 
      avg_reaction_time, 
      duration 
    }: AimTrainerWebhookRequest = await req.json();

    console.log('Received aim trainer completion:', { 
      user_id, 
      nickname, 
      game_mode, 
      score, 
      accuracy, 
      targets_hit, 
      duration 
    });

    const webhookUrl = Deno.env.get('DISCORD_OTHER_WEBHOOK');
    
    if (!webhookUrl) {
      console.error('DISCORD_OTHER_WEBHOOK not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook URL not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Create the Discord embed
    const embed = {
      title: "🎯 Aim Trainer - Jogo Completado!",
      description: `**${nickname}** completou um jogo no modo **${game_mode.toUpperCase()}**`,
      color: 0x00ff00,
      fields: [
        {
          name: "📊 Estatísticas",
          value: `**Pontuação:** ${score}\n**Precisão:** ${accuracy.toFixed(1)}%\n**Alvos Acertados:** ${targets_hit}/${total_targets}\n**Alvos Perdidos:** ${targets_missed}`,
          inline: true
        },
        {
          name: "⏱️ Tempo",
          value: `**Duração:** ${duration}s\n**Tempo de Reação Médio:** ${avg_reaction_time.toFixed(0)}ms`,
          inline: true
        },
        {
          name: "🎮 Modo de Jogo",
          value: game_mode.charAt(0).toUpperCase() + game_mode.slice(1),
          inline: true
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Aim Trainer Stats"
      }
    };

    const webhookPayload = {
      embeds: [embed]
    };

    console.log('Sending webhook to Discord...');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      console.error('Failed to send Discord webhook:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Discord webhook error response:', errorText);
      
      return new Response(
        JSON.stringify({ error: 'Failed to send Discord webhook', details: errorText }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Discord webhook sent successfully');

    return new Response(
      JSON.stringify({ message: 'Webhook sent successfully' }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in aim-trainer-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);