import { Component, inject, afterNextRender, NgZone } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  styles: [`
    .page { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; padding: 3rem 1rem; }
    .card { width: 100%; max-width: 28rem; background: #fff; border-radius: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #f1f5f9; padding: 2rem; text-align: center; }
    .logo-circle { width: 4rem; height: 4rem; background: #eef2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
    .logo-circle svg { width: 2rem; height: 2rem; color: #4f46e5; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem; }
    .subtitle { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
    .input-group { margin-bottom: 1rem; text-align: left; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: #334155; margin-bottom: 0.375rem; }
    input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 0.875rem; outline: none; box-sizing: border-box; }
    input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
    .btn { width: 100%; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: background 0.2s; font-size: 0.875rem; margin-top: 0.5rem; }
    .btn-primary { background: #4f46e5; color: #fff; }
    .btn-primary:hover { background: #4338ca; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: #dc2626; font-size: 0.8125rem; margin-top: 0.75rem; padding: 0.5rem; background: #fef2f2; border-radius: 0.375rem; }
    .divider { display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
    .divider-line { flex: 1; height: 1px; background: #e2e8f0; }
    .divider-text { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .g-button-container { display: flex; justify-content: center; min-height: 40px; margin-bottom: 1rem; }
    .link { margin-top: 1rem; font-size: 0.875rem; color: #64748b; }
    .link a { color: #4f46e5; cursor: pointer; font-weight: 500; text-decoration: none; }
    .link a:hover { text-decoration: underline; }
    .gsi-error { font-size: 0.75rem; color: #94a3b8; padding: 0.5rem; }
  `],
  template: `
    <div class="page">
      <div class="card">
        <div class="logo-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        </div>
        <h1>Iniciar sesi&oacute;n</h1>
        <p class="subtitle">Accede a tu cuenta para continuar aprendiendo</p>

        <div id="googleButton" class="g-button-container"></div>
        @if (gsiError) {
          <div class="gsi-error">{{ gsiError }}</div>
        }

        <div class="divider">
          <div class="divider-line"></div>
          <span class="divider-text">O contin&uacute;a con</span>
          <div class="divider-line"></div>
        </div>

        <form (ngSubmit)="handleLogin()">
          <div class="input-group">
            <label for="email">Correo electr&oacute;nico</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="tu@email.com" required />
          </div>
          <div class="input-group">
            <label for="password">Contrase&ntilde;a</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>
          @if (errorMsg) {
            <div class="error">{{ errorMsg }}</div>
          }
          <button type="submit" class="btn btn-primary" [disabled]="loading">Iniciar sesi&oacute;n</button>
        </form>
        <p class="link">¿No tienes cuenta? <a routerLink="/register">Reg&iacute;strate</a></p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private courseSvc = inject(CourseService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  email = 'user@emai.com';
  password = 'user123';
  loading = false;
  errorMsg = '';
  gsiError = '';

  constructor() {
    afterNextRender(() => {
      this.renderGoogleButton();
    });
  }

  private renderGoogleButton(): void {
    const g = (window as any).google;
    if (!g?.accounts?.id) {
      this.gsiError = 'Google Sign-In no disponible. Recarga la página o inicia sesión con email.';
      console.warn('GSI library not loaded. Check network: https://accounts.google.com/gsi/client');
      return;
    }
    g.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      },
      auto_prompt: false,
      ux_mode: 'popup',
    });
    const container = document.getElementById('googleButton');
    if (container) {
      g.accounts.id.renderButton(container, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'signin_with',
        size: 'large',
        width: 328,
      });
    }
  }

  private handleGoogleCredential(idToken: string): void {
    this.loading = true;
    this.errorMsg = '';
    this.auth.googleLogin(idToken).subscribe({
      next: res => {
        this.auth.setAuth(res);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error al iniciar sesi&oacute;n con Google';
      },
    });
  }

  handleLogin(): void {
    this.loading = true;
    this.errorMsg = '';
    this.auth.login(this.email, this.password).subscribe({
      next: res => {
        this.auth.setAuth(res);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error al iniciar sesi&oacute;n';
      },
    });
  }

}
