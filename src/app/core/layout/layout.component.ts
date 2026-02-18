import { Component, OnInit } from '@angular/core';
import { TopbarComponent } from './components/topbar/topbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import feather from 'feather-icons';
import { credits, currentYear } from '@shared/constants/app.constants';
import { AuthenticationService } from '@core/services/api/auth.service';

@Component({
  selector: 'app-layout',
  imports: [TopbarComponent, SidebarComponent, RouterModule],
  templateUrl: './layout.component.html',
  styles: ``,
})
export class LayoutComponent implements OnInit {
  year = currentYear;
  name = credits.name;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    // Refrescar perfil desde el backend para garantizar permisos actualizados
    if (this.authService.session) {
      this.authService.getProfile().subscribe({
        error: () => { /* Si falla, se usan los permisos del localStorage */ }
      });
    }
  }

  ngAfterViewInit() {
    feather.replace();
  }
}
