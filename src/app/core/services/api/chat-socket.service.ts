import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '@/environments/environment';
import { Message } from '@core/interfaces/api/conversation.interface';
import { LoggerService } from '../logger.service';

interface TypingStatus {
  conversationId: number;
  userId: number;
  isTyping: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatSocketService implements OnDestroy {
  private socket: Socket | null = null;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private typingSubject = new BehaviorSubject<TypingStatus | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private currentConversationId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: any = null;
  private storedToken: string | null = null;

  constructor(private logger: LoggerService) {}

  messages$ = this.messagesSubject.asObservable();
  typing$ = this.typingSubject.asObservable();
  isConnected$ = this.connectionStatusSubject.asObservable();

  connect(token: string): void {
    if (this.socket?.connected) {
      this.connectionStatusSubject.next(true);
      return;
    }

    this.storedToken = token; // Guardar para reconexiones
    this.logger.socket('Conectando chat socket...');
    
    if (!token) {
      this.logger.error('CHAT-SOCKET', 'No hay token, no se puede conectar');
      this.connectionStatusSubject.next(false);
      return;
    }

    this.socket = io(`${environment.assetsUrl}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      this.logger.socket('Chat socket CONECTADO ✅');
      this.connectionStatusSubject.next(true);
      this.reconnectAttempts = 0; // Reset contador en conexión exitosa
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    });

    this.socket.on('connected', (data: any) => {
      this.logger.debug('CHAT-SOCKET', 'Datos de conexión recibidos', data);
    });

    this.socket.on('new_message', (message: Message) => {
      // Convertir ambos a número para comparación segura
      const messageConvId = Number(message.conversationId);
      const currentConvId = Number(this.currentConversationId);
      
      if (messageConvId === currentConvId) {
        const current = this.messagesSubject.value;
        this.messagesSubject.next([...current, message]);
      }
    });

    this.socket.on('message_read', ({ messageIds }: { messageIds: number[] }) => {
      const messages = this.messagesSubject.value.map((m) =>
        messageIds.includes(m.id) ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
      );
      this.messagesSubject.next(messages);
    });

    this.socket.on('user_typing', (data: TypingStatus) => {
      this.typingSubject.next(data);
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        if (this.typingSubject.value?.userId === data.userId) {
          this.typingSubject.next(null);
        }
      }, 3000);
    });

    this.socket.on('connect_error', (error: any) => {
      this.logger.error('CHAT-SOCKET', 'Error de conexión', error);
      this.connectionStatusSubject.next(false);
      this.scheduleReconnect();
    });

    this.socket.on('error', (error: any) => {
      this.logger.error('CHAT-SOCKET', 'Error de socket', error);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.logger.warn('CHAT-SOCKET', `Desconectado - Razón: ${reason}`);
      this.connectionStatusSubject.next(false);
      
      // Reconexión automática si el servidor forzó la desconexión
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.scheduleReconnect();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  getConnectionStatus(): boolean {
    return this.connectionStatusSubject.value;
  }

  reconnect(token: string): void {
    this.logger.info('CHAT-SOCKET', '🔄 Reconexión manual solicitada');
    this.disconnect();
    this.reconnectAttempts = 0; // Reset contador en reconexión manual
    setTimeout(() => this.connect(token), 1000);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('CHAT-SOCKET', `❌ Máximo de intentos de reconexión alcanzado (${this.maxReconnectAttempts})`);
      return;
    }

    // Backoff exponencial: 1s, 2s, 4s, 8s, 16s (max 30s)
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.logger.warn('CHAT-SOCKET', `🔄 Reintento ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${delay/1000}s`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.storedToken) {
        this.connect(this.storedToken);
      } else {
        this.logger.error('CHAT-SOCKET', 'No hay token almacenado para reconectar');
      }
    }, delay);
  }

  joinConversation(conversationId: number, userId: number): void {
    if (!this.socket) return;
    
    this.currentConversationId = conversationId;
    this.socket.emit('join_conversation', { conversationId, userId });
  }

  leaveConversation(conversationId: number): void {
    if (!this.socket) return;
    
    this.socket.emit('leave_conversation', { conversationId });
    this.currentConversationId = null;
    this.messagesSubject.next([]);
  }

  sendMessage(conversationId: number, content: string): void {
    if (!this.socket) return;
    
    this.socket.emit('send_message', { conversationId, content });
  }

  emitTyping(conversationId: number, isTyping: boolean): void {
    if (!this.socket) return;
    this.socket.emit('user_typing', { conversationId, isTyping });
  }

  setMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
  }

  ngOnDestroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.disconnect();
  }
}
