import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  message: string;
  type: 'error' | 'success' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly notification = signal<AppNotification | null>(null);
  private timeout?: ReturnType<typeof setTimeout>;

  show(message: string, type: AppNotification['type'] = 'error'): void {
    clearTimeout(this.timeout);
    this.notification.set({ message, type });
    this.timeout = setTimeout(() => this.clear(), 5000);
  }

  clear(): void {
    this.notification.set(null);
    clearTimeout(this.timeout);
  }
}
