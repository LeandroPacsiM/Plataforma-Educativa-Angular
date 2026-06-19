import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-checkout',
  styles: [`
    .page { flex: 1; background: var(--bg-alt); padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 80rem; margin: 0 auto; }
    .title { font-size: 1.875rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }

    .empty-state, .success-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; text-align: center; }
    .icon-wrap { width: 5rem; height: 5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
    .icon-emerald { background: #d1fae5; color: #059669; }
    .icon-slate { background: var(--overlay); color: var(--fg-subtle); }
    .empty-state h2, .success-state h2 { font-size: 1.5rem; font-weight: 700; color: var(--fg); margin-bottom: 0.5rem; }
    .empty-state p, .success-state p { color: var(--fg-subtle); margin-bottom: 2rem; max-width: 24rem; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 0.9375rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }

    .layout { display: flex; flex-direction: column; gap: 2.5rem; }
    @media (min-width: 1024px) { .layout { flex-direction: row; } }
    .form-section, .summary-section { flex: 1; }
    @media (min-width: 1024px) { .summary-section { max-width: 24rem; } }

    .card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); padding: 1.5rem; }
    @media (min-width: 768px) { .card { padding: 2rem; } }
    .card-title { font-size: 1.25rem; font-weight: 700; color: var(--fg); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }

    .pay-btn { width: 100%; padding: 1rem; border: none; border-radius: 0.5rem; background: var(--primary); color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.2s; margin-top: 0.5rem; }
    .pay-btn:hover { background: var(--primary-hover); }
    .pay-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .secure-note { font-size: 0.75rem; color: var(--fg-subtle); text-align: center; display: flex; align-items: center; justify-content: center; gap: 0.25rem; margin-top: 1rem; }
    .error-msg { color: #dc2626; font-size: 0.8125rem; margin-top: 0.75rem; padding: 0.5rem; background: #fef2f2; border-radius: 0.375rem; text-align: center; }

    .summary-item { display: flex; gap: 1rem; padding: 0.75rem 0; }
    .summary-item:not(:last-child) { border-bottom: 1px solid var(--border-light); }
    .summary-item img { width: 4rem; height: 3rem; border-radius: 0.375rem; object-fit: cover; flex-shrink: 0; }
    .si-info { flex: 1; min-width: 0; }
    .si-title { font-size: 0.875rem; font-weight: 500; color: var(--fg); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .si-price { font-size: 0.8125rem; color: var(--fg-subtle); }
    .totals { border-top: 1px solid var(--border); margin-top: 0.5rem; padding-top: 1rem; }
    .total-row { display: flex; justify-content: space-between; font-size: 0.9375rem; color: var(--fg-muted); margin-bottom: 0.5rem; }
    .total-row:last-child { font-size: 1.125rem; font-weight: 700; color: var(--fg); padding-top: 0.75rem; border-top: 1px solid var(--border); margin-bottom: 0; }

    .sticky-wrap { position: sticky; top: 5.5rem; }
  `],
  template: `
    <div class="page">
      <div class="container">

        @if (isSuccess()) {
          <div class="success-state">
            <div class="icon-wrap icon-emerald">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h2>&iexcl;Pago exitoso!</h2>
            <p>Tus cursos han sido a&ntilde;adidos a tu cuenta y ya puedes comenzar a estudiar.</p>
            <button class="btn btn-primary" (click)="goTo('/dashboard')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Ir a mi Dashboard
            </button>
          </div>

        } @else if (cartItems().length === 0) {
          <div class="empty-state">
            <div class="icon-wrap icon-slate">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
            </div>
            <h2>Tu carrito est&aacute; vac&iacute;o</h2>
            <p>No has a&ntilde;adido ning&uacute;n curso para comprar.</p>
            <button class="btn btn-primary" (click)="goTo('/courses')">Explorar cursos</button>
          </div>

        } @else {
          <h1 class="title">Finalizar Compra</h1>
          <div class="layout">
            <div class="form-section card">
              <h2 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--primary)"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Confirmar compra
              </h2>

              @if (errorMsg()) {
                <div class="error-msg">{{ errorMsg() }}</div>
              }

              <button class="pay-btn" (click)="handlePayment()" [disabled]="isProcessing()">
                @if (isProcessing()) {
                  Procesando pago...
                } @else {
                  Pagar \${{ cartTotal().toFixed(2) }}
                }
              </button>
              <p class="secure-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Pagos seguros y encriptados. Esta es una plataforma demo.
              </p>
            </div>

            <div class="summary-section">
              <div class="card sticky-wrap">
                <h2 class="card-title">Resumen del pedido</h2>
                @for (item of cartItems(); track item.id) {
                  <div class="summary-item">
                    <img [src]="item.image" [alt]="item.title" />
                    <div class="si-info">
                      <div class="si-title">{{ item.title }}</div>
                      <div class="si-price">\${{ item.price.toFixed(2) }}</div>
                    </div>
                  </div>
                }
                <div class="totals">
                  <div class="total-row">
                    <span>Subtotal</span>
                    <span>\${{ cartTotal().toFixed(2) }}</span>
                  </div>
                  <div class="total-row">
                    <span>Impuestos</span>
                    <span>\$0.00</span>
                  </div>
                  <div class="total-row">
                    <span>Total</span>
                    <span>\${{ cartTotal().toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class CheckoutComponent {
  private auth = inject(AuthService);
  protected cartService = inject(CartService);
  private router = inject(Router);

  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;

  isProcessing = signal(false);
  isSuccess = signal(false);
  errorMsg = signal('');

  handlePayment(): void {
    this.isProcessing.set(true);
    this.errorMsg.set('');

    const items = this.cartItems().map(c => ({
      courseId: parseInt(c.id, 10),
      title: c.title,
      price: c.price,
      imageUrl: c.image,
    }));

    this.cartService.checkout(items).subscribe({
      next: () => {
        this.auth.purchaseCourses(this.cartItems().map(i => i.id));
        this.cartService.clearCart();
        this.isProcessing.set(false);
        this.isSuccess.set(true);
      },
      error: (err) => {
        this.isProcessing.set(false);
        this.errorMsg.set(err.error?.message || 'Error al procesar el pago');
      },
    });
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }
}
