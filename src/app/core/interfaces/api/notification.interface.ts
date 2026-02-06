export interface UserNotification {
  id: number;
  userId: number;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  eventType?: string;
  relatedId?: number;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}
