import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../data/course.model';

@Component({
  selector: 'app-progress',
  styles: [`
    .page { flex: 1; background: var(--bg-alt); padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 72rem; margin: 0 auto; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
    .loading { text-align: center; padding: 3rem; color: var(--fg-subtle); }

    .stats-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 3rem; }
    @media (min-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr 1fr; } }
    .stat-card { background: var(--card); border-radius: 0.75rem; padding: 1.5rem; border: 1px solid var(--border); display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .stat-icon { width: 3rem; height: 3rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon.indigo { background: #eef2ff; color: #4f46e5; }
    .stat-icon.emerald { background: #d1fae5; color: #059669; }
    .stat-icon.amber { background: #fef3c7; color: #d97706; }
    .stat-label { font-size: 0.875rem; font-weight: 500; color: var(--fg-subtle); }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--fg); }

    .section-title { font-size: 1.25rem; font-weight: 700; color: var(--fg); margin-bottom: 1.5rem; }

    .course-card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .course-head { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
    @media (min-width: 768px) { .course-head { flex-direction: row; align-items: center; justify-content: space-between; } }
    .course-info { display: flex; align-items: center; gap: 1rem; }
    .course-info img { width: 4rem; height: 3rem; object-fit: cover; border-radius: 0.375rem; flex-shrink: 0; }
    .course-info h3 { font-weight: 700; color: var(--fg); }
    .course-info p { font-size: 0.8125rem; color: var(--fg-subtle); }
    .course-progress { width: 100%; }
    @media (min-width: 768px) { .course-progress { width: 12rem; text-align: right; } }
    .prog-label { display: flex; justify-content: space-between; font-size: 0.8125rem; font-weight: 500; margin-bottom: 0.375rem; }
    .prog-label span:first-child { color: var(--fg-subtle); }
    .prog-label span:last-child { color: var(--primary); }
    .prog-bar { width: 100%; height: 0.5rem; background: var(--border-light); border-radius: 999px; overflow: hidden; }
    .prog-fill { height: 0.5rem; background: var(--primary); border-radius: 999px; }

    .mod-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-light); }
    @media (min-width: 768px) { .mod-grid { grid-template-columns: 1fr 1fr; } }
    .mod-block h4 { font-size: 0.8125rem; font-weight: 700; color: var(--fg-muted); margin-bottom: 0.5rem; }
    .item-list { padding-left: 0.5rem; border-left: 2px solid var(--border-light); }
    .item-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; font-size: 0.8125rem; }
    .item-row.completed { color: var(--fg); }
    .item-row.pending { color: var(--fg-subtle); }
    .item-icon { flex-shrink: 0; display: flex; }
    .item-icon.done { color: #22c55e; }
    .item-icon.todo { color: var(--fg-subtle); opacity: 0.4; }

    .empty-state { grid-column: 1 / -1; padding: 3rem; text-align: center; background: var(--card); border-radius: 0.75rem; border: 2px dashed var(--border); color: var(--fg-subtle); }
  `],
  template: `
    <div class="page">
      <div class="container">
        <h1 class="page-title">Mi Progreso</h1>

        @if (loading()) {
          <div class="loading">Cargando progreso...</div>
        } @else {
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon indigo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <div>
                <div class="stat-label">Promedio general</div>
                <div class="stat-value">{{ avgProgress() }}%</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon emerald">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <div>
                <div class="stat-label">Cursos en progreso</div>
                <div class="stat-value">{{ inProgressCount() }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon amber">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
              </div>
              <div>
                <div class="stat-label">Cursos completados</div>
                <div class="stat-value">{{ completedCount() }}</div>
              </div>
            </div>
          </div>

          <h2 class="section-title">Detalle por curso</h2>

          @for (item of enrolledList(); track item.course.id) {
            <div class="course-card">
              <div class="course-head">
                <div class="course-info">
                  <img [src]="item.course.image" alt="" />
                  <div>
                    <h3>{{ item.course.title }}</h3>
                    <p>{{ item.course.modules.length }} m&oacute;dulos en total</p>
                  </div>
                </div>
                <div class="course-progress">
                  <div class="prog-label">
                    <span>Completado</span>
                    <span>{{ item.progressPercent }}%</span>
                  </div>
                  <div class="prog-bar"><div class="prog-fill" [style.width.%]="item.progressPercent"></div></div>
                </div>
              </div>
              <div class="mod-grid">
                @for (mod of item.course.modules; track mod.id) {
                  <div class="mod-block">
                    <h4>{{ mod.title }}</h4>
                    <div class="item-list">
                      @for (it of mod.items; track it.id) {
                        <div class="item-row" [class.completed]="it.completed" [class.pending]="!it.completed">
                          <div class="item-icon" [class.done]="it.completed" [class.todo]="!it.completed">
                            @if (it.completed) {
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            } @else {
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                            }
                          </div>
                          <span>{{ it.title }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="empty-state">No tienes cursos en progreso. Empieza uno para ver tus estad&iacute;sticas.</div>
          }
        }
      </div>
    </div>
  `
})
export class ProgressComponent implements OnInit {
  private courseSvc = inject(CourseService);

  loading = signal(true);
  enrolledList = signal<{ course: Course; progressPercent: number; completed: boolean }[]>([]);

  ngOnInit(): void {
    this.courseSvc.getDashboard().subscribe({
      next: data => {
        this.enrolledList.set(this.courseSvc.mapEnrolledCourses(data.enrolledCourses));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  avgProgress = computed(() => {
    const list = this.enrolledList();
    if (list.length === 0) return 0;
    const total = list.reduce((s, e) => s + e.progressPercent, 0);
    return Math.round(total / list.length);
  });

  inProgressCount = computed(() => this.enrolledList().filter(e => !e.completed).length);
  completedCount = computed(() => this.enrolledList().filter(e => e.completed).length);
}
