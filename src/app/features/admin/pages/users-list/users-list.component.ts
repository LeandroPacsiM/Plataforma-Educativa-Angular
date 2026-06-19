import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { UserAdminService } from '../../../../core/services/user-admin.service';
import { BackendUserInfo } from '../../../../core/models/api.models';

@Component({
  selector: 'app-admin-users-list',
  imports: [NgClass],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; }
    .page { max-width: 72rem; margin: 0 auto; padding: 1.5rem; width: 100%; box-sizing: border-box; }
    @media (min-width: 768px) { .page { padding: 2rem 2.5rem; } }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .header h2 { font-size: 1.25rem; font-weight: 700; color: var(--fg); margin: 0; }
    .btn-primary { padding: 0.5rem 1rem; border-radius: 0.375rem; background: var(--primary); color: #fff; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: background 0.2s; }
    .btn-primary:hover { background: var(--primary-hover); }
    .table-wrapper { background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-subtle); background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    td { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--fg); border-bottom: 1px solid var(--border-light); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .role-badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .role-admin { background: #fef2f2; color: #dc2626; }
    .role-teacher { background: #eff6ff; color: #2563eb; }
    .role-user { background: #f0fdf4; color: #16a34a; }
    .actions { display: flex; gap: 0.5rem; }
    .btn-icon { padding: 0.375rem 0.625rem; border-radius: 0.375rem; font-size: 0.75rem; font-weight: 500; cursor: pointer; border: none; transition: background 0.2s, color 0.2s; }
    .btn-edit { background: var(--bg-alt); color: var(--fg); }
    .btn-edit:hover { background: var(--overlay); }
    .btn-delete { background: #fef2f2; color: #dc2626; }
    .btn-delete:hover { background: #fee2e2; }
    .loading { display: flex; justify-content: center; align-items: center; padding: 3rem; color: var(--fg-subtle); font-size: 0.875rem; }
    .error { background: #fef2f2; border: 1px solid #fecaca; border-radius: 0.375rem; padding: 0.75rem 1rem; color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
    .empty { text-align: center; padding: 3rem; color: var(--fg-subtle); font-size: 0.875rem; }
  `],
  template: `
    <div class="page">
      <div class="header">
        <h2>Usuarios</h2>
        <button class="btn-primary" (click)="goToNew()">+ Nuevo usuario</button>
      </div>

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }

      <div class="table-wrapper">
        @if (loading()) {
          <div class="loading">Cargando usuarios...</div>
        } @else if (users().length === 0) {
          <div class="empty">No hay usuarios registrados.</div>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (u of users(); track u.id) {
                <tr>
                  <td>{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td>
                    <span class="role-badge" [ngClass]="{
                      'role-admin': u.role === 'ADMIN',
                      'role-teacher': u.role === 'TEACHER',
                      'role-user': u.role === 'USER' || !u.role
                    }">{{ u.role || 'USER' }}</span>
                  </td>
                  <td>
                    <div class="actions">
                      <button class="btn-icon btn-edit" (click)="goToEdit(u.id)">Editar</button>
                      <button class="btn-icon btn-delete" (click)="confirmDelete(u)">Eliminar</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `
})
export class AdminUsersListComponent implements OnInit {
  private userAdminService = inject(UserAdminService);
  private router = inject(Router);

  users = signal<BackendUserInfo[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    this.userAdminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  goToNew(): void {
    this.router.navigate(['/admin/users/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/admin/users', id, 'edit']);
  }

  confirmDelete(u: BackendUserInfo): void {
    const confirmed = confirm(`¿Estás seguro de eliminar a "${u.name}" (${u.email})? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    this.userAdminService.deleteUser(u.id).subscribe({
      next: () => {
        this.users.set(this.users().filter(x => x.id !== u.id));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al eliminar usuario');
      },
    });
  }
}
