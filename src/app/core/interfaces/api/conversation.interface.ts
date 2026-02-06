export interface Conversation {
  id: number;
  applicationId?: number;
  graduateId: number;
  recruiterId: number;
  lastMessageAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relaciones populadas
  graduate?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
  };
  recruiter?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
    company?: {
      id: number;
      name: string;
    };
  };
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  readAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relación populada
  sender?: {
    id: number;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
}

export interface CreateMessageDto {
  conversationId: number;
  content: string;
  attachmentUrl?: string;
}

export interface CreateConversationDto {
  graduateId: number;
  recruiterId: number;
  applicationId?: number;
}
