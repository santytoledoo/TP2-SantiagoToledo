import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const raw = localStorage.getItem('usuario');
  const token = localStorage.getItem('token');

  if (!raw || !token) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(raw);
    if (user?.rol === 'administrador') {
      return true;
    }
  } catch {}

  router.navigate(['/publicaciones']);
  return false;
};