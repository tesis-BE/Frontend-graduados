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
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import * as feather from 'feather-icons';
import { SimplebarAngularModule } from 'simplebar-angular';
import { ProfileService } from '@core/services/api/profile.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '@/environments/environment';

@Component({
  selector: 'app-topbar',
  imports: [
    NgbDropdownModule,
    SimplebarAngularModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './topbar.component.html',
  styles: ``,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TopbarComponent implements OnInit, OnDestroy {
  isSidebarVisible = true;
  isFullscreen: boolean = false;
  private config = { theme: 'light' };

  currentUser = signal<any>(null);
  photoUrl = signal<string>('assets/images/users/user-13.jpg');

  private destroy$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    @Inject(DOCUMENT) private document: any,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
    private profileService: ProfileService,
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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
}
