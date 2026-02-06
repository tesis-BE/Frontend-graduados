import { ThemeService } from '@core/services/ui/theme.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  Renderer2,
  RendererFactory2,
  signal,
  OnDestroy,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import * as feather from 'feather-icons';
import { SimplebarAngularModule } from 'simplebar-angular';
import { ProfileService } from '@core/services/api/profile.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@/environments/environment';
import { SocketService } from '@core/services/api/socket.service';
import { NotificationApiService } from '@core/services/api/notification.service';
import { UserNotification } from '@core/interfaces/api/notification.interface';

@Component({
  selector: 'app-topbar',
  imports: [
    NgbDropdownModule,
    SimplebarAngularModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './topbar.component.html',
  styles: `
    .noti-scroll {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .notify-item:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    .notify-item.active {
      background-color: rgba(var(--bs-primary-rgb), 0.1);
    }
    
    .notify-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(var(--bs-primary-rgb), 0.1);
      border-radius: 50%;
    }
    
    .connection-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopbarComponent implements OnInit, OnDestroy {
  isSidebarVisible = true;
  isFullscreen: boolean = false;
  private config = { theme: 'light' };

  currentUser = signal<any>(null);
  photoUrl = signal<string>('assets/images/users/user-13.jpg');
  notifications = signal<UserNotification[]>([]);
  unreadCount = signal<number>(0);
  isSocketConnected = signal<boolean>(false);

  private destroy$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: any,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
    private profileService: ProfileService,
    private socketService: SocketService,
    private notificationApiService: NotificationApiService,
    private router: Router,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  elem: any;

  ngOnInit() {
    this.elem = document.documentElement;
    this.updateOnWindowResize();
    this.themeService.initTheme();
    feather.replace();

    // Cargar datos del usuario
    this.loadUserProfile();

    // Conectar socket y cargar notificaciones
    console.log('🔌 Conectando socket desde topbar...');
    this.socketService.connect();
    this.loadNotifications();

    // Verificar estado de conexión
    this.socketService.isConnected$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        console.log(
          '🔌 Socket status en topbar:',
          status ? 'CONECTADO ✅' : 'DESCONECTADO ❌',
        );
        this.isSocketConnected.set(status);
      });

    // Suscribirse a notificaciones en tiempo real
    this.socketService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications) => {
        console.log(
          '🔔 Notificaciones recibidas en topbar:',
          notifications.length,
        );
        this.notifications.set(notifications);
      });

    this.socketService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        console.log('🔔 Contador no leídas:', count);
        this.unreadCount.set(count);
      });
  }

  ngOnDestroy() {
    this.socketService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.notificationApiService
      .getMyNotifications({ page: 1, pageSize: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.socketService.setNotifications(response.data);
          this.socketService.setUnreadCount(response.unreadCount || 0);
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        },
      });
  }

  loadUserProfile(): void {
    this.profileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          console.log('Profile loaded:', profile);
          console.log('Photo URL from backend:', profile.photoUrl);

          this.currentUser.set(profile);

          // Actualizar foto de perfil usando la URL correcta (sin /api/v1)
          if (profile.photoUrl) {
            const photoUrl = profile.photoUrl.startsWith('http')
              ? profile.photoUrl
              : `${environment.assetsUrl}${profile.photoUrl}`;
            console.log('Final photo URL:', photoUrl);
            this.photoUrl.set(photoUrl);
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        },
      });
  }

  onNotificationClick(notification: UserNotification): void {

    if (!notification.isRead) {
      this.notificationApiService
        .markAsRead(notification.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.socketService.markAsRead(notification.id);
          },
          error: (error) => {
            console.error('Error marking notification as read:', error);
          },
        });
    }

    // Navegar según el tipo de notificación
    this.navigateToNotification(notification);
  }

  private navigateToNotification(notification: UserNotification): void {
    const { eventType, relatedId } = notification;


    try {
      switch (eventType) {
        case 'new_message':
          if (relatedId) {
            this.router.navigate(['/messages'], {
              queryParams: { conversationId: relatedId },
            });
          } else {
            this.router.navigate(['/messages']);
          }
          break;

        case 'application_submitted':
          if (relatedId) {
            this.router.navigate(['/applications', relatedId]);
          } else {
            this.router.navigate(['/applications']);
          }
          break;

        case 'application_reviewed':
          if (relatedId) {
            this.router.navigate(['/applications', relatedId]);
          } else {
            this.router.navigate(['/applications']);
          }
          break;

        case 'interview_scheduled':
          if (relatedId) {
            this.router.navigate(['/interviews', relatedId]);
          } else {
            this.router.navigate(['/interviews']);
          }
          break;

        case 'job_posted':
          if (relatedId) {
            this.router.navigate(['/jobs', relatedId]);
          } else {
            this.router.navigate(['/jobs']);
          }
          break;

        case 'profile_updated':
          this.router.navigate(['/profile']);
          break;

        default:
          console.log('😐 Tipo de notificación no reconocido:', eventType);
          break;
      }
    } catch (error) {
      console.error('❌ Error navegando desde notificación:', error);
    }
  }

  onClearAllNotifications(): void {
    this.notificationApiService
      .markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.socketService.markAllAsRead();
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
        },
      });
  }

  onDeleteNotification(event: Event, notificationId: number): void {
    event.stopPropagation();
    
    this.notificationApiService
      .deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Actualizar la lista de notificaciones
          const updatedNotifications = this.notifications().filter(
            (n) => n.id !== notificationId
          );
          this.socketService.setNotifications(updatedNotifications);
          
          // Actualizar contador si era no leída
          const deletedNotif = this.notifications().find((n) => n.id === notificationId);
          if (deletedNotif && !deletedNotif.isRead) {
            const newCount = Math.max(0, this.unreadCount() - 1);
            this.socketService.setUnreadCount(newCount);
          }
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        },
      });
  }

  getNotificationIcon(notification: UserNotification): string {
    switch (notification.eventType) {
      case 'application_submitted':
        return 'file-text';
      case 'application_reviewed':
        return 'check-circle';
      case 'interview_scheduled':
        return 'calendar';
      case 'new_message':
        return 'message-square';
      case 'job_posted':
        return 'briefcase';
      default:
        return 'bell';
    }
  }

  getNotificationTime(notification: UserNotification): string {
    const now = new Date();
    const created = new Date(notification.createdAt);
    const diff = now.getTime() - created.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  get theme(): string {
    return this.themeService.getTheme();
  }

  changeTheme(): void {
    this.themeService.changeTheme();
    setTimeout(() => {
      feather.replace();
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) {
        themeIcon.setAttribute(
          'data-feather',
          this.theme === 'light' ? 'sun' : 'moon',
        );
        feather.replace();
      }
    }, 100);
  }

  onToggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.updateBodyAttribute();
  }

  updateBodyAttribute() {
    const body = this.el.nativeElement.ownerDocument.body;
    if (this.isSidebarVisible) {
      this.renderer.setAttribute(body, 'data-sidebar', 'default');
    } else {
      this.renderer.setAttribute(body, 'data-sidebar', 'hidden');
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateOnWindowResize();
  }

  updateOnWindowResize() {
    const body = document.body;
    if (window.innerWidth < 1040) {
      this.renderer.setAttribute(body, 'data-sidebar', 'hidden');
    } else {
      this.renderer.setAttribute(body, 'data-sidebar', 'default');
    }
  }
  openFullscreen() {
    const elem: any = document.documentElement;
    console.log(this.isFullscreen);
    if (!this.isFullscreen) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      this.isFullscreen = false;
    }

    setTimeout(() => {
      feather.replace();
      const fullscreenIcon = document.getElementById('fullscreen-icon');
      if (fullscreenIcon) {
        fullscreenIcon.setAttribute(
          'data-feather',
          this.isFullscreen ? 'minimize' : 'maximize',
        );
        feather.replace();
      }
    });
  }

  reconnectSocket(): void {
    console.log('🔄 Reintentando conexión socket desde topbar...');
    this.socketService.reconnect();
  }

  onViewAllNotifications(): void {
    // Por ahora, cargar más notificaciones o simplemente cerrar el dropdown
    // TODO: Crear página de notificaciones cuando esté disponible
    this.notificationApiService
      .getMyNotifications({ page: 1, pageSize: 50 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.socketService.setNotifications(response.data);
          this.socketService.setUnreadCount(response.unreadCount || 0);
        },
        error: (error) => {
          console.error('Error loading all notifications:', error);
        },
      });
  }
}
