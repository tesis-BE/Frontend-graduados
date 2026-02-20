import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationService } from '@core/services/api/conversation.service';
import { ChatSocketService } from '@core/services/api/chat-socket.service';
import { AuthenticationService } from '@core/services/api/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Conversation, Message } from '@core/interfaces/api/conversation.interface';
import { ConversationsListComponent } from '../components/conversations-list/conversations-list.component';
import { ChatPanelComponent } from '../components/chat-panel/chat-panel.component';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

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
  isMobileView = signal(false);

  private destroy$ = new Subject<void>();

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobileView();
  }

  private checkMobileView(): void {
    this.isMobileView.set(window.innerWidth < 768);
  }

  constructor(
    private conversationService: ConversationService,
    private chatSocket: ChatSocketService,
    private authService: AuthenticationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.checkMobileView();
    
    this.currentUserId.set((this.authService.user?.id as number) ?? null);
    
    this.loadConversations();
    this.connectSocket();
    this.subscribeToMessages();
   
     // Manejar deep-links con query parameter conversationId
     this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
       if (params['conversationId']) {
         const conversationId = Number(params['conversationId']);
         // Esperar a que las conversaciones estén cargadas
         const trySelect = () => {
           const conversation = this.conversations().find((c) => c.id === conversationId);
           if (conversation) {
             this.onSelectConversation(conversation);
           } else if (!this.isLoadingConversations()) {
             // Si la conversación no está en la lista, cargar directamente
             this.loadConversationById(conversationId);
           } else {
             // Reintentar en 500ms si aún está cargando
             setTimeout(trySelect, 500);
           }
         };
         trySelect();
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
    
    if (token) {
      this.chatSocket.connect(token);
      
      this.chatSocket.isConnected$.pipe(takeUntil(this.destroy$)).subscribe(status => {});
    }
  }

  private subscribeToMessages(): void {
    this.chatSocket.messages$.pipe(takeUntil(this.destroy$)).subscribe((messages) => {
      this.messages.set(messages);
    });

    // Escuchar mensajes que llegan a otras conversaciones para actualizar la lista
    this.chatSocket.newMessageOutside$.pipe(takeUntil(this.destroy$)).subscribe((message) => {
      if (message) {
        this.loadConversations();
      }
    });
  }

  loadConversations(): void {
    this.isLoadingConversations.set(true);
    this.error.set(null);
    
    this.conversationService.getMyConversations().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.conversations.set(response.data);
        } else {
          this.conversations.set([]);
        }
        
        this.isLoadingConversations.set(false);
      },
      error: (error) => {
        this.error.set('Error cargando conversaciones');
        this.conversations.set([]);
        this.isLoadingConversations.set(false);
      },
    });
  }

  onSelectConversation(conversation: Conversation): void {
    this.selectedConversation.set(conversation);
    this.loadMessages(conversation.id);
    
    const userId = this.currentUserId();
    if (userId) {
      this.chatSocket.joinConversation(conversation.id, userId);
    }
    
    // Marcar como leído y actualizar contador
    this.conversationService.markAsRead(conversation.id).subscribe({
      next: () => {
        // Actualizar unreadCount localmente
        this.conversations.update(convs => 
          convs.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
        );
      },
      error: (err) => console.error('Error marcando como leída:', err)
    });
  }

  onGoBack(): void {
    this.selectedConversation.set(null);
    this.messages.set([]);
  }

  loadMessages(conversationId: number): void {
    this.isLoadingMessages.set(true);
    this.error.set(null);
    
    this.conversationService.getMessages(conversationId).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.messages.set(response.data);
          this.chatSocket.setMessages(response.data);
        } else {
          this.messages.set([]);
        }
        
        this.isLoadingMessages.set(false);
      },
      error: (error) => {
        this.error.set('Error cargando mensajes');
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
    const userId = this.currentUserId();
    
    if (!conversation || !userId) return;

    // Crear mensaje temporal optimista
    const optimisticMessage: Message = {
      id: Math.random(), // ID temporal (será reemplazado por backend)
      conversationId: conversation.id,
      senderId: userId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Agregar localmente para que se vea inmediatamente
    this.chatSocket.addMessageLocally(optimisticMessage);

    // Enviar por socket (backend emitirá a todos)
    this.chatSocket.sendMessage(conversation.id, content, userId);
  }

  onDeleteConversation(conversationId: number): void {
    Swal.fire({
      title: '¿Eliminar conversación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.conversationService.deleteConversation(conversationId).subscribe({
        next: () => {
          const updatedConversations = this.conversations().filter(
            (c) => c.id !== conversationId
          );
          this.conversations.set(updatedConversations);

          if (this.selectedConversation()?.id === conversationId) {
            this.selectedConversation.set(null);
            this.messages.set([]);
          }

          Swal.fire({
            title: 'Eliminada',
            text: 'La conversación fue eliminada correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la conversación. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
          });
        },
      });
    });
  }
}
