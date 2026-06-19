import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../data/course.model';

@Component({
  selector: 'app-courses-list',
  styles: [`
    .page { flex: 1; background: var(--bg-alt); padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 72rem; margin: 0 auto; }
    .header { margin-bottom: 2rem; }
    .header h1 { font-size: 1.875rem; font-weight: 700; color: var(--fg); margin-bottom: 0.5rem; }
    .header p { color: var(--fg-subtle); font-size: 0.9375rem; }
    .loading { text-align: center; padding: 3rem; color: var(--fg-subtle); }
    .grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
    @media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }
    .card { display: flex; flex-direction: column; background: var(--card); border-radius: 0.75rem; overflow: hidden; border: 1px solid var(--border); transition: box-shadow 0.2s; }
    .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .img-wrap { aspect-ratio: 16 / 9; overflow: hidden; background: var(--bg-alt); }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .card:hover .img-wrap img { transform: scale(1.05); }
    .body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
    .body h3 { font-weight: 700; font-size: 1.25rem; color: var(--fg); margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .author { font-size: 0.8125rem; color: var(--fg-subtle); margin-bottom: 0.25rem; }
    .body p { font-size: 0.875rem; color: var(--fg-subtle); margin-bottom: 1.5rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem; border: none; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary { background: var(--fg); color: var(--bg); }
    .btn-secondary:hover { opacity: 0.9; }
  `],
  template: `
    <div class="page">
      <div class="container">
        <div class="header">
          <h1>Cat&aacute;logo de Cursos</h1>
          <p>Explora todos los cursos disponibles en la plataforma.</p>
        </div>
        @if (loading()) {
          <div class="loading">Cargando cursos...</div>
        } @else {
          <div class="grid">
            @for (course of courses(); track course.id) {
              <div class="card">
                <div class="img-wrap">
                  <img [src]="course.image" [alt]="course.title" />
                </div>
                <div class="body">
                  <h3>{{ course.title }}</h3>
                  @if (course.author) {
                    <p class="author">Por {{ course.author }}</p>
                  }
                  <p>{{ course.description }}</p>
                  @if (isPurchased(course.id)) {
                    <button class="btn btn-primary" (click)="goTo('/course/' + course.id)">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Continuar curso
                    </button>
                  } @else {
                    <button class="btn btn-secondary" (click)="goTo('/course-details/' + course.id)">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                      Ver informaci&oacute;n
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CoursesListComponent implements OnInit {
  private auth = inject(AuthService);
  private courseSvc = inject(CourseService);
  private router = inject(Router);

  loading = signal(true);
  courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.courseSvc.getCourses().subscribe({
      next: data => { this.courses.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isPurchased(courseId: string): boolean {
    return this.auth.user()?.purchasedCourses?.includes(courseId) ?? false;
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
