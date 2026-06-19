import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BackendAuthResponse, BackendUserInfo, BackendDashboard } from '../models/api.models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUserInfo: BackendUserInfo = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    role: 'USER',
  };

  const mockAuthResponse: BackendAuthResponse = {
    token: 'test-token-123',
    type: 'Bearer',
    expiresIn: 3600,
    user: mockUserInfo,
  };

  const mockDashboard: BackendDashboard = {
    isAuthenticated: true,
    enrolledCourses: [
      {
        course: { id: 1, title: 'Java', description: '...', imageUrl: '', price: 0, lessons: [], quizzes: [] },
        progressPercent: 50,
        completed: false,
      },
    ],
    availableCourses: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should POST to /api/auth/login', () => {
      service.login('a@b.com', 'pass').subscribe(res => {
        expect(res).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'a@b.com', password: 'pass' });
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should POST to /api/auth/register', () => {
      service.register('A', 'a@b.com', 'pass', 'pass').subscribe(res => {
        expect(res).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'A', email: 'a@b.com', password: 'pass', confirmPassword: 'pass' });
      req.flush(mockAuthResponse);
    });
  });

  describe('googleLogin', () => {
    it('should POST to /api/auth/google', () => {
      service.googleLogin('google-id-token').subscribe(res => {
        expect(res).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('/api/auth/google');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ idToken: 'google-id-token' });
      req.flush(mockAuthResponse);
    });
  });

  describe('setAuth', () => {
    it('should save token and set user', () => {
      service.setAuth(mockAuthResponse);
      expect(localStorage.getItem('token')).toBe('test-token-123');
      const user = service.user();
      expect(user).not.toBeNull();
      expect(user!.name).toBe('Test User');
      expect(user!.email).toBe('test@test.com');
      expect(user!.initials).toBe('TU');
    });

    it('should set initials from single name', () => {
      const single = { ...mockAuthResponse, user: { ...mockUserInfo, name: 'Alice' } };
      service.setAuth(single);
      expect(service.user()!.initials).toBe('A');
    });
  });

  describe('setUserFromInfo', () => {
    it('should update user preserving purchasedCourses', () => {
      // Start with a user that has purchased courses
      service.user.set({
        id: '1', name: 'Old', email: 'old@t.com', initials: 'O',
        purchasedCourses: ['c1'],
      });
      service.setUserFromInfo({ id: 1, name: 'New Name', email: 'new@t.com', role: 'USER' });
      expect(service.user()!.name).toBe('New Name');
      expect(service.user()!.purchasedCourses).toEqual(['c1']);
    });

    it('should set empty purchasedCourses when no prior user', () => {
      service.setUserFromInfo(mockUserInfo);
      expect(service.user()!.purchasedCourses).toEqual([]);
    });
  });

  describe('setPurchasedCourses / purchaseCourses', () => {
    it('should set purchasedCourses', () => {
      service.setAuth(mockAuthResponse);
      service.setPurchasedCourses(['c1', 'c2']);
      expect(service.user()!.purchasedCourses).toEqual(['c1', 'c2']);
    });

    it('should not crash when user is null', () => {
      service.setPurchasedCourses(['c1']);
      expect(service.user()).toBeNull();
    });

    it('should merge purchasedCourses', () => {
      service.setAuth(mockAuthResponse);
      service.setPurchasedCourses(['c1']);
      service.purchaseCourses(['c2', 'c3']);
      expect(service.user()!.purchasedCourses).toEqual(['c1', 'c2', 'c3']);
    });

    it('should not duplicate on merge', () => {
      service.setAuth(mockAuthResponse);
      service.setPurchasedCourses(['c1']);
      service.purchaseCourses(['c1', 'c2']);
      expect(service.user()!.purchasedCourses).toEqual(['c1', 'c2']);
    });
  });

  describe('logout', () => {
    it('should remove token and set user null', () => {
      service.setAuth(mockAuthResponse);
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
      expect(service.user()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('should return true when user is set', () => {
      service.setAuth(mockAuthResponse);
      expect(service.isAuthenticated()).toBeTrue();
    });
  });

  describe('restoreSession', () => {
    it('should return false when no token', (done) => {
      service.restoreSession().subscribe(ok => {
        expect(ok).toBeFalse();
        done();
      });
    });

    it('should restore user from /api/auth/me', (done) => {
      localStorage.setItem('token', 'valid-token');
      service.restoreSession().subscribe(ok => {
        expect(ok).toBeTrue();
        expect(service.user()!.name).toBe('Test User');
        done();
      });

      const req = httpMock.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUserInfo);

      // The restoreSession also fires a dashboard fetch
      const dashReq = httpMock.expectOne('/api/dashboard/home');
      dashReq.flush(mockDashboard);
    });

    it('should return false on error and remove token', (done) => {
      localStorage.setItem('token', 'bad-token');
      service.restoreSession().subscribe(ok => {
        expect(ok).toBeFalse();
        expect(localStorage.getItem('token')).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/auth/me');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
});
