import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  if (user && user.role === 'ADMIN') return true;
  return router.parseUrl('/dashboard');
};
