import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@core/interfaces/api/conversation.interface';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversations-list.component.html',
  styleUrls: ['./conversations-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsListComponent {
  @Input() conversations: Conversation[] = [];
  @Input() selectedConversationId: number | null = null;
  @Input() currentUserId: number = 0;
  @Output() selectConversation = new EventEmitter<Conversation>();
  @Output() deleteConversation = new EventEmitter<number>();

  onSelectConversation(conversation: Conversation): void {
    this.selectConversation.emit(conversation);
  }

  getOtherUser(conversation: Conversation): any {
    if (this.currentUserId === conversation.graduateId) {
      return conversation.recruiter;
    }
    return conversation.graduate;
  }

  getOtherUserName(conversation: Conversation): string {
    const user = this.getOtherUser(conversation);
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario';
  }

  getOtherUserPhoto(conversation: Conversation): string {
    const user = this.getOtherUser(conversation);
    return user?.photoUrl || 'assets/images/users/default-avatar.png';
  }

  getCompanyName(conversation: Conversation): string | null {
    if (this.currentUserId === conversation.graduateId) {
      return conversation.recruiter?.company?.name || null;
    }
    return null;
  }

  getLastMessagePreview(conversation: Conversation): string {
    if (!conversation.lastMessage) {
      return 'Sin mensajes aún';
    }
    const content = conversation.lastMessage.content;
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }

  formatTime(dateString: Date | string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  onDeleteConversation(event: Event, conversationId: number): void {
    event.stopPropagation();
    this.deleteConversation.emit(conversationId);
  }
}
