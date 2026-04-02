import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// GUARD DE ENRUTAMIENTO: actúa solo cuando el usuario navega a '/dashboard' (sin sub-ruta).
// Su único trabajo es decidir A QUÉ dashboard mandar al usuario según su rol.
// Si la URL ya incluye una sub-ruta concreta (/dashboard/freelancer, /dashboard/empresa),
// deja pasar sin intervenir — la protección de esas rutas la hace roleGuard.
export const dashboardRedirectGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si ya navegamos a una sub-ruta concreta, dejamos pasar
  if (state.url !== '/dashboard' && state.url !== '/dashboard/') {
    return true;
  }

  if (auth.isFreelancer()) {
    return router.parseUrl('/dashboard/freelancer');
  }

  if (auth.isEmpresa()) {
    return router.parseUrl('/dashboard/empresa');
  }

  return router.parseUrl('/dashboard/freelancer');
};