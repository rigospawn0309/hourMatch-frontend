import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// GUARD DE PROTECCIÓN: actúa en cada ruta hija concreta (ej: /dashboard/freelancer).
// Su trabajo es asegurarse de que el usuario tiene el rol requerido para esa ruta.
// Si no lo tiene, lo manda a la sección que le corresponde según su propio rol.
// Complementa a dashboardRedirectGuard: uno enruta, otro protege.
export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userRole = authService.currentUser()?.tipoUsuario;
    console.log('RoleGuard - userRole:', userRole, 'allowedRoles:', allowedRoles);

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }
    
    // Redirigir según el rol
    if (userRole === 'FREELANCER') {
      return router.parseUrl('/tasks');
    } else if (userRole === 'EMPRESA') {
      return router.parseUrl('/tasks/my');
    } else {
      return router.parseUrl('/');
    }
  };
};