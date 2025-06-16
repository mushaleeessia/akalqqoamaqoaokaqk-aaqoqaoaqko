
// Serviço para verificar se streamers estão online na Twitch, YouTube e TikTok
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

export const checkTikTokStatus = async (username: string): Promise<boolean> => {
  try {
    // Para TikTok, tentamos acessar a página de live
    // Nota: Esta é uma verificação básica que pode precisar ser ajustada devido ao CORS
    const response = await fetch(`https://www.tiktok.com/@${username}/live`);
    
    // Se a página carregar, assumimos que pode estar ao vivo
    // Esta verificação é limitada devido às restrições de CORS do TikTok
    return response.status === 200;
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
