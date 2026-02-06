import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '@core/services/api/conversation.service';
import { ChatSocketService } from '@core/services/api/chat-socket.service';
import { AuthenticationService } from '@core/services/api/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Conversation, Message } from '@core/interfaces/api/conversation.interface';
import { ConversationsListComponent } from '../components/conversations-list/conversations-list.component';
import { ChatPanelComponent } from '../components/chat-panel/chat-panel.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, ConversationsListComponent, ChatPanelComponent],
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class ChatPageComponent implements OnInit, OnDestroy {
  conversations = signal<Conversation[]>([]);
  selectedConversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  isLoadingConversations = signal(false);
  isLoadingMessages = signal(false);
  error = signal<string | null>(null);
  currentUserId = signal<number | null>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private conversationService: ConversationService,
    private chatSocket: ChatSocketService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    console.log('💬 Inicializando chat page...');
    
    this.currentUserId.set((this.authService.user?.id as number) ?? null);
    console.log('👤 Usuario actual ID:', this.currentUserId());
    
    this.loadConversations();
    this.connectSocket();
    this.subscribeToMessages();
   
     // Manejar deep-links con query parameter conversationId
     this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
       if (params['conversationId']) {
         const conversationId = Number(params['conversationId']);
         console.log('🔗 Deep link a conversación:', conversationId);
         const conversation = this.conversations().find((c) => c.id === conversationId);
         if (conversation) {
           this.onSelectConversation(conversation);
         } else {
           // Si la conversación no está en la lista, cargar directamente
           this.loadConversationById(conversationId);
         }
       }
     });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatSocket.disconnect();
  }

  private connectSocket(): void {
    const token = this.authService.session;
    console.log('🔌 Conectando chat socket desde chat page...');
    console.log('🔑 Token disponible:', token ? 'Sí' : 'No');
    
    if (token) {
      this.chatSocket.connect(token);
      
      // Verificar estado de conexión
      this.chatSocket.isConnected$.pipe(takeUntil(this.destroy$)).subscribe(status => {
        console.log('🔌 Chat socket status en chat page:', status ? 'CONECTADO ✅' : 'DESCONECTADO ❌');
      });
    } else {
      console.error('❌ No se puede conectar chat socket: token faltante');
    }
  }

  private subscribeToMessages(): void {
    this.chatSocket.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      this.messages.set(messages);
    });
  }

  loadConversations(): void {
    console.log('💬 Cargando conversaciones...');
    this.isLoadingConversations.set(true);
    this.error.set(null);
    
    this.conversationService.getMyConversations().subscribe({
      next: (response) => {
        console.log('✅ Conversaciones recibidas:', response);
        
        if (response && response.data) {
          this.conversations.set(response.data);
          console.log('💬 Total conversaciones cargadas:', response.data.length);
        } else {
          console.log('⚠️ Respuesta sin datos:', response);
          this.conversations.set([]);
        }
        
        this.isLoadingConversations.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando conversaciones:', error);
        this.error.set('Error cargando conversaciones: ' + (error.message || error));
        this.conversations.set([]);
        this.isLoadingConversations.set(false);
      },
    });
  }

  onSelectConversation(conversation: Conversation): void {
    console.log('📝 Seleccionando conversación:', conversation.id);
    this.selectedConversation.set(conversation);
    this.loadMessages(conversation.id);
    
    const userId = this.currentUserId();
    if (userId) {
      console.log('🔗 Uniéndose a sala de conversación:', conversation.id, 'usuario:', userId);
      this.chatSocket.joinConversation(conversation.id, userId);
    } else {
      console.error('❌ No se puede unir a conversación: userId no disponible');
    }
    
    // Marcar como leído
    this.conversationService.markAsRead(conversation.id).subscribe({
      next: () => console.log('✅ Conversación marcada como leída:', conversation.id),
      error: (err) => console.error('❌ Error marcando como leída:', err)
    });
  }

  loadMessages(conversationId: number): void {
    console.log('💬 Cargando mensajes para conversación:', conversationId);
    this.isLoadingMessages.set(true);
    this.error.set(null);
    
    this.conversationService.getMessages(conversationId).subscribe({
      next: (response) => {
        console.log('✅ Mensajes recibidos:', response);
        
        if (response && response.data) {
          this.messages.set(response.data);
          this.chatSocket.setMessages(response.data);
          console.log('💬 Total mensajes cargados:', response.data.length);
        } else {
          console.log('⚠️ Respuesta de mensajes sin datos:', response);
          this.messages.set([]);
        }
        
        this.isLoadingMessages.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando mensajes:', error);
        this.error.set('Error cargando mensajes: ' + (error.message || error));
        this.messages.set([]);
        this.isLoadingMessages.set(false);
      },
    });
  }

  loadConversationById(conversationId: number): void {
    this.isLoadingMessages.set(true);
    this.conversationService.getConversationById(conversationId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.selectedConversation.set(response.data);
          this.conversations.update((convs) => {
            const exists = convs.some((c) => c.id === response.data.id);
            return exists ? convs : [...convs, response.data];
          });
          this.loadMessages(conversationId);
        }
        this.isLoadingMessages.set(false);
      },
      error: (error: any) => {
        console.error('Error cargando conversación:', error);
        this.isLoadingMessages.set(false);
      },
    });
  }

  onSendMessage(content: string): void {
    const conversation = this.selectedConversation();
    if (!conversation) {
      console.error('❌ No se puede enviar mensaje: no hay conversación seleccionada');
      return;
    }

    console.log('📤 Enviando mensaje a conversación:', conversation.id);
    console.log('📝 Contenido:', content);

    this.conversationService
      .sendMessage({ conversationId: conversation.id, content })
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            console.log('✅ Mensaje enviado exitosamente:', response.data);
            console.log('⏳ Esperando recepción por socket...');
            // El mensaje se añadirá vía socket
          }
        },
        error: (error) => {
          console.error('❌ Error enviando mensaje:', error);
        },
      });
  }
}
