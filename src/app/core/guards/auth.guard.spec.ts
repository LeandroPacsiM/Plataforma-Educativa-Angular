import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard, publicGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl']);
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });
    localStorage.clear();
  });

  describe('authGuard', () => {
    it('should return true when authenticated', () => {
      const auth = TestBed.inject(AuthService);
      auth.user.set({
        id: '1', name: 'T', email: 't@t.com', initials: 'T', purchasedCourses: [],
      });
      const result = TestBed.runInInjectionContext(authGuard);
      // Should be true (synchronous, authenticated)
      expect(result).toBeTrue();
    });

    it('should redirect to /login when no token and not authenticated', () => {
      routerSpy.parseUrl.and.returnValue('/login' as any);
      const result = TestBed.runInInjectionContext(authGuard);
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/login');
    });
  });

  describe('publicGuard', () => {
    it('should return true when not authenticated', () => {
      const result = TestBed.runInInjectionContext(publicGuard);
      expect(result).toBeTrue();
    });

    it('should redirect to /dashboard when authenticated', () => {
      const auth = TestBed.inject(AuthService);
      auth.user.set({
        id: '1', name: 'T', email: 't@t.com', initials: 'T', purchasedCourses: [],
      });
      routerSpy.parseUrl.and.returnValue('/dashboard' as any);
      const result = TestBed.runInInjectionContext(publicGuard);
      expect(routerSpy.parseUrl).toHaveBeenCalledWith('/dashboard');
    });
  });
});
