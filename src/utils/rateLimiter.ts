
interface RateLimitEntry {
  count: number;
  lastReset: number;
  blocked: boolean;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000 // 5 minutos bloqueado
  };

  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpar entradas antigas a cada 10 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      // Remove entradas antigas (mais de 1 hora)
      if (now - entry.lastReset > 60 * 60 * 1000) {
        this.storage.delete(key);
      }
    }
  }

  private getClientKey(ip: string, userId?: string): string {
    return userId ? `user_${userId}` : `ip_${ip}`;
  }

  async checkLimit(ip: string, userId?: string, config?: Partial<RateLimitConfig>): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    blocked: boolean;
    reason?: string;
  }> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = this.getClientKey(ip, userId);
    const now = Date.now();
    
    let entry = this.storage.get(key);
    
    if (!entry) {
      entry = {
        count: 0,
        lastReset: now,
        blocked: false
      };
    }

    // Verificar se ainda está bloqueado
    if (entry.blocked && (now - entry.lastReset) < finalConfig.blockDurationMs) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.lastReset + finalConfig.blockDurationMs,
        blocked: true,
        reason: 'Cliente temporariamente bloqueado por excesso de requests'
      };
    }

    // Reset do contador se a janela de tempo passou
    if (now - entry.lastReset >= finalConfig.windowMs) {
      entry.count = 0;
      entry.lastReset = now;
      entry.blocked = false;
    }

    // Incrementar contador
    entry.count++;
    
    // Verificar se excedeu o limite
    if (entry.count > finalConfig.maxRequests) {
      entry.blocked = true;
      entry.lastReset = now;
      
      this.storage.set(key, entry);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + finalConfig.blockDurationMs,
        blocked: true,
        reason: `Muitos requests. Limite: ${finalConfig.maxRequests}/${finalConfig.windowMs}ms`
      };
    }

    this.storage.set(key, entry);

    return {
      allowed: true,
      remaining: finalConfig.maxRequests - entry.count,
      resetTime: entry.lastReset + finalConfig.windowMs,
      blocked: false
    };
  }

  // Blacklist manual
  blockClient(ip: string, userId?: string, durationMs: number = 24 * 60 * 60 * 1000) {
    const key = this.getClientKey(ip, userId);
    this.storage.set(key, {
      count: 999,
      lastReset: Date.now(),
      blocked: true
    });
  }

  // Liberar cliente
  unblockClient(ip: string, userId?: string) {
    const key = this.getClientKey(ip, userId);
    this.storage.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

export const getRateLimitConfig = (action: string): Partial<RateLimitConfig> => {
  switch (action) {
    case 'webhook':
      return {
        maxRequests: 5, // 5 webhooks por minuto
        windowMs: 60 * 1000,
        blockDurationMs: 10 * 60 * 1000 // 10 min bloqueado
      };
    case 'account_creation':
      return {
        maxRequests: 3, // 3 contas por hora
        windowMs: 60 * 60 * 1000,
        blockDurationMs: 60 * 60 * 1000 // 1 hora bloqueado
      };
    case 'game_submit':
      return {
        maxRequests: 20, // 20 tentativas por minuto
        windowMs: 60 * 1000,
        blockDurationMs: 5 * 60 * 1000 // 5 min bloqueado
      };
    default:
      return {};
  }
};
