
// Serviço para verificar se streamers estão online na Twitch e YouTube
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

export const checkYouTubeStatus = async (channelName: string): Promise<boolean> => {
  try {
    // Para verificar se o canal está ao vivo, usamos uma abordagem simples
    // Nota: Esta é uma verificação básica que pode precisar ser ajustada
    const response = await fetch(`https://www.youtube.com/@${channelName}/live`);
    
    // Se a página carregar sem redirecionamento, provavelmente está ao vivo
    return response.status === 200 && !response.url.includes('/videos');
  } catch (error) {
    // Se houver erro de CORS ou outro, assumimos que não está ao vivo
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
