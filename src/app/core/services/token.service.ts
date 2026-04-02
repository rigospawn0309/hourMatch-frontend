import { Injectable, signal, effect, computed } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Aqui tenemos las claves para localStorage, 
  // que se pueden configurar en environment.ts
  private readonly TOKEN_KEY = environment.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.refreshTokenKey;
  
  // Signal para el estado del token, se inicializa con null 
  // para que no haya token al inicio
  private accessTokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  
  // Exponemos signals como solo lectura. `isAuthenticated` se deriva
  // automáticamente del `accessTokenSignal` usando `computed`.
  public readonly accessToken = this.accessTokenSignal.asReadonly();
  public readonly refreshToken = this.refreshTokenSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.accessTokenSignal());
  
  constructor() {
    // Cargar tokens del localStorage al iniciar
    this.loadTokensFromStorage();
    
    // Efecto para sincronizar con localStorage cuando cambien los tokens.
    // NO escribir en `isAuthenticated` desde aquí para evitar NG0600;
    // `isAuthenticated` es un `computed` derivado del token.
    effect(() => {
      const token = this.accessTokenSignal();
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      } else {
        localStorage.removeItem(this.TOKEN_KEY);
      }
    });
    // Efecto para el refresh token, similar al access token pero sin afectar la autenticación
    effect(() => {
      const refreshToken = this.refreshTokenSignal();
      if (refreshToken) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      } else {
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      }
    });
  }
  // Método privado para cargar tokens desde localStorage al iniciar la aplicación, 
  // se llama en el constructor para inicializar los signals con los valores almacenados
  private loadTokensFromStorage(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (token) {
      this.accessTokenSignal.set(token);
    }
    if (refreshToken) {
      this.refreshTokenSignal.set(refreshToken);
    }
  }
  
  // Método para establecer tokens, se actualizan los signals y se sincroniza con localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
  }
  
  // Métodos para obtener los tokens, se devuelven los valores actuales de los signals
  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }
  
  // Método para obtener el refresh token, similar al access token
  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }
  
  // Método para limpiar tokens, se establecen los signals a null y se sincroniza con localStorage
  clearTokens(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
  }
  
  // Decodificar JWT para obtener información del payload, 
  // se usa atob para decodificar la parte del payload del token
  decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
  
  // Obtener la fecha de expiración del token, se decodifica el token 
  // y se convierte el tiempo de expiración a un objeto Date
  getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  }
  
  // Verificar si el token ha expirado, se obtiene la fecha de expiración 
  // y se compara con la fecha actual
  isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }
}