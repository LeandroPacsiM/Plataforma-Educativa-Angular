import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null notification', () => {
    expect(service.notification()).toBeNull();
  });

  it('should show an error notification', () => {
    service.show('Something went wrong');
    expect(service.notification()).toEqual({ message: 'Something went wrong', type: 'error' });
  });

  it('should show a success notification', () => {
    service.show('All good!', 'success');
    expect(service.notification()).toEqual({ message: 'All good!', type: 'success' });
  });

  it('should show an info notification', () => {
    service.show('Heads up', 'info');
    expect(service.notification()).toEqual({ message: 'Heads up', type: 'info' });
  });

  it('should clear notification', () => {
    service.show('Test');
    service.clear();
    expect(service.notification()).toBeNull();
  });

  it('should auto-clear after 5 seconds', () => {
    service.show('Auto-clear test');
    expect(service.notification()).not.toBeNull();
    jasmine.clock().tick(5000);
    expect(service.notification()).toBeNull();
  });

  it('should replace and reset timer on new notification', () => {
    service.show('First', 'info');
    jasmine.clock().tick(3000);
    service.show('Second', 'error');
    // First would have cleared at 5s, but was replaced at 3s
    // Second should clear at 3s + 5s = 8s
    jasmine.clock().tick(4000);
    expect(service.notification()).not.toBeNull(); // Second still active (7s < 8s)
    jasmine.clock().tick(2000);
    expect(service.notification()).toBeNull(); // Now 9s > 8s
  });
});
