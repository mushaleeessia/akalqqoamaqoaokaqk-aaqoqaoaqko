
import { supabase } from '@/integrations/supabase/client';

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

export const useLinkClickLogger = () => {
  const logClick = async (linkTitle: string, linkUrl: string) => {
    try {
      const clientIP = await getClientIP();
      const userAgent = navigator.userAgent;

      // Inserir no banco de dados
      const { error: dbError } = await supabase
        .from('link_clicks')
        .insert({
          link_title: linkTitle,
          link_url: linkUrl,
          user_agent: userAgent,
          ip_address: clientIP
        });

      if (dbError) {
        console.error('Erro ao inserir clique no banco:', dbError);
        return;
      }

      // Enviar webhook de clique individual
      await supabase.functions.invoke('link-clicks-webhook', {
        body: {
          type: 'click_log',
          data: {
            linkTitle,
            linkUrl,
            userAgent,
            ipAddress: clientIP
          }
        }
      });

    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  const updateStats = async () => {
    try {
      // Buscar estatísticas
      const { data: stats, error } = await supabase
        .rpc('get_link_click_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }

      // Atualizar mensagem estática
      await supabase.functions.invoke('link-clicks-webhook', {
        body: {
          type: 'stats_update',
          data: {
            stats: stats || []
          }
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  };

  return { logClick, updateStats };
};
