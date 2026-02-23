import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { TitleService } from '@core/services/ui/title.service';
import { NotificationContainerComponent } from '@shared/components/notification-container.component';
import { AuthenticationService } from '@core/services/api/auth.service';
import { loginSuccess } from '@core/store/authentication/authentication.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'hando-angular';
  private titleService = inject(TitleService);
  private store = inject(Store);
  private authService = inject(AuthenticationService);

  ngOnInit(): void {
    this.titleService.init();

    // Hidratar el store NgRx desde localStorage al iniciar la app.
    // AuthenticationService ya cargó el usuario en su constructor,
    // pero el store empieza con user: null. Aquí lo sincronizamos.
    const savedUser = this.authService.currentUser;
    if (savedUser) {
      this.store.dispatch(loginSuccess({ user: savedUser }));
    }
  }
}
