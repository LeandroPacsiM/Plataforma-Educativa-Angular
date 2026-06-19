import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/services/auth.service';
import { BackendCourse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-teacher-courses-list',
  styles: [`
    .page { flex: 1; padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 72rem; margin: 0 auto; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
    .top-bar h2 { font-size: 1.5rem; font-weight: 700; color: var(--fg); }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border: none; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-danger:hover { filter: brightness(0.9); }
    .btn-outline { background: transparent; color: var(--fg); border: 1px solid var(--border); }
    .btn-outline:hover { background: var(--overlay); }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; border-radius: 0.375rem; }
    .loading { text-align: center; padding: 3rem; color: var(--fg-subtle); }
    .error-msg { padding: 1rem; background: var(--danger-bg); color: var(--danger); border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--fg-subtle); background: var(--card); border-radius: 0.75rem; border: 2px dashed var(--border); }
    .empty-state h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--fg-muted); }
    .table-wrap { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 0.75rem 1rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-subtle); background: var(--bg-alt); border-bottom: 1px solid var(--border); }
    td { padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--fg); border-bottom: 1px solid var(--border-light); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .course-title { font-weight: 600; }
    .course-desc { color: var(--fg-subtle); font-size: 0.8125rem; max-width: 20rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .confirm-card { background: var(--card); border-radius: 0.75rem; padding: 1.5rem; max-width: 24rem; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
    .confirm-card h3 { font-size: 1.125rem; font-weight: 600; color: var(--fg); margin-bottom: 0.5rem; }
    .confirm-card p { font-size: 0.875rem; color: var(--fg-subtle); margin-bottom: 1.5rem; }
    .confirm-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .btn-cancel { padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 0.375rem; background: var(--card); color: var(--fg); font-size: 0.875rem; cursor: pointer; }
    .btn-cancel:hover { background: var(--overlay); }
  `],
  template: `
    <div class="page">
      <div class="container">
        <div class="top-bar">
          <h2>Mis Cursos</h2>
          <button class="btn btn-primary" (click)="goTo('/teacher/courses/new')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo curso
          </button>
        </div>

        @if (errorMsg()) {
          <div class="error-msg">{{ errorMsg() }}</div>
        }

        @if (loading()) {
          <div class="loading">Cargando cursos...</div>
        } @else if (courses().length === 0) {
          <div class="empty-state">
            <h3>No tienes cursos creados</h3>
            <p>Crea tu primer curso para comenzar a ense&ntilde;ar.</p>
          </div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>T&iacute;tulo</th>
                  <th>Descripci&oacute;n</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (course of courses(); track course.id) {
                  <tr>
                    <td class="course-title">{{ course.title }}</td>
                    <td><span class="course-desc">{{ course.description }}</span></td>
                    <td>\${{ course.price.toFixed(2) }}</td>
                    <td>
                      <div class="actions">
                        <button class="btn btn-outline btn-sm" (click)="goTo('/teacher/courses/' + course.id + '/edit')">Editar</button>
                        <button class="btn btn-outline btn-sm" (click)="goTo('/teacher/courses/' + course.id + '/lessons')">Lecciones</button>
                        <button class="btn btn-outline btn-sm" (click)="goTo('/teacher/courses/' + course.id + '/quizzes')">Cuestionarios</button>
                        <button class="btn btn-danger btn-sm" (click)="confirmDelete(course)">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (deleteTarget()) {
          <div class="confirm-overlay" (click)="deleteTarget.set(null)">
            <div class="confirm-card" (click)="$event.stopPropagation()">
              <h3>Eliminar curso</h3>
              <p>¿Est&aacute;s seguro de eliminar "<strong>{{ deleteTarget()?.title }}</strong>"? Esta acci&oacute;n no se puede deshacer.</p>
              <div class="confirm-actions">
                <button class="btn-cancel" (click)="deleteTarget.set(null)">Cancelar</button>
                <button class="btn btn-danger" (click)="handleDelete()">Eliminar</button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TeacherCoursesListComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  errorMsg = signal('');
  courses = signal<any[]>([]);
  deleteTarget = signal<any | null>(null);

  ngOnInit(): void {
    this.loadCourses();
  }

  private loadCourses(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.http.get<BackendCourse[]>('/api/courses').subscribe({
      next: data => {
        const userId = Number(this.auth.user()?.id);
        const myCourses = data.filter(c => c.author?.id === userId);
        this.courses.set(myCourses);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al cargar los cursos');
      },
    });
  }

  confirmDelete(course: any): void {
    this.deleteTarget.set(course);
  }

  handleDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.http.delete(`/api/courses/${target.id}`).subscribe({
      next: () => {
        this.courses.set(this.courses().filter(c => c.id !== target.id));
        this.deleteTarget.set(null);
      },
      error: err => {
        this.deleteTarget.set(null);
        this.errorMsg.set(err.error?.message || 'Error al eliminar el curso');
      },
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
