import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from '../services/api/auth.service';
import { AuthenticationEffects } from '../store/authentication/authentication.effects';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(public autheffect: AuthenticationEffects) {}

  intercept(
    request: HttpRequest<Request>,
    next: HttpHandler,
  ): Observable<HttpEvent<Event>> {
    const authenticationService = inject(AuthenticationService);

    return next.handle(request).pipe(
      catchError((err) => {
        if (err.status === 401) {
          authenticationService.logout();
        }

        const error =
          err?.error?.message ||
          err?.statusText ||
          'Error de conexión con el servidor';
        return throwError(() => ({
          error: { message: error },
          status: err.status,
        }));
      }),
    );
  }
}
