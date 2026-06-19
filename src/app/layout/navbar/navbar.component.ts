import { Component, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  styles: [`
    :host { display: block; position: sticky; top: 0; z-index: 50; }
    header { display: flex; align-items: center; justify-content: space-between; height: 4rem; padding: 0 1.5rem; border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--bg) 80%, transparent); backdrop-filter: blur(8px); }
    .logo { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.25rem; color: var(--primary); cursor: pointer; background: none; border: none; letter-spacing: -0.025em; }
    .logo svg { width: 1.5rem; height: 1.5rem; }
    .nav-center { display: flex; align-items: center; gap: 1.5rem; }
    .nav-link { font-size: 0.875rem; font-weight: 500; color: var(--fg-muted); cursor: pointer; background: none; border: none; padding: 0.25rem 0; transition: color 0.2s; }
    .nav-link:hover { color: var(--primary); }
    .nav-right { display: flex; align-items: center; gap: 0.75rem; border-left: 1px solid var(--border); padding-left: 0.75rem; }
    .icon-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 2.25rem; height: 2.25rem; border-radius: 50%; color: var(--fg-subtle); background: none; border: none; cursor: pointer; transition: background 0.2s, color 0.2s; }
    .icon-btn:hover { background: var(--overlay); color: var(--fg); }
    .badge { position: absolute; top: -2px; right: -2px; display: flex; align-items: center; justify-content: center; width: 1.125rem; height: 1.125rem; border-radius: 50%; background: #ef4444; color: #fff; font-size: 0.625rem; font-weight: 700; }
    .avatar { width: 2.25rem; height: 2.25rem; border-radius: 50%; background: var(--primary-bg); color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; position: relative; transition: opacity 0.2s; }
    .avatar:hover { opacity: 0.85; }
    .dropdown { position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: var(--card); border-radius: 0.5rem; box-shadow: 0 4px 24px rgba(0,0,0,0.12); border: 1px solid var(--border); z-index: 50; overflow: hidden; }
    .cart-dropdown { width: 20rem; }
    .user-dropdown { width: 13rem; }
    .dhead { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
    .dhead-title { font-weight: 600; font-size: 0.875rem; color: var(--fg); }
    .dhead-close { font-size: 0.75rem; color: var(--fg-subtle); cursor: pointer; background: none; border: none; }
    .dhead-close:hover { color: var(--fg); }
    .cart-empty { padding: 1.5rem; text-align: center; font-size: 0.8125rem; color: var(--fg-subtle); }
    .cart-list { max-height: 15rem; overflow-y: auto; }
    .cart-item { display: flex; gap: 0.75rem; padding: 0.75rem; border-bottom: 1px solid var(--border-light); }
    .cart-item img { width: 3rem; height: 3rem; border-radius: 0.375rem; object-fit: cover; }
    .ci-info { flex: 1; min-width: 0; }
    .ci-title { font-size: 0.8125rem; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ci-price { font-size: 0.75rem; color: var(--primary); font-weight: 600; }
    .ci-rm { color: var(--fg-subtle); cursor: pointer; background: none; border: none; padding: 0.25rem; align-self: flex-start; transition: color 0.2s; }
    .ci-rm:hover { color: var(--danger); }
    .cart-footer { padding: 1rem; border-top: 1px solid var(--border-light); background: var(--bg-alt); }
    .ctotal { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .ctotal-label { font-size: 0.8125rem; font-weight: 500; color: var(--fg-muted); }
    .ctotal-value { font-size: 1.125rem; font-weight: 700; color: var(--fg); }
    .checkout-btn { width: 100%; padding: 0.625rem; border: none; border-radius: 0.375rem; background: var(--primary); color: #fff; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .checkout-btn:hover { background: var(--primary-hover); }
    .uhead { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-light); }
    .uname { font-size: 0.875rem; font-weight: 500; color: var(--fg); }
    .uemail { font-size: 0.75rem; color: var(--fg-subtle); word-break: break-all; }
    .dropdown-item { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.625rem 1rem; font-size: 0.875rem; color: var(--fg); background: none; border: none; cursor: pointer; text-align: left; transition: background 0.2s; }
    .dropdown-item:hover { background: var(--overlay); }
    .logout-btn { display: flex; align-items: center; gap: 0.5rem; width: 100%; padding: 0.625rem 1rem; font-size: 0.875rem; color: var(--danger); background: none; border: none; cursor: pointer; text-align: left; transition: background 0.2s; }
    .logout-btn:hover { background: var(--danger-bg); }
    .login-btn { width: auto; padding: 0.5rem 1rem; border-radius: 0.375rem; background: var(--primary); color: #fff; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: background 0.2s; }
    .login-btn:hover { background: var(--primary-hover); }
  `],
  template: `
    <header>
      <button class="logo" (click)="goTo(user() ? '/dashboard' : '/')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        EduPlat
      </button>

      @if (user(); as u) {
        <div class="nav-center">
          <button class="nav-link" (click)="goTo('/courses')">Cursos</button>
          <button class="nav-link" (click)="goTo('/dashboard')">Mis cursos</button>
          <button class="nav-link" (click)="goTo('/progress')">Progreso</button>
          <button class="nav-link" (click)="goTo('/certificates')">Certificados</button>
          @if (u.role === 'TEACHER' || u.role === 'ADMIN') {
            <button class="nav-link" (click)="goTo('/teacher')">Panel docente</button>
          }
          @if (u.role === 'ADMIN') {
            <button class="nav-link" (click)="goTo('/admin')">Panel admin</button>
          }
        </div>

        <div class="nav-right">
          <button class="icon-btn" (click)="toggleCart(); $event.stopPropagation()" aria-label="Carrito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            @if (cartIds().length > 0) {
              <span class="badge">{{ cartIds().length }}</span>
            }
          </button>

          @if (isCartOpen) {
            <div class="dropdown cart-dropdown" (click)="$event.stopPropagation()">
              <div class="dhead">
                <span class="dhead-title">Carrito ({{ cartIds().length }})</span>
                <button class="dhead-close" (click)="isCartOpen = false">Cerrar</button>
              </div>
              @if (cartIds().length === 0) {
                <div class="cart-empty">Tu carrito est&aacute; vac&iacute;o</div>
              } @else {
                <div class="cart-list">
                  @for (item of cartService.cartItems(); track item.id) {
                    <div class="cart-item">
                      <img [src]="item.image" [alt]="item.title" />
                      <div class="ci-info">
                        <div class="ci-title">{{ item.title }}</div>
                        <div class="ci-price">\${{ item.price.toFixed(2) }}</div>
                      </div>
                      <button class="ci-rm" (click)="cartService.removeFromCart(item.id)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  }
                </div>
                <div class="cart-footer">
                  <div class="ctotal">
                    <span class="ctotal-label">Total:</span>
                    <span class="ctotal-value">\${{ cartTotal().toFixed(2) }}</span>
                  </div>
                  <button class="checkout-btn" (click)="goTo('/checkout')">Proceder al pago</button>
                </div>
              }
            </div>
          }

          <button class="icon-btn" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'">
            @if (theme.isDark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-8H2m20 0h-2m-2.93-5.07 1.42-1.42M6.34 17.66l1.42-1.42M17.66 6.34l1.42-1.42M6.34 6.34l1.42 1.42"/></svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          <div style="position:relative">
            <button class="avatar" (click)="toggleMenu(); $event.stopPropagation()">{{ u.initials }}</button>
            @if (menuOpen) {
              <div class="dropdown user-dropdown" (click)="$event.stopPropagation()">
                <div class="uhead">
                  <div class="uname">{{ u.name }}</div>
                  <div class="uemail">{{ u.email }}</div>
                </div>
                <button class="dropdown-item" (click)="goTo('/profile')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Mi perfil
                </button>
                <button class="logout-btn" (click)="logout()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Cerrar sesi&oacute;n
                </button>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="nav-right">
          <button class="icon-btn" (click)="theme.toggle()" [attr.aria-label]="theme.isDark() ? 'Activar modo claro' : 'Activar modo oscuro'">
            @if (theme.isDark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m-8-8H2m20 0h-2m-2.93-5.07 1.42-1.42M6.34 17.66l1.42-1.42M17.66 6.34l1.42-1.42M6.34 6.34l1.42 1.42"/></svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
          <button class="login-btn" (click)="goTo('/login')">Iniciar sesi&oacute;n</button>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected cartService = inject(CartService);
  protected theme = inject(ThemeService);

  user = this.auth.user;
  cartIds = this.cartService.cartItemIds;
  cartTotal = this.cartService.cartTotal;
  menuOpen = false;
  isCartOpen = false;

  goTo(path: string): void {
    this.menuOpen = false;
    this.isCartOpen = false;
    this.router.navigate([path]);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.isCartOpen = false;
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    this.menuOpen = false;
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    this.menuOpen = false;
    this.isCartOpen = false;
  }

  logout(): void {
    this.auth.logout();
    this.menuOpen = false;
    this.isCartOpen = false;
    this.router.navigate(['/login']);
  }
}
