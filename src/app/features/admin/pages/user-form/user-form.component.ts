import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { UserAdminService, CreateUserRequest, UpdateUserRequest } from '../../../../core/services/user-admin.service';

@Component({
  selector: 'app-admin-user-form',
  imports: [FormsModule, NgClass],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; }
    .page { max-width: 48rem; margin: 0 auto; padding: 1.5rem; width: 100%; box-sizing: border-box; }
    @media (min-width: 768px) { .page { padding: 2rem 2.5rem; } }
    .page h2 { font-size: 1.25rem; font-weight: 700; color: var(--fg); margin: 0 0 1.5rem; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1.5rem; }
    .field { margin-bottom: 1.25rem; }
    .field:last-child { margin-bottom: 0; }
    label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--fg); margin-bottom: 0.375rem; }
    input, select { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem; border: 1px solid var(--border); background: var(--bg); color: var(--fg); font-size: 0.875rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    input:focus, select:focus { border-color: var(--primary); }
    input.error-border, select.error-border { border-color: #dc2626; }
    .error-msg { font-size: 0.75rem; color: #dc2626; margin-top: 0.25rem; }
    .form-error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; padding: 0.75rem 1rem; color: #dc2626; font-size: 0.875rem; margin-bottom: 1.25rem; }
    .actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-primary { padding: 0.5rem 1.25rem; border-radius: 0.375rem; background: var(--primary); color: #fff; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: background 0.2s; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 0.5rem 1.25rem; border-radius: 0.375rem; background: var(--bg-alt); color: var(--fg); font-weight: 500; font-size: 0.875rem; cursor: pointer; border: 1px solid var(--border); transition: background 0.2s; }
    .btn-secondary:hover { background: var(--overlay); }
    .loading { display: flex; justify-content: center; align-items: center; padding: 3rem; color: var(--fg-subtle); font-size: 0.875rem; }
    .required { color: #dc2626; margin-left: 0.125rem; }
  `],
  template: `
    <div class="page">
      <h2>{{ isEditing() ? 'Editar usuario' : 'Nuevo usuario' }}</h2>

      @if (isEditing() && loadingUser()) {
        <div class="loading">Cargando datos del usuario...</div>
      } @else {
        <div class="card">
          @if (error()) {
            <div class="form-error">{{ error() }}</div>
          }

          <div class="field">
            <label for="name">Nombre<span class="required">*</span></label>
            <input id="name" type="text" [(ngModel)]="formData.name" placeholder="Nombre completo" [ngClass]="{'error-border': touched() && !formData.name}" />
            @if (touched() && !formData.name) {
              <div class="error-msg">El nombre es obligatorio</div>
            }
          </div>

          <div class="field">
            <label for="email">Email<span class="required">*</span></label>
            <input id="email" type="email" [(ngModel)]="formData.email" placeholder="correo@ejemplo.com" [ngClass]="{'error-border': touched() && !formData.email}" />
            @if (touched() && !formData.email) {
              <div class="error-msg">El email es obligatorio</div>
            }
          </div>

          @if (!isEditing()) {
            <div class="field">
              <label for="password">Contrase&ntilde;a<span class="required">*</span></label>
              <input id="password" type="password" [(ngModel)]="formData.password" placeholder="M&iacute;nimo 6 caracteres" [ngClass]="{'error-border': touched() && !formData.password}" />
              @if (touched() && !formData.password) {
                <div class="error-msg">La contrase&ntilde;a es obligatoria</div>
              }
            </div>
          }

          <div class="field">
            <label for="role">Rol<span class="required">*</span></label>
            <select id="role" [(ngModel)]="formData.role">
              <option value="USER">Usuario</option>
              <option value="TEACHER">Docente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div class="actions">
            <button class="btn-primary" (click)="onSubmit()" [disabled]="saving()">
              {{ saving() ? 'Guardando...' : (isEditing() ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
            <button class="btn-secondary" (click)="goBack()">Cancelar</button>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminUserFormComponent implements OnInit {
  @Input() userId?: string;
  private userAdminService = inject(UserAdminService);
  private router = inject(Router);

  isEditing = signal(false);
  loadingUser = signal(false);
  saving = signal(false);
  touched = signal(false);
  error = signal('');

  formData = {
    name: '',
    email: '',
    password: '',
    role: 'USER',
  };

  ngOnInit(): void {
    if (this.userId) {
      this.isEditing.set(true);
      this.loadUser();
    }
  }

  private loadUser(): void {
    const id = parseInt(this.userId!, 10);
    if (isNaN(id)) {
      this.error.set('ID de usuario inválido');
      return;
    }
    this.loadingUser.set(true);
    this.userAdminService.getUser(id).subscribe({
      next: (user) => {
        this.formData.name = user.name;
        this.formData.email = user.email;
        this.formData.role = user.role || 'USER';
        this.loadingUser.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar datos del usuario');
        this.loadingUser.set(false);
      },
    });
  }

  onSubmit(): void {
    this.touched.set(true);
    this.error.set('');

    if (this.isEditing()) {
      if (!this.formData.name || !this.formData.email) return;
    } else {
      if (!this.formData.name || !this.formData.email || !this.formData.password) return;
    }

    this.saving.set(true);

    if (this.isEditing()) {
      const id = parseInt(this.userId!, 10);
      const data: UpdateUserRequest = {
        name: this.formData.name,
        email: this.formData.email,
        role: this.formData.role,
      };
      this.userAdminService.updateUser(id, data).subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar usuario');
          this.saving.set(false);
        },
      });
    } else {
      const data: CreateUserRequest = {
        name: this.formData.name,
        email: this.formData.email,
        password: this.formData.password,
        role: this.formData.role,
      };
      this.userAdminService.createUser(data).subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear usuario');
          this.saving.set(false);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
