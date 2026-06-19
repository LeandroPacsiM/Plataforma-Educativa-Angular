import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  styles: [`
    .page { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; padding: 3rem 1rem; }
    .card { width: 100%; max-width: 28rem; background: #fff; border-radius: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #f1f5f9; padding: 2rem; text-align: center; }
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
    .link { margin-top: 1rem; font-size: 0.875rem; color: #64748b; }
    .link a { color: #4f46e5; cursor: pointer; font-weight: 500; text-decoration: none; }
    .link a:hover { text-decoration: underline; }
  `],
  template: `
    <div class="page">
      <div class="card">
        <h1>Crear cuenta</h1>
        <p class="subtitle">Reg&iacute;strate para empezar a aprender</p>
        <form (ngSubmit)="handleRegister()">
          <div class="input-group">
            <label for="name">Nombre</label>
            <input id="name" type="text" [(ngModel)]="name" name="name" placeholder="Tu nombre" required />
          </div>
          <div class="input-group">
            <label for="email">Correo electr&oacute;nico</label>
            <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="tu@email.com" required />
          </div>
          <div class="input-group">
            <label for="password">Contrase&ntilde;a</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>
          <div class="input-group">
            <label for="confirmPassword">Confirmar contrase&ntilde;a</label>
            <input id="confirmPassword" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" required />
          </div>
          @if (errorMsg) {
            <div class="error">{{ errorMsg }}</div>
          }
          <button type="submit" class="btn btn-primary" [disabled]="loading">Crear cuenta</button>
        </form>
        <p class="link">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesi&oacute;n</a></p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMsg = '';

  handleRegister(): void {
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contrase\u00f1as no coinciden';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.auth.register(this.name, this.email, this.password, this.confirmPassword).subscribe({
      next: res => {
        this.auth.setAuth(res);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error al registrarse';
      },
    });
  }
}
