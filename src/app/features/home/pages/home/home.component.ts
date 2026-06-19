import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../data/course.model';

@Component({
  selector: 'app-home',
  styles: [`
    .hero {
      background: var(--bg-alt);
      padding: 5rem 1rem;
      border-bottom: 1px solid var(--border);
      text-align: center;
    }
    @media (min-width: 768px) {
      .hero { padding: 6rem 1rem; }
    }
    .hero-container {
      max-width: 56rem;
      margin: 0 auto;
    }
    .hero h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-bottom: 1.5rem;
      color: var(--fg);
    }
    @media (min-width: 768px) {
      .hero h1 { font-size: 3rem; }
    }
    .hero h1 span {
      color: var(--primary);
    }
    .hero p {
      font-size: 1.125rem;
      color: var(--fg-subtle);
      margin-bottom: 2rem;
      max-width: 36rem;
      margin-left: auto;
      margin-right: auto;
    }
    @media (min-width: 768px) {
      .hero p { font-size: 1.25rem; }
    }
    .hero-btn {
      display: inline-block;
      background: var(--primary);
      color: #fff;
      padding: 0.75rem 2rem;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 1.125rem;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .hero-btn:hover {
      background: var(--primary-hover);
    }
    .courses-section {
      padding: 5rem 1rem;
    }
    .courses-container {
      max-width: 72rem;
      margin: 0 auto;
    }
    .courses-section h2 {
      font-size: 1.875rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 2.5rem;
      color: var(--fg);
    }
    .loading {
      text-align: center;
      padding: 3rem;
      color: var(--fg-subtle);
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media (min-width: 768px) {
      .grid { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 1024px) {
      .grid { grid-template-columns: 1fr 1fr 1fr; }
    }
    .card {
      display: flex;
      flex-direction: column;
      background: var(--card);
      border-radius: 0.75rem;
      overflow: hidden;
      border: 1px solid var(--border);
      transition: box-shadow 0.2s;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .img-wrap {
      aspect-ratio: 16 / 9;
      overflow: hidden;
      background: var(--bg-alt);
    }
    .img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
    .card:hover .img-wrap img {
      transform: scale(1.05);
    }
    .body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .body h3 {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--fg);
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .author {
      font-size: 0.8125rem;
      color: var(--fg-subtle);
      margin-bottom: 0.25rem;
      display: block;
    }
    .body p {
      font-size: 0.875rem;
      color: var(--fg-subtle);
      margin-bottom: 1.5rem;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background 0.2s;
      background: var(--bg-alt);
      color: var(--fg);
    }
    .card-btn:hover {
      background: var(--border);
    }
  `],
  template: `
    <div>
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-container">
          <h1>Aprende a tu ritmo, <span>domina tu futuro</span></h1>
          <p>&Uacute;nete a nuestra plataforma educativa y descubre un flujo de aprendizaje dise&ntilde;ado para que nunca te pierdas y siempre avances.</p>
          <button class="hero-btn" (click)="goToLogin()">Comenzar ahora</button>
        </div>
      </section>

      <!-- Courses Section -->
      <section class="courses-section">
        <div class="courses-container">
          <h2>Cursos Destacados</h2>
          @if (loading()) {
            <div class="loading">Cargando cursos...</div>
          } @else {
            <div class="grid">
              @for (course of featuredCourses(); track course.id) {
                <div class="card">
                  <div class="img-wrap">
                    <img [src]="course.image" [alt]="course.title" />
                  </div>
                  <div class="body">
                    <h3>{{ course.title }}</h3>
                    @if (course.author) {
                      <span class="author">Por {{ course.author }}</span>
                    }
                    <p>{{ course.description }}</p>
                    <button class="card-btn" (click)="goToLogin()">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Ver curso
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private courseSvc = inject(CourseService);

  loading = signal(true);
  featuredCourses = signal<Course[]>([]);

  ngOnInit(): void {
    this.courseSvc.getCourses().subscribe({
      next: data => {
        this.featuredCourses.set(data.slice(0, 3));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
