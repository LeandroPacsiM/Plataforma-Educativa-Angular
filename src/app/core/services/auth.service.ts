import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { BackendAuthResponse, BackendUserInfo, BackendDashboard } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  readonly user = signal<User | null>(null);

  login(email: string, password: string) {
    return this.http.post<BackendAuthResponse>('/api/auth/login', { email, password });
  }

  register(name: string, email: string, password: string, confirmPassword: string) {
    return this.http.post<BackendAuthResponse>('/api/auth/register', { name, email, password, confirmPassword });
  }

  fetchMe() {
    return this.http.get<BackendUserInfo>('/api/auth/me');
  }

  googleLogin(idToken: string) {
    return this.http.post<BackendAuthResponse>('/api/auth/google', { idToken });
  }

  setAuth(response: BackendAuthResponse): void {
    localStorage.setItem('token', response.token);
    this.setUserFromInfo(response.user);
  }

  setUserFromInfo(info: BackendUserInfo): void {
    this.user.set({
      id: String(info.id),
      name: info.name,
      email: info.email,
      initials: info.name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2) || info.name[0].toUpperCase(),
      role: info.role,
      purchasedCourses: this.user()?.purchasedCourses ?? [],
    });
  }

  setPurchasedCourses(courseIds: string[]): void {
    const current = this.user();
    if (!current) return;
    this.user.set({ ...current, purchasedCourses: courseIds });
  }

  purchaseCourses(courseIds: string[]): void {
    const current = this.user();
    if (!current) return;
    const merged = [...new Set([...current.purchasedCourses, ...courseIds])];
    this.user.set({ ...current, purchasedCourses: merged });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
    const userId = this.user()?.id;
    if (!userId) return throwError(() => new Error('No autenticado'));
    return this.http.put<{ message: string }>(`/api/users/${userId}/password`, {
      oldPassword,
      newPassword,
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.user.set(null);
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }

  restoreSession(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return of(false);
    return this.fetchMe().pipe(
      map(info => {
        this.setUserFromInfo(info);
        // Populate purchasedCourses so UX is correct even on page refresh
        this.http.get<BackendDashboard>('/api/dashboard/home').subscribe({
          next: dash => {
            const ids = dash.enrolledCourses.map(e => String(e.course.id));
            if (ids.length) this.setPurchasedCourses(ids);
          },
        });
        return true;
      }),
      catchError(() => {
        localStorage.removeItem('token');
        return of(false);
      }),
    );
  }
}
