// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap, of } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

// Interceptor para manejar errores HTTP globalmente, muestra notificaciones y
//  maneja casos específicos como token expirado

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      // Error de red
      if (error.status === 0) {
        errorMessage = 'Error de conexión. Verifica tu internet.';
        notificationService.showError(errorMessage);
        return throwError(() => new Error(errorMessage));
      }

      // Manejo de errores por código HTTP
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud incorrecta';
          notificationService.showError(errorMessage);
          break;
          
        case 401:
          // Token expirado o inválido
          if (tokenService.getRefreshToken() && !req.url.includes('/refresh')) {
            // Intentar refrescar token
            return authService.refreshToken().pipe(
              switchMap(() => {
                // Reintentar la petición original
                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${tokenService.getAccessToken()}`
                  }
                });
                return next(newReq);
              }),
              catchError(refreshError => {
                // Refresh falló, logout
                authService.logout();
                errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
                notificationService.showError(errorMessage);
                return throwError(() => new Error(errorMessage));
              })
            );
          } else {
            authService.logout();
            errorMessage = 'No autorizado. Inicia sesión.';
            notificationService.showError(errorMessage);
          }
          break;
          
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          notificationService.showError(errorMessage);
          break;
          
        case 404:
          errorMessage = 'Recurso no encontrado';
          notificationService.showError(errorMessage);
          break;
          
        case 422:
          // Errores de validación
          if (error.error?.errors) {
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = validationErrors.join(', ');
          } else {
            errorMessage = error.error?.message || 'Error de validación';
          }
          notificationService.showError(errorMessage);
          break;
          
        case 429:
          errorMessage = 'Demasiados intentos. Espera 15 minutos.';
          notificationService.showError(errorMessage);
          break;
          
        case 500:
          errorMessage = 'Error interno del servidor. Intenta más tarde.';
          notificationService.showError(errorMessage);
          break;
          
        default:
          errorMessage = error.error?.message || `Error ${error.status}`;
          notificationService.showError(errorMessage);
      }

      // Log para debugging (solo en desarrollo)
      if (!environment.production) {
        console.error('HTTP Error:', {
          url: req.url,
          status: error.status,
          message: errorMessage,
          error: error.error
        });
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};