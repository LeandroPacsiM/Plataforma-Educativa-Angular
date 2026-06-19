import { Injectable, inject, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Course } from '../../data/course.model';
import { BackendCheckoutResponse } from '../models/api.models';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private cartItemsSignal = signal<CartItem[]>([]);

  readonly cartItems = computed(() => this.cartItemsSignal());

  readonly cartTotal = computed(() =>
    this.cartItemsSignal().reduce((total, c) => total + c.price, 0)
  );

  readonly cartItemIds = computed(() => this.cartItemsSignal().map(c => c.id));

  addToCart(course: { id: string; title: string; price: number; image: string }): void {
    this.cartItemsSignal.update(items =>
      items.some(i => i.id === course.id) ? items : [...items, course]
    );
  }

  removeFromCart(courseId: string): void {
    this.cartItemsSignal.update(items => items.filter(i => i.id !== courseId));
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
  }

  checkout(items: { courseId: number; title: string; price: number; imageUrl: string }[]) {
    return this.http.post<BackendCheckoutResponse>('/api/cart/checkout', { items });
  }
}
