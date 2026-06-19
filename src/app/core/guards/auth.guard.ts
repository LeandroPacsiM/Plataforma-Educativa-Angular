import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  if (!localStorage.getItem('token')) return router.parseUrl('/login');
  return auth.restoreSession().pipe(
    map(ok => ok ? true : router.parseUrl('/login'))
  );
};

export const publicGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return router.parseUrl('/dashboard');
  return true;
};
