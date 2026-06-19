import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../data/course.model';

@Component({
  selector: 'app-course-landing',
  styles: [`
    .page { flex: 1; }
    .hero { background: #0f172a; color: #fff; padding: 3rem 1.5rem; }
    @media (min-width: 768px) { .hero { padding: 4rem 2.5rem; } }
    .hero-inner { max-width: 72rem; margin: 0 auto; }
    .breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .breadcrumb button { background: none; border: none; color: #94a3b8; cursor: pointer; transition: color 0.2s; padding: 0; font-size: 0.8125rem; }
    .breadcrumb button:hover { color: #fff; }
    .hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; line-height: 1.2; }
    @media (min-width: 768px) { .hero h1 { font-size: 2.5rem; } }
    .hero-desc { color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; max-width: 48rem; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 1.5rem; font-size: 0.875rem; color: #94a3b8; }
    .hero-meta span { display: flex; align-items: center; gap: 0.375rem; }
    .layout { max-width: 72rem; margin: 0 auto; padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
    @media (min-width: 1024px) { .layout { flex-direction: row; padding: 2.5rem; } }
    .main { flex: 1; }
    .sidebar { width: 100%; }
    @media (min-width: 1024px) { .sidebar { width: 22rem; flex-shrink: 0; } }
    .card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); overflow: hidden; position: sticky; top: 5.5rem; }
    .card-img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
    .card-body { padding: 1.5rem; }
    .price-row { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.5rem; }
    .current-price { font-size: 2rem; font-weight: 800; color: var(--fg); }
    .old-price { font-size: 1rem; color: var(--fg-subtle); text-decoration: line-through; }
    .discount { background: #fef3c7; color: #92400e; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.5rem; border-radius: 0.25rem; }
    .btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: background 0.2s; margin-bottom: 0.75rem; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: none; border: 2px solid var(--primary); color: var(--primary); }
    .btn-outline:hover { background: var(--primary-bg); }
    .btn-success { background: #059669; color: #fff; }
    .btn-success:hover { background: #047857; }
    .section-title { font-size: 1.25rem; font-weight: 700; color: var(--fg); margin-bottom: 1rem; margin-top: 2rem; }
    .section-title:first-child { margin-top: 0; }
    .section-text { color: var(--fg-muted); line-height: 1.7; }
    .mod-card { background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem; }
    .mod-title { font-weight: 600; font-size: 0.9375rem; color: var(--fg); margin-bottom: 0.75rem; }
    .mod-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0; font-size: 0.8125rem; color: var(--fg-muted); }
    .mod-item svg { flex-shrink: 0; }
    .loading { text-align: center; padding: 3rem; color: var(--fg-subtle); }
  `],
  template: `
    @if (loading()) {
      <div class="page"><div class="loading">Cargando curso...</div></div>
    } @else {
      <div class="page">
        <div class="hero">
          <div class="hero-inner">
            <div class="breadcrumb">
              <button (click)="goTo('/courses')">Cursos</button>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              <span>{{ course()?.title }}</span>
            </div>
            <h1>{{ course()?.title }}</h1>
            <p class="hero-desc">{{ course()?.description }}</p>
            <div class="hero-meta">
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                4.7 (120 valoraciones)
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                {{ course()?.modules?.length ?? 0 }} m&oacute;dulos
              </span>
              <span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                12 horas
              </span>
              @if (course()?.author) {
                <span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <strong>Por:</strong> {{ course()?.author }}
                </span>
              }
            </div>
          </div>
        </div>

        <div class="layout">
          <div class="main">
            <h2 class="section-title">Descripci&oacute;n</h2>
            <p class="section-text">{{ course()?.description }}</p>

            <h2 class="section-title">Contenido del curso</h2>
            @for (mod of course()?.modules ?? []; track mod.id) {
              <div class="mod-card">
                <div class="mod-title">{{ mod.title }}</div>
                @for (item of mod.items; track item.id) {
                  <div class="mod-item">
                    @if (item.type === 'lesson') {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                    } @else {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    }
                    <span>{{ item.title }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <div class="sidebar">
            <div class="card">
              <img [src]="course()?.image" [alt]="course()?.title" class="card-img" />
              <div class="card-body">
                <div class="price-row">
                  <span class="current-price">\${{ currPrice }}</span>
                  <span class="old-price">\${{ oldPrice }}</span>
                  <span class="discount">30% OFF</span>
                </div>
                @if (isEnrolled()) {
                  <button class="btn btn-success" (click)="goTo('/course/' + course()?.id)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Ir al curso
                  </button>
                } @else if (isInCart()) {
                  <button class="btn btn-primary" (click)="goTo('/checkout')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                    Proceder al pago (\${{ cartTotal().toFixed(2) }})
                  </button>
                } @else {
                  <button class="btn btn-primary" (click)="addAndGo()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Comprar ahora
                  </button>
                  <button class="btn btn-outline" (click)="addToCart()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    A&ntilde;adir al carrito
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class CourseLandingComponent implements OnInit {
  @Input() courseId!: string;

  private router = inject(Router);
  private auth = inject(AuthService);
  private courseSvc = inject(CourseService);
  private cart = inject(CartService);

  loading = signal(true);
  course = signal<Course | null>(null);

  ngOnInit(): void {
    this.courseSvc.getCourseById(this.courseId).subscribe({
      next: c => { this.course.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  isEnrolled(): boolean {
    return this.auth.user()?.purchasedCourses?.includes(this.courseId) ?? false;
  }

  isInCart(): boolean {
    return this.cart.cartItemIds().includes(this.courseId);
  }

  cartTotal = this.cart.cartTotal;

  addToCart(): void {
    const c = this.course();
    if (c) this.cart.addToCart(c);
  }

  addAndGo(): void {
    const c = this.course();
    if (c) this.cart.addToCart(c);
    this.router.navigate(['/checkout']);
  }

  get currPrice(): string {
    const c = this.course();
    return c ? c.price.toFixed(2) : '0.00';
  }

  get oldPrice(): string {
    const c = this.course();
    return c ? (c.price * 1.4).toFixed(2) : '0.00';
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
