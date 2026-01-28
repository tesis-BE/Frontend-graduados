import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '@shared/services/notification.service';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notifications; track notification.id) {
        <div class="notification" [ngClass]="'notification-' + notification.type">
          <div class="notification-content">
            <span class="notification-icon">
              @switch (notification.type) {
                @case ('success') {
                  <i class="mdi mdi-check-circle"></i>
                }
                @case ('error') {
                  <i class="mdi mdi-alert-circle"></i>
                }
                @case ('warning') {
                  <i class="mdi mdi-alert"></i>
                }
                @case ('info') {
                  <i class="mdi mdi-information"></i>
                }
              }
            </span>
            <span class="notification-message">{{ notification.message }}</span>
          </div>
          <button class="notification-close" (click)="closeNotification(notification.id)">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    }

    .notification {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      font-size: 14px;
      font-weight: 500;
      min-height: 52px;
    }

    .notification-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .notification-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .notification-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .notification-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }

    .notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .notification-icon {
      font-size: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-message {
      word-break: break-word;
      line-height: 1.4;
    }

    .notification-close {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 18px;
      padding: 4px;
      margin-left: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      flex-shrink: 0;
    }

    .notification-close:hover {
      opacity: 0.7;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 576px) {
      .notification-container {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .notification {
        padding: 14px 16px;
        min-height: 48px;
      }

      .notification-message {
        font-size: 13px;
      }
    }
  `,
})
export class NotificationContainerComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}
  notifications: Notification[] = [];

  ngOnInit(): void {
    setInterval(() => {
      this.notifications = this.notificationService.getNotifications();
    }, 100);
  }

  closeNotification(id: string): void {
    this.notificationService.remove(id);
  }
}