import { Injectable } from '@angular/core';
import { environment } from '@/environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDevelopment = !environment.production;
  private currentLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;

  /**
   * Log de depuración - Solo en desarrollo
   */
  debug(context: string, message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.DEBUG && this.isDevelopment) {
      console.log(`🔍 [${context}] ${message}`, ...args);
    }
  }

  /**
   * Log informativo - Siempre se muestra
   */
  info(context: string, message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.INFO) {
      console.log(`ℹ️ [${context}] ${message}`, ...args);
    }
  }

  /**
   * Log de advertencia - Siempre se muestra
   */
  warn(context: string, message: string, ...args: any[]): void {
    if (this.currentLogLevel <= LogLevel.WARN) {
      console.warn(`⚠️ [${context}] ${message}`, ...args);
    }
  }

  /**
   * Log de error - Siempre se muestra
   */
  error(context: string, message: string, error?: any): void {
    if (this.currentLogLevel <= LogLevel.ERROR) {
      console.error(`❌ [${context}] ${message}`, error);
    }
  }

  /**
   * Log de socket - Solo en desarrollo
   */
  socket(event: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`🔌 [SOCKET] ${event}`, data || '');
    }
  }

  /**
   * Log de API - Solo en desarrollo
   */
  api(method: string, url: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`📡 [API] ${method} ${url}`, data || '');
    }
  }

  /**
   * Agrupar logs relacionados
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }
}
