import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

// Este guard se encarga de proteger las rutas que requieren autenticación,
// se verifica si el usuario está autenticado a través del TokenService.
export const authGuard = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  console.log('AuthGuard - checking authentication status');
  
  if (tokenService.isAuthenticated()) {
    return true;
  }
  
  // Redirigir al login
  console.log('AuthGuard - user not authenticated, redirecting to login');
  return router.parseUrl('/auth/login');
};