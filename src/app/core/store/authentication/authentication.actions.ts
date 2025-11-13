import { createAction, props } from '@ngrx/store';
import { User } from './auth.model';

export const login = createAction(
  '[Authentication] Login',
  props<{ email: string; password: string }>(),
);
export const loginSuccess = createAction(
  '[Authentication] Login Success',
  props<{ user: User }>(),
);
export const loginFailure = createAction(
  '[Authentication] Login Failure',
  props<{ error: any }>(),
);

export const logout = createAction('[Authentication] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');
