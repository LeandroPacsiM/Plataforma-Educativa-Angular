import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  styles: [`
    .page { flex: 1; background: var(--bg-alt); padding: 1.5rem; display: flex; flex-direction: column; align-items: center; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { width: 100%; max-width: 28rem; }
    .card { background: var(--card); border-radius: 1rem; border: 1px solid var(--border); padding: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: var(--fg); margin-bottom: 0.25rem; }
    .subtitle { font-size: 0.875rem; color: var(--fg-subtle); margin-bottom: 2rem; }
    .user-info { display: flex; align-items: center; gap: 1rem; padding-bottom: 1.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); }
    .avatar { width: 3rem; height: 3rem; border-radius: 50%; background: var(--primary-bg); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1rem; flex-shrink: 0; }
    .ui-name { font-weight: 600; font-size: 1rem; color: var(--fg); }
    .ui-email { font-size: 0.8125rem; color: var(--fg-subtle); }
    .section-title { font-size: 0.875rem; font-weight: 600; color: var(--fg); margin-bottom: 1rem; }
    .input-group { margin-bottom: 1rem; }
    label { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--fg-muted); margin-bottom: 0.375rem; }
    input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; outline: none; background: var(--bg); color: var(--fg); box-sizing: border-box; }
    input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent); }
    .validation-hint { font-size: 0.75rem; color: var(--danger); margin-top: 0.25rem; }
    .btn { width: 100%; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: background 0.2s; font-size: 0.875rem; margin-top: 0.5rem; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .msg { margin-top: 1rem; padding: 0.75rem; border-radius: 0.5rem; font-size: 0.8125rem; text-align: center; }
    .msg-success { background: var(--success-bg); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 20%, transparent); }
    .msg-error { background: var(--danger-bg); color: var(--danger); border: 1px solid color-mix(in srgb, var(--danger) 20%, transparent); }
  `],
  template: `
    <div class="page">
      <div class="container">
        @if (user(); as u) {
          <div class="card">
            <h1>Mi perfil</h1>
            <p class="subtitle">Administra tu cuenta y cambia tu contrase&ntilde;a</p>

            <div class="user-info">
              <div class="avatar">{{ u.initials }}</div>
              <div>
                <div class="ui-name">{{ u.name }}</div>
                <div class="ui-email">{{ u.email }}</div>
              </div>
            </div>

            <div class="section-title">Cambiar contrase&ntilde;a</div>

            <form (ngSubmit)="handleChangePassword()">
              <div class="input-group">
                <label for="oldPassword">Contrase&ntilde;a actual</label>
                <input id="oldPassword" type="password" [(ngModel)]="oldPassword" name="oldPassword" placeholder="••••••••" required />
              </div>
              <div class="input-group">
                <label for="newPassword">Nueva contrase&ntilde;a</label>
                <input id="newPassword" type="password" [(ngModel)]="newPassword" name="newPassword" placeholder="••••••••" required />
              </div>
              <div class="input-group">
                <label for="confirmPassword">Confirmar nueva contrase&ntilde;a</label>
                <input id="confirmPassword" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="••••••••" required />
              </div>

              @if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                <div class="validation-hint">Las contrase&ntilde;as no coinciden</div>
              }

              @if (errorMsg) {
                <div class="msg msg-error">{{ errorMsg }}</div>
              }

              @if (successMsg) {
                <div class="msg msg-success">{{ successMsg }}</div>
              }

              <button type="submit" class="btn btn-primary" [disabled]="loading || (newPassword && confirmPassword && newPassword !== confirmPassword)">
                @if (loading) {
                  <span>Cambiando contrase&ntilde;a...</span>
                } @else {
                  <span>Cambiar contrase&ntilde;a</span>
                }
              </button>
            </form>
          </div>
        } @else {
          <div class="card" style="text-align:center;padding:3rem;color:var(--fg-subtle);">
            Cargando informaci&oacute;n del usuario...
          </div>
        }
      </div>
    </div>
  `
})
export class ProfileComponent {
  private auth = inject(AuthService);

  user = this.auth.user;

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  handleChangePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) return;
    if (this.newPassword !== this.confirmPassword) return;

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMsg = res.message;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error al cambiar la contrase&ntilde;a';
      },
    });
  }
}
