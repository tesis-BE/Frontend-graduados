import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { selectAuthUser } from '@core/store/authentication/authentication.selector';
import { User } from '@core/store/authentication/auth.model';

export const adminGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    take(1),
    map((user: User | null) => {
      if (user && user.userType === 'admin') {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    }),
  );
};

export const recruiterGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    take(1),
    map((user: User | null) => {
      if (
        user &&
        (user.userType === 'recruiter' || user.userType === 'admin')
      ) {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    }),
  );
};

export const graduateGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    take(1),
    map((user: User | null) => {
      if (user && (user.userType === 'graduate' || user.userType === 'admin')) {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    }),
  );
};
