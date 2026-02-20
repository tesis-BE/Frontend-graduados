import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Conversation, Message } from '@core/interfaces/api/conversation.interface';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-panel.component.html',
  styleUrls: ['./chat-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanelComponent implements OnChanges, AfterViewChecked {
  @Input() conversation!: Conversation;
  @Input() messages: Message[] = [];
  @Input() currentUserId: number = 0;
  @Input() isLoading: boolean = false;
  @Input() showBackButton: boolean = false;
  @Output() sendMessage = new EventEmitter<string>();
  @Output() goBack = new EventEmitter<void>();

  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  messageContent = '';
  private shouldScrollToBottom = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['messages'] && !changes['messages'].firstChange) {
      this.shouldScrollToBottom = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  getOtherUser(): any {
    if (this.currentUserId === this.conversation.graduateId) {
      return this.conversation.recruiter;
    }
    return this.conversation.graduate;
  }

  getOtherUserName(): string {
    const user = this.getOtherUser();
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario';
  }

  getOtherUserPhoto(): string {
    const user = this.getOtherUser();
    if (!user?.photoUrl) return 'assets/images/users/sin-foto-perfil.jpg';
    return user.photoUrl.startsWith('http')
      ? user.photoUrl
      : `${environment.assetsUrl}${user.photoUrl}`;
  }

  isSentByCurrentUser(message: Message): boolean {
    return message.senderId === this.currentUserId;
  }

  onGoBack(): void {
    this.goBack.emit();
  }

  onSendMessage(): void {
    const content = this.messageContent.trim();
    if (!content) return;

    this.sendMessage.emit(content);
    this.messageContent = '';
    this.shouldScrollToBottom = true;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  formatTime(dateString: Date | string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(dateString: Date | string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;
    
    const currentDate = new Date(this.messages[index].createdAt);
    const previousDate = new Date(this.messages[index - 1].createdAt);
    
    return currentDate.toDateString() !== previousDate.toDateString();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
