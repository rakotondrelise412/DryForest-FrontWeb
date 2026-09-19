import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté
  if (authService.isLoggedIn()) {
    return true; // Autoriser l'accès
  }

  // Si non connecté, rediriger vers la page de login
  // On sauvegarde l'URL demandée pour rediriger après connexion
  router.navigate(['/login'], { 
    queryParams: { 
      returnUrl: state.url 
    } 
  });
  
  return false; // Bloquer l'accès
};