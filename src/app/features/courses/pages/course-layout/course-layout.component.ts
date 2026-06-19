import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CoursePlayerService } from '../../../../core/services/course-player.service';
import { CourseService } from '../../../../core/services/course.service';
import { Course } from '../../../../data/course.model';

@Component({
  selector: 'app-course-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; overflow: hidden; height: 100%; }
    @media (min-width: 768px) { :host { flex-direction: row; } }

    .mobile-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem; border-bottom: 1px solid var(--border); background: var(--bg); flex-shrink: 0; }
    @media (min-width: 768px) { .mobile-header { display: none; } }
    .mobile-header button { color: var(--fg-subtle); background: none; border: none; cursor: pointer; padding: 0.25rem; display: flex; }
    .mobile-header h2 { font-size: 0.875rem; font-weight: 600; color: var(--fg); text-align: center; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 0.5rem; }

    .sidebar { position: absolute; inset: 0; z-index: 40; background: var(--bg-alt); border-right: 1px solid var(--border); width: 100%; display: flex; flex-direction: column; transition: transform 0.2s; }
    @media (min-width: 768px) { .sidebar { position: static; width: 20rem; flex-shrink: 0; transform: none !important; } }
    .sidebar.open { transform: translateX(0); }
    .sidebar.closed { transform: translateX(-100%); }

    .shead { display: none; padding: 1.5rem; border-bottom: 1px solid var(--border); align-items: flex-start; gap: 0.75rem; }
    @media (min-width: 768px) { .shead { display: flex; } }
    .shead-back { margin-top: 0.25rem; color: var(--fg-subtle); background: none; border: none; cursor: pointer; display: flex; transition: color 0.2s; flex-shrink: 0; }
    .shead-back:hover { color: var(--fg); }
    .shead-title { font-weight: 700; color: var(--fg); line-height: 1.3; margin-bottom: 0.5rem; }
    .shead-progress { display: flex; align-items: center; gap: 0.5rem; }
    .shead-bar { flex: 1; height: 0.375rem; background: var(--border-light); border-radius: 999px; overflow: hidden; }
    .shead-fill { height: 0.375rem; background: var(--primary); border-radius: 999px; }
    .shead-pct { font-size: 0.75rem; font-weight: 500; color: var(--fg-subtle); }

    .nav-wrap { flex: 1; overflow-y: auto; padding: 1rem; }
    .mod-section { margin-bottom: 1.5rem; }
    .mod-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-subtle); margin-bottom: 0.75rem; padding: 0 0.5rem; }
    .nav-link { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; border-radius: 0.5rem; transition: background 0.15s; text-decoration: none; }
    .nav-link:hover { background: var(--overlay); }
    .nav-link.active { background: var(--primary-bg); }
    .nav-link.active .nl-label { color: var(--primary); }
    .dark .nav-link.active { background: rgba(49, 46, 129, 0.3); }
    .dark .nav-link.active .nl-label { color: #a5b4fc; }
    .nl-icon { margin-top: 0.125rem; flex-shrink: 0; display: flex; }
    .nl-text { flex: 1; min-width: 0; }
    .nl-label { font-size: 0.8125rem; font-weight: 500; color: var(--fg-muted); line-height: 1.3; }
    .nl-type { font-size: 0.6875rem; color: var(--fg-subtle); margin-top: 0.125rem; opacity: 0.7; }

    .body-wrap { display: flex; flex: 1; overflow: hidden; position: relative; }
    @media (min-width: 768px) { .body-wrap { position: static; } }

    .main-content { flex: 1; overflow-y: auto; background: var(--bg); }
    .loading { padding: 3rem; text-align: center; color: var(--fg-subtle); flex: 1; }
  `],
  template: `
    @if (loading()) {
      <div class="loading">Cargando curso...</div>
    } @else {
      <div class="mobile-header">
        <button (click)="goTo('/dashboard')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </button>
        <h2>{{ course()?.title ?? '' }}</h2>
        <button (click)="toggleSidebar()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <div class="body-wrap">
        <aside class="sidebar" [class.open]="isSidebarOpen()" [class.closed]="!isSidebarOpen()">
          <div class="shead">
            <button class="shead-back" (click)="goTo('/dashboard')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            </button>
            <div style="flex:1">
              <div class="shead-title">{{ course()?.title ?? '' }}</div>
              <div class="shead-progress">
                <div class="shead-bar"><div class="shead-fill" [style.width.%]="course()?.progress ?? 0"></div></div>
                <span class="shead-pct">{{ course()?.progress ?? 0 }}%</span>
              </div>
            </div>
          </div>
          <div class="nav-wrap">
            @for (mod of course()?.modules ?? []; track mod.id) {
              <div class="mod-section">
                <div class="mod-title">{{ mod.title }}</div>
                @for (item of mod.items; track item.id) {
                  <a class="nav-link"
                    [routerLink]="'/course/' + courseId + '/' + item.type + '/' + item.id"
                    routerLinkActive="active"
                    (click)="closeSidebar()">
                    <div class="nl-icon" [style.color]="item.completed ? 'var(--success)' : 'var(--fg-subtle)'" [style.opacity]="item.completed ? '1' : '0.6'">
                      @if (item.completed) {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      } @else if (item.type === 'lesson') {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                      } @else {
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      }
                    </div>
                    <div class="nl-text">
                      <div class="nl-label">{{ item.title }}</div>
                      <div class="nl-type">{{ item.type === 'lesson' ? 'Lecci\u00f3n' : 'Cuestionario' }}</div>
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        </aside>
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    }
  `
})
export class CourseLayoutComponent implements OnInit {
  @Input() courseId!: string;

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private player = inject(CoursePlayerService);
  private courseSvc = inject(CourseService);

  protected course = this.player.course;
  isSidebarOpen = signal(false);
  loading = signal(true);

  ngOnInit(): void {
    const user = this.auth.user();
    if (!user?.purchasedCourses?.includes(this.courseId)) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.courseSvc.getCourseById(this.courseId).subscribe({
      next: c => {
        this.player.courseId.set(this.courseId);
        this.player.course.set(c);
        this.loading.set(false);
        if (!this.route.firstChild) {
          const firstItem = c.modules[0]?.items[0];
          if (firstItem) {
            this.router.navigate([firstItem.type, firstItem.id], { relativeTo: this.route, replaceUrl: true });
          }
        }
      },
      error: () => {
        this.router.navigate(['/dashboard']);
      },
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  goTo(path: string): void {
    this.closeSidebar();
    this.router.navigate([path]);
  }
}
