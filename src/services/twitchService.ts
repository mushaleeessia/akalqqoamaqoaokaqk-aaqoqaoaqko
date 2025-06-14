
// Serviço para verificar se streamers estão online na Twitch
export const checkStreamStatus = async (username: string): Promise<boolean> => {
  try {
    // Usando a API pública da Twitch através de um proxy CORS-friendly
    const response = await fetch(`https://decapi.me/twitch/uptime/${username}`);
    const text = await response.text();
    
    // Se retornar algo diferente de "offline" ou erro, está online
    return !text.includes('offline') && !text.includes('error') && text.trim() !== '';
  } catch (error) {
    return false;
  }
};

export const getStreamData = async (username: string) => {
  try {
    const response = await fetch(`https://decapi.me/twitch/title/${username}`);
    const title = await response.text();
    
    if (title.includes('error') || title.includes('offline')) {
      return null;
    }
    
    return {
      username,
      title: title.trim(),
      isLive: true
    };
  } catch (error) {
    return null;
  }
};

export const getLatestVOD = async (username: string) => {
  try {
    // Usando uma API para buscar o último VOD
    const response = await fetch(`https://decapi.me/twitch/latest_video/${username}`);
    const vodUrl = await response.text();
    
    if (vodUrl.includes('error') || vodUrl.includes('offline') || !vodUrl.trim()) {
      return null;
    }
    
    // Extrair o ID do VOD da URL
    const vodMatch = vodUrl.match(/\/videos\/(\d+)/);
    if (vodMatch) {
      return {
        vodId: vodMatch[1],
        url: vodUrl.trim()
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
