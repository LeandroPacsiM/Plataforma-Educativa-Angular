import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-teacher-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; background: var(--bg-alt); }
    .header { background: var(--card); border-bottom: 1px solid var(--border); padding: 1rem 1.5rem; }
    @media (min-width: 768px) { .header { padding: 1rem 2.5rem; } }
    .header-inner { max-width: 72rem; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
    .header h1 { font-size: 1.25rem; font-weight: 700; color: var(--fg); }
    .tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); background: var(--card); padding: 0 1.5rem; }
    @media (min-width: 768px) { .tabs { padding: 0 2.5rem; } }
    .tabs-inner { max-width: 72rem; margin: 0 auto; display: flex; gap: 0; width: 100%; }
    .tab { padding: 0.75rem 1.25rem; font-size: 0.875rem; font-weight: 500; color: var(--fg-muted); cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; transition: color 0.2s, border-color 0.2s; }
    .tab:hover { color: var(--fg); }
    .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
    .content { flex: 1; display: flex; flex-direction: column; }
  `],
  template: `
    <div class="header">
      <div class="header-inner">
        <h1>Panel Docente</h1>
        <button class="nav-link" (click)="goTo('/dashboard')" style="font-size:0.875rem;font-weight:500;color:var(--fg-muted);cursor:pointer;background:none;border:none;padding:0.25rem 0;">
          &larr; Volver al dashboard
        </button>
      </div>
    </div>
    <div class="tabs">
      <div class="tabs-inner">
        <a class="tab" routerLink="/teacher/courses" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Cursos</a>
      </div>
    </div>
    <div class="content">
      <router-outlet />
    </div>
  `
})
export class TeacherLayoutComponent {
  private router = inject(Router);

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
