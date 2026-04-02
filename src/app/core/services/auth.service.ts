import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  RefreshTokenRequest 
} from '../models/auth.model';
import { User } from '../models/user.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private tokenService = inject(TokenService);
  private apiservice = inject(ApiService);
  
  private currentUserSignal = signal<User | null>(null);
  public readonly currentUser = this.currentUserSignal.asReadonly();
  
  private readonly API_URL = '/usuarios';
  
  constructor() {
    if (this.tokenService.isAuthenticated()) {
      this.loadCurrentUser();
    }
  }
  
  // Sin catchError, el interceptor global maneja los errores
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiservice.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('AUTH RESPONSE (login):', response);
          this.tokenService.setTokens(response.accessToken, response.refreshToken);
          if (response.user) {
            const u = response.user as any;
            const user: User = {
              id: typeof u.id === 'string' ? Number(u.id) : u.id || 0,
              email: u.email ?? '',
              nombre: u.nombre ?? '',
              tipoUsuario: (u.tipoUsuario as any) ?? undefined,
              verificado: !!u.verificado,
              fechaRegistro: u.fechaRegistro ? new Date(u.fechaRegistro) : new Date()
            };
            this.currentUserSignal.set(user);
          } else {
            this.loadCurrentUser();
          }
        })
      );
  }
  
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiservice.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => {
          console.log('AUTH RESPONSE (register):', response);
          this.tokenService.setTokens(response.accessToken, response.refreshToken);
          if (response.user) {
            const u = response.user as any;
            const user: User = {
              id: typeof u.id === 'string' ? Number(u.id) : u.id || 0,
              email: u.email ?? '',
              nombre: u.nombre ?? '',
              tipoUsuario: (u.tipoUsuario as any) ?? undefined,
              verificado: !!u.verificado,
              fechaRegistro: u.fechaRegistro ? new Date(u.fechaRegistro) : new Date()
            };
            this.currentUserSignal.set(user);
          } else {
            this.loadCurrentUser();
          }
        })
      );
  }
  
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No hay refresh token disponible'));
    }
    
    const request: RefreshTokenRequest = { refreshToken };
    return this.apiservice.post<AuthResponse>(`${this.API_URL}/auth/refresh`, request)
      .pipe(
        tap(response => {
          this.tokenService.setTokens(response.accessToken, response.refreshToken);
        })
      );
  }
  
  logout(): void {
    const refreshToken = this.tokenService.getRefreshToken();
    if (refreshToken) {
      // No necesitas catchError aquí, el interceptor ya maneja el error
      this.apiservice.post(`${this.API_URL}/auth/logout`, { refreshToken })
        .subscribe(); // Si falla, el interceptor muestra el error pero el logout continúa
    }
    
    this.tokenService.clearTokens();
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }
  
  private loadCurrentUser(): void {
    const token = this.tokenService.getAccessToken();
    if (token) {
      const decoded = this.tokenService.decodeToken(token);
      if (decoded) {
        const user: User = {
          id: decoded.userId || decoded.sub,
          email: decoded.email || decoded.sub,
          nombre: decoded.nombre || '',
          tipoUsuario: decoded.tipoUsuario,
          verificado: decoded.verificado || false,
          fechaRegistro: new Date()
        };
        this.currentUserSignal.set(user);
      }
    }
  }
  
  getUserProfile(userId: number): Observable<User> {
    return this.apiservice.get<User>(`${this.API_URL}/usuarios/${userId}`)
      .pipe(
        tap(user => this.currentUserSignal.set(user))
      );
  }
  
  updateUserProfile(userId: number, userData: Partial<User>): Observable<User> {
    return this.apiservice.put<User>(`${this.API_URL}/usuarios/${userId}`, userData)
      .pipe(
        tap(user => this.currentUserSignal.set(user))
      );
  }
  
  hasRole(role: string): boolean {
    return this.currentUserSignal()?.tipoUsuario === role;
  }
  
  isFreelancer(): boolean {
    return this.hasRole('FREELANCER');
  }
  
  isEmpresa(): boolean {
    return this.hasRole('EMPRESA');
  }
  
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }
}