
import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'rate_limit_exceeded'
  | 'invalid_nickname'
  | 'suspicious_behavior'
  | 'validation_failed'
  | 'account_creation_blocked'
  | 'webhook_spam'
  | 'data_tampering'
  | 'bot_detected';

export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  data?: any;
  timestamp: string;
}

class SecurityLogger {
  private eventQueue: SecurityEvent[] = [];
  private sending = false;

  async logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.eventQueue.push(fullEvent);

    // Enviar imediatamente eventos críticos
    if (event.severity === 'critical') {
      await this.sendEvents();
    } else {
      // Para outros eventos, enviar em batch a cada 30 segundos
      setTimeout(() => this.sendEvents(), 30000);
    }
  }

  private async sendEvents() {
    if (this.sending || this.eventQueue.length === 0) return;
    
    this.sending = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await supabase.functions.invoke('security-logger', {
        body: { events: eventsToSend }
      });
    } catch (error) {
      // Se falhar, volta os eventos para a fila
      this.eventQueue.unshift(...eventsToSend);
    } finally {
      this.sending = false;
    }
  }

  // Métodos de conveniência
  async logRateLimit(ip: string, userId?: string, action?: string) {
    await this.logEvent({
      type: 'rate_limit_exceeded',
      severity: 'medium',
      message: `Rate limit excedido para ação: ${action || 'unknown'}`,
      ip,
      userId,
      data: { action }
    });
  }

  async logInvalidNickname(nickname: string, reason: string, userId?: string, ip?: string) {
    await this.logEvent({
      type: 'invalid_nickname',
      severity: 'high',
      message: `Nickname inválido: ${reason}`,
      userId,
      ip,
      data: { nickname, reason }
    });
  }

  async logSuspiciousBehavior(message: string, userId?: string, ip?: string, data?: any) {
    await this.logEvent({
      type: 'suspicious_behavior',
      severity: 'high',
      message,
      userId,
      ip,
      data
    });
  }

  async logValidationFailure(type: string, reason: string, data?: any) {
    await this.logEvent({
      type: 'validation_failed',
      severity: 'medium',
      message: `Validação falhou (${type}): ${reason}`,
      data
    });
  }
}

export const securityLogger = new SecurityLogger();
