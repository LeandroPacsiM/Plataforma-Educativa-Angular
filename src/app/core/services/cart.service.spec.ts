import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  const course1 = { id: 'c1', title: 'Java', price: 49.99, image: 'java.jpg' };
  const course2 = { id: 'c2', title: 'Spring', price: 59.99, image: 'spring.jpg' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CartService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty cart', () => {
    expect(service.cartItems()).toEqual([]);
    expect(service.cartItemIds()).toEqual([]);
    expect(service.cartTotal()).toBe(0);
  });

  it('should add item to cart', () => {
    service.addToCart(course1);
    expect(service.cartItems()).toHaveSize(1);
    expect(service.cartItems()[0].title).toBe('Java');
    expect(service.cartItemIds()).toEqual(['c1']);
  });

  it('should not add duplicate items', () => {
    service.addToCart(course1);
    service.addToCart(course1);
    expect(service.cartItems()).toHaveSize(1);
  });

  it('should add multiple items', () => {
    service.addToCart(course1);
    service.addToCart(course2);
    expect(service.cartItems()).toHaveSize(2);
  });

  it('should compute total correctly', () => {
    service.addToCart(course1);
    service.addToCart(course2);
    expect(service.cartTotal()).toBeCloseTo(109.98);
  });

  it('should remove item from cart', () => {
    service.addToCart(course1);
    service.addToCart(course2);
    service.removeFromCart('c1');
    expect(service.cartItems()).toHaveSize(1);
    expect(service.cartItems()[0].id).toBe('c2');
  });

  it('should clear cart', () => {
    service.addToCart(course1);
    service.addToCart(course2);
    service.clearCart();
    expect(service.cartItems()).toEqual([]);
    expect(service.cartTotal()).toBe(0);
  });

  it('should checkout via POST', () => {
    const items = [{ courseId: 1, title: 'Java', price: 49.99, imageUrl: 'java.jpg' }];
    service.checkout(items).subscribe(res => {
      expect(res.success).toBeTrue();
    });

    const req = httpMock.expectOne('/api/cart/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ items });
    req.flush({ success: true, message: 'OK' });
  });
});
