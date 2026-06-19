import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../data/course.model';

@Component({
  selector: 'app-dashboard',
  styles: [`
    .page { flex: 1; background: var(--bg-alt); padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 72rem; margin: 0 auto; display: flex; flex-direction: column; gap: 3rem; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .section-title { font-size: 1.5rem; font-weight: 700; color: var(--fg); }
    .section-link { color: var(--primary); font-size: 0.875rem; font-weight: 500; cursor: pointer; background: none; border: none; }
    .section-link:hover { text-decoration: underline; }
    .grid-2 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    @media (min-width: 768px) { .grid-2 { grid-template-columns: 1fr 1fr; } }
    .grid-3 { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    @media (min-width: 640px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .grid-3 { grid-template-columns: 1fr 1fr 1fr; } }
    .card { background: var(--card); border-radius: 0.75rem; overflow: hidden; border: 1px solid var(--border); display: flex; flex-direction: column; transition: box-shadow 0.2s; }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .card-row { display: flex; flex-direction: column; }
    @media (min-width: 640px) { .card-row { flex-direction: row; } }
    .card-img { width: 100%; height: 10rem; object-fit: cover; }
    @media (min-width: 640px) { .card-img-wide { width: 12rem; min-height: 10rem; height: auto; } }
    .card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
    .card-title { font-weight: 700; font-size: 1.125rem; color: var(--fg); margin-bottom: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .card-desc { font-size: 0.875rem; color: var(--fg-subtle); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
    .meta { display: flex; align-items: center; gap: 0.5rem; color: var(--fg-subtle); font-size: 0.875rem; margin-bottom: 1rem; }
    .progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 500; margin-bottom: 0.375rem; }
    .progress-label span:first-child { color: var(--fg-muted); }
    .progress-label span:last-child { color: var(--fg); }
    .progress-bar { width: 100%; background: var(--border-light); border-radius: 999px; height: 0.5rem; margin-bottom: 1rem; overflow: hidden; }
    .progress-fill { background: var(--primary); height: 0.5rem; border-radius: 999px; }
    .btn-continue { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--primary-bg); color: var(--primary); border: none; padding: 0.5rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: background 0.2s; }
    .btn-continue:hover { filter: brightness(0.95); }
    .btn-details { width: 100%; background: var(--fg); color: var(--bg); border: none; padding: 0.625rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
    .btn-details:hover { opacity: 0.85; }
    .group:hover .group-hover-scale { transform: scale(1.05); }
    .card-img-wrap { overflow: hidden; position: relative; }
    .empty-state { grid-column: 1 / -1; padding: 3rem; text-align: center; background: var(--card); border-radius: 0.75rem; border: 2px dashed var(--border); color: var(--fg-subtle); }
    .loading-state { grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--fg-subtle); }
  `],
  template: `
    <div class="page">
      <div class="container">
        <section>
          <div class="section-header">
            <h2 class="section-title">Mis cursos</h2>
            <button class="section-link" (click)="goTo('/progress')">Ver todo mi progreso</button>
          </div>
          @if (loading()) {
            <div class="loading-state">Cargando tus cursos...</div>
          } @else {
            <div class="grid-2">
              @for (item of enrolledList(); track item.course.id) {
                <div class="card card-row">
                  <img [src]="item.course.image" [alt]="item.course.title" class="card-img card-img-wide" />
                  <div class="card-body">
                    <h3 class="card-title">{{ item.course.title }}</h3>
                    <div class="meta">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>&Uacute;ltima actividad hace 2 d&iacute;as</span>
                    </div>
                    <div class="progress-label">
                      <span>Progreso</span>
                      <span>{{ item.progressPercent }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="item.progressPercent"></div>
                    </div>
                    <button class="btn-continue" (click)="goTo('/course/' + item.course.id)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                      Continuar aprendiendo
                    </button>
                  </div>
                </div>
              }
              @empty {
                <div class="empty-state">A&uacute;n no has comenzado ning&uacute;n curso.</div>
              }
            </div>
          }
        </section>

        <section>
          <div class="section-header">
            <h2 class="section-title">Cursos disponibles</h2>
            <button class="section-link" (click)="goTo('/courses')">Explorar cat&aacute;logo</button>
          </div>
          <div class="grid-3">
            @for (course of availableList(); track course.id) {
              <div class="card group">
                <div class="card-img card-img-wrap">
                  <img [src]="course.image" [alt]="course.title" class="group-hover-scale" />
                </div>
                <div class="card-body">
                  <h3 class="card-title">{{ course.title }}</h3>
                  <p class="card-desc">{{ course.description }}</p>
                  <button class="btn-details" (click)="goTo('/course-details/' + course.id)">Ver detalles</button>
                </div>
              </div>
            }
          </div>
        </section>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private courseSvc = inject(CourseService);
  private router = inject(Router);

  loading = signal(true);
  enrolledList = signal<{ course: Course; progressPercent: number; completed: boolean }[]>([]);
  availableList = signal<Course[]>([]);

  ngOnInit(): void {
    this.courseSvc.getDashboard().subscribe({
      next: data => {
        const enrolled = this.courseSvc.mapEnrolledCourses(data.enrolledCourses);
        const available = this.courseSvc.mapAvailableCourses(data.availableCourses);
        this.enrolledList.set(enrolled);
        this.availableList.set(available);
        this.auth.setPurchasedCourses(enrolled.map(e => e.course.id));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
