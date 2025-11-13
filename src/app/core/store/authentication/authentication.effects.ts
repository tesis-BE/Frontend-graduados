import { inject, Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of } from 'rxjs';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutSuccess,
} from './authentication.actions';
import { AuthenticationService } from '@core/services/api/auth.service';

@Injectable()
export class AuthenticationEffects {
  private actions$ = inject(Actions);

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ email, password }) => {
        return this.authService.login(email, password).pipe(
          map((user) => {
            if (user) {
              const returnUrl =
                this.route.snapshot.queryParams['returnUrl'] || '/';
              this.router.navigateByUrl(returnUrl);
            }
            return loginSuccess({ user });
          }),
          catchError((error) => {
            const errorMessage =
              (error?.error?.error?.message as string) ||
              (error?.error?.message as string) ||
              (error?.message as string) ||
              'Error al iniciar sesión';

            return of(loginFailure({ error: errorMessage }));
          }),
        );
      }),
    ),
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        return of(logoutSuccess());
      }),
    ),
  );
}
