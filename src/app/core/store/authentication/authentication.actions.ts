import { createAction, props } from '@ngrx/store';
import { User } from './auth.model';
import { RegisterData } from '@core/services/api/auth.service';

// Login actions
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

// Register actions
export const register = createAction(
  '[Authentication] Register',
  props<{ data: RegisterData }>(),
);
export const registerSuccess = createAction(
  '[Authentication] Register Success',
  props<{ user: User }>(),
);
export const registerFailure = createAction(
  '[Authentication] Register Failure',
  props<{ error: any }>(),
);

// Clear error action
export const clearError = createAction('[Authentication] Clear Error');

// Logout actions
export const logout = createAction('[Authentication] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
