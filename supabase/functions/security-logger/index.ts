
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  data?: any;
  timestamp: string;
}

interface DiscordEmbed {
  title: string;
  description: string;
  color: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
}

const getSeverityColor = (severity: string): number => {
  switch (severity) {
    case 'critical': return 0xff0000; // Vermelho
    case 'high': return 0xff8800; // Laranja
    case 'medium': return 0xffff00; // Amarelo
    case 'low': return 0x00ff00; // Verde
    default: return 0x888888; // Cinza
  }
};

const getSeverityEmoji = (severity: string): string => {
  switch (severity) {
    case 'critical': return '🚨';
    case 'high': return '⚠️';
    case 'medium': return '⚡';
    case 'low': return 'ℹ️';
    default: return '🔍';
  }
};

const getTypeEmoji = (type: string): string => {
  switch (type) {
    case 'rate_limit_exceeded': return '🚫';
    case 'invalid_nickname': return '💬';
    case 'suspicious_behavior': return '👀';
    case 'validation_failed': return '❌';
    case 'account_creation_blocked': return '🛡️';
    case 'webhook_spam': return '📨';
    case 'data_tampering': return '🔧';
    case 'bot_detected': return '🤖';
    default: return '🔒';
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { events } = await req.json();

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'No events provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const SECURITY_WEBHOOK_URL = Deno.env.get('DISCORD_OTHER_WEBHOOK');
    
    if (!SECURITY_WEBHOOK_URL) {
      throw new Error('Security webhook URL not configured');
    }

    // Agrupar eventos por severidade
    const groupedEvents = events.reduce((acc: any, event: SecurityEvent) => {
      if (!acc[event.severity]) acc[event.severity] = [];
      acc[event.severity].push(event);
      return acc;
    }, {});

    const embeds: DiscordEmbed[] = [];

    // Criar embed para cada nível de severidade
    for (const [severity, severityEvents] of Object.entries(groupedEvents)) {
      const eventList = (severityEvents as SecurityEvent[]);
      
      if (eventList.length === 0) continue;

      const embed: DiscordEmbed = {
        title: `${getSeverityEmoji(severity)} Eventos de Segurança - ${severity.toUpperCase()}`,
        description: `${eventList.length} evento(s) detectado(s)`,
        color: getSeverityColor(severity),
        fields: [],
        footer: {
          text: "Sistema de Segurança - Termo"
        },
        timestamp: new Date().toISOString()
      };

      // Adicionar até 10 eventos por embed (limite do Discord)
      const eventsToShow = eventList.slice(0, 10);
      
      for (const event of eventsToShow) {
        let fieldValue = `**Mensagem:** ${event.message}\n`;
        
        if (event.userId) {
          fieldValue += `**Usuário:** ${event.userId}\n`;
        }
        
        if (event.ip) {
          fieldValue += `**IP:** ${event.ip.substring(0, 10)}...\n`;
        }
        
        if (event.data && typeof event.data === 'object') {
          const dataStr = JSON.stringify(event.data).substring(0, 100);
          fieldValue += `**Dados:** ${dataStr}${dataStr.length >= 100 ? '...' : ''}\n`;
        }
        
        fieldValue += `**Horário:** ${new Date(event.timestamp).toLocaleString('pt-BR')}`;

        embed.fields?.push({
          name: `${getTypeEmoji(event.type)} ${event.type.replace(/_/g, ' ').toUpperCase()}`,
          value: fieldValue,
          inline: false
        });
      }

      // Se houver mais eventos, adicionar nota
      if (eventList.length > 10) {
        embed.fields?.push({
          name: "ℹ️ AVISO",
          value: `Mais ${eventList.length - 10} eventos de mesma severidade foram omitidos para evitar spam.`,
          inline: false
        });
      }

      embeds.push(embed);
    }

    // Enviar para Discord
    const payload = {
      embeds: embeds.slice(0, 3) // Discord permite até 10 embeds, mas vamos limitar a 3
    };

    const response = await fetch(SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: events.length,
      embeds: embeds.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Security logger error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
