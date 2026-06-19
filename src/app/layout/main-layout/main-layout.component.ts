import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    @if (notification.notification(); as n) {
      <div class="toast" [class.toast-error]="n.type === 'error'" [class.toast-success]="n.type === 'success'" [class.toast-info]="n.type === 'info'" (click)="notification.clear()">
        <span>{{ n.message }}</span>
        <button class="toast-close">&times;</button>
      </div>
    }
    <app-navbar />
    <main class="main-content">
      <router-outlet />
    </main>
    <app-footer />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      position: relative;
    }
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .toast {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      cursor: pointer;
      max-width: 24rem;
      animation: slideIn 0.2s ease-out;
    }
    .toast-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .toast-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .toast-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .toast-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: inherit; opacity: 0.5; padding: 0; line-height: 1; }
    .toast-close:hover { opacity: 1; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class MainLayoutComponent {
  protected notification = inject(NotificationService);
}
