import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BackendCourse, BackendLesson } from '../../../../core/models/api.models';

@Component({
  selector: 'app-teacher-lessons-manager',
  styles: [`
    .page { flex: 1; padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 72rem; margin: 0 auto; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 0.75rem; }
    .top-bar h2 { font-size: 1.5rem; font-weight: 700; color: var(--fg); }
    .course-title { font-size: 0.9375rem; color: var(--fg-subtle); }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border: none; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-danger:hover { filter: brightness(0.9); }
    .btn-outline { background: transparent; color: var(--fg); border: 1px solid var(--border); }
    .btn-outline:hover { background: var(--overlay); }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.8125rem; border-radius: 0.375rem; }
    .back-link { font-size: 0.875rem; font-weight: 500; color: var(--primary); cursor: pointer; background: none; border: none; padding: 0; margin-bottom: 1rem; display: inline-flex; align-items: center; gap: 0.25rem; }
    .back-link:hover { text-decoration: underline; }
    .loading { text-align: center; padding: 3rem; color: var(--fg-subtle); }
    .error-msg { padding: 1rem; background: var(--danger-bg); color: var(--danger); border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.875rem; }
    .empty-state { text-align: center; padding: 3rem; color: var(--fg-subtle); background: var(--card); border-radius: 0.75rem; border: 2px dashed var(--border); }
    .empty-state h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--fg-muted); }
    .card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); overflow: hidden; }
    .list-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); gap: 1rem; }
    .list-item:last-child { border-bottom: none; }
    .item-info { flex: 1; min-width: 0; }
    .item-title { font-size: 0.9375rem; font-weight: 600; color: var(--fg); margin-bottom: 0.25rem; }
    .item-type { font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.03em; }
    .type-text { color: var(--success); }
    .type-video { color: var(--primary); }
    .item-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
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
        <button class="back-link" (click)="goTo('/teacher/courses')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Volver a mis cursos
        </button>

        <div class="top-bar">
          <div>
            <h2>Lecciones</h2>
            <span class="course-title">{{ courseTitle() }}</span>
          </div>
          <button class="btn btn-primary" (click)="goTo('/teacher/courses/' + courseId + '/lessons/new')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva lecci&oacute;n
          </button>
        </div>

        @if (errorMsg()) {
          <div class="error-msg">{{ errorMsg() }}</div>
        }

        @if (loading()) {
          <div class="loading">Cargando lecciones...</div>
        } @else if (lessons().length === 0) {
          <div class="empty-state">
            <h3>No hay lecciones</h3>
            <p>Crea la primera lecci&oacute;n de este curso.</p>
          </div>
        } @else {
          <div class="card">
            @for (lesson of lessons(); track lesson.id) {
              <div class="list-item">
                <div class="item-info">
                  <div class="item-title">{{ lesson.title }}</div>
                  <span class="item-type" [class.type-text]="lesson.type === 'TEXT'" [class.type-video]="lesson.type === 'VIDEO'">
                    {{ lesson.type === 'TEXT' ? 'Texto' : 'Video' }}
                  </span>
                </div>
                <div class="item-actions">
                  <button class="btn btn-outline btn-sm" (click)="goTo('/teacher/courses/' + courseId + '/lessons/' + lesson.id + '/edit')">Editar</button>
                  <button class="btn btn-danger btn-sm" (click)="confirmDelete(lesson)">Eliminar</button>
                </div>
              </div>
            }
          </div>
        }

        @if (deleteTarget()) {
          <div class="confirm-overlay" (click)="deleteTarget.set(null)">
            <div class="confirm-card" (click)="$event.stopPropagation()">
              <h3>Eliminar lecci&oacute;n</h3>
              <p>¿Est&aacute;s seguro de eliminar "<strong>{{ deleteTarget()?.title }}</strong>"?</p>
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
export class TeacherLessonsManagerComponent implements OnInit {
  @Input() courseId!: string;

  private http = inject(HttpClient);
  private router = inject(Router);

  loading = signal(true);
  errorMsg = signal('');
  courseTitle = signal('');
  lessons = signal<BackendLesson[]>([]);
  deleteTarget = signal<BackendLesson | null>(null);

  ngOnInit(): void {
    this.loadLessons();
  }

  private loadLessons(): void {
    this.loading.set(true);
    this.errorMsg.set('');
    this.http.get<BackendCourse>(`/api/courses/${this.courseId}`).subscribe({
      next: course => {
        this.courseTitle.set(course.title);
        this.lessons.set(course.lessons || []);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al cargar las lecciones');
      },
    });
  }

  confirmDelete(lesson: BackendLesson): void {
    this.deleteTarget.set(lesson);
  }

  handleDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.http.delete(`/api/lessons/${target.id}`).subscribe({
      next: () => {
        this.lessons.set(this.lessons().filter(l => l.id !== target.id));
        this.deleteTarget.set(null);
      },
      error: err => {
        this.deleteTarget.set(null);
        this.errorMsg.set(err.error?.message || 'Error al eliminar la lecci&oacute;n');
      },
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
