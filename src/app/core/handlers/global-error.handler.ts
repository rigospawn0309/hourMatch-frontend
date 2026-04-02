// src/app/core/handlers/global-error.handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { environment } from '../../../environments/environment';

// Manejador global de errores para capturar errores 
// no manejados en la aplicación (Errores no HTTP o errores en componentes)
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private notificationService = inject(NotificationService);

  handleError(error: any): void {
    // Log del error
    console.error('Error no capturado:', error);

    // Mensaje amigable para el usuario
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // No mostrar errores de desarrollo en producción
    if (!environment.production) {
      this.notificationService.showError(`${errorMessage} (Ver consola)`);
    } else {
      this.notificationService.showError('Ha ocurrido un error. Por favor, recarga la página.');
    }

    // Aquí podrías enviar el error a un servicio de tracking (Sentry, etc.)
    // this.errorTrackingService.captureException(error);
  }
}