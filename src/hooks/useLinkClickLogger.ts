
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
      console.log('Registrando clique no link:', linkTitle);
      
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

      console.log('Clique inserido no banco com sucesso');

      // Enviar notificação individual do clique
      console.log('Enviando notificação individual do clique...');
      const { data: clickData, error: clickError } = await supabase.functions.invoke('link-clicks-webhook', {
        body: {
          type: 'click_log',
          data: {
            linkTitle: linkTitle,
            linkUrl: linkUrl
          }
        }
      });

      if (clickError) {
        console.error('Erro ao enviar notificação de clique:', clickError);
      } else {
        console.log('Notificação de clique enviada:', clickData);
      }

      // Atualizar mensagem auto-editável
      console.log('Atualizando mensagem auto-editável...');
      await updateSelfUpdatingMessage();

    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
  };

  const updateSelfUpdatingMessage = async () => {
    try {
      console.log('Buscando estatísticas para mensagem auto-editável...');
      
      // Buscar estatísticas
      const { data: stats, error } = await supabase
        .rpc('get_link_click_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }

      console.log('Estatísticas obtidas para auto-edição:', stats);

      // Atualizar mensagem auto-editável
      const { data: updateData, error: webhookError } = await supabase.functions.invoke('link-clicks-webhook', {
        body: {
          type: 'self_update_message',
          data: {
            stats: stats || []
          }
        }
      });

      if (webhookError) {
        console.error('Erro ao atualizar mensagem auto-editável:', webhookError);
      } else {
        console.log('Mensagem auto-editável atualizada com sucesso:', updateData);
      }

    } catch (error) {
      console.error('Erro ao atualizar mensagem auto-editável:', error);
    }
  };

  const updateStats = async () => {
    try {
      console.log('Atualizando estatísticas...');
      
      // Buscar estatísticas
      const { data: stats, error } = await supabase
        .rpc('get_link_click_stats');

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return;
      }

      console.log('Estatísticas obtidas:', stats);

      // Atualizar mensagem estática
      const { data, error: webhookError } = await supabase.functions.invoke('link-clicks-webhook', {
        body: {
          type: 'stats_update',
          data: {
            stats: stats || []
          }
        }
      });

      if (webhookError) {
        console.error('Erro ao atualizar estatísticas via webhook:', webhookError);
      } else {
        console.log('Estatísticas atualizadas com sucesso:', data);
      }

    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
    }
  };

  return { logClick, updateStats, updateSelfUpdatingMessage };
};
