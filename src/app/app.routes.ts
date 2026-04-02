import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { NotFound } from './not-found/not-found';
import { Admin } from './features/admin/admin';

export const routes: Routes = [
  // Landing pública (sin autenticación)
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.LANDING_ROUTES)
  },
  
  // Auth (público)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Dashboard (protegido por rol)
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    canActivate: [authGuard]
  },
  
  // Tareas (protegido)
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES),
    canActivate: [authGuard]
  },
  
  // Perfil (protegido)
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profiles.routes').then(m => m.PROFILE_ROUTES),
    canActivate: [authGuard]
  },
  
  // Valoraciones (protegido)
  {
    path: 'ratings',
    loadChildren: () => import('./features/rating/rating.routes').then(m => m.RATINGS_ROUTES),
    canActivate: [authGuard]
  },
  
  // Admin (solo ADMIN)
  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, roleGuard(['ADMIN'])]
  },
  
    // Ruta comodín para 404
  {
    path: '**',
    component: NotFound
  }
];