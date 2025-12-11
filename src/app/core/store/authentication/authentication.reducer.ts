import { createReducer, on } from '@ngrx/store';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  register,
  registerSuccess,
  registerFailure,
  clearError,
} from './authentication.actions';
import type { User } from './auth.model';

export type AuthenticationState = {
  isLoggedIn: boolean;
  user: User | null;
  error: any | null;
  loading: boolean;
};

const initialState: AuthenticationState = {
  isLoggedIn: false,
  user: null,
  error: null,
  loading: false,
};

export const authenticationReducer = createReducer(
  initialState,
  // Login
  on(login, (state) => ({ ...state, loading: true, error: null })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user,
    error: null,
    loading: false,
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Register
  on(register, (state) => ({ ...state, loading: true, error: null })),
  on(registerSuccess, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user,
    error: null,
    loading: false,
  })),
  on(registerFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  // Clear error
  on(clearError, (state) => ({ ...state, error: null })),

  // Logout
  on(logout, (state) => ({
    ...state,
    isLoggedIn: false,
    user: null,
    error: null,
    loading: false,
  })),
);
