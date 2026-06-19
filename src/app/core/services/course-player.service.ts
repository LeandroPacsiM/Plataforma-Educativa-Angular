import { Injectable, signal } from '@angular/core';
import { Course } from '../../data/course.model';

@Injectable({ providedIn: 'root' })
export class CoursePlayerService {
  readonly course = signal<Course | null>(null);
  readonly courseId = signal<string | null>(null);

  markItemComplete(prefixedId: string): void {
    const current = this.course();
    if (!current) return;

    const updatedModules = current.modules.map(mod => ({
      ...mod,
      items: mod.items.map(item =>
        item.id === prefixedId
          ? { ...item, completed: true, passed: item.type === 'quiz' ? true : item.passed }
          : item
      )
    }));

    const allItems = updatedModules.flatMap(m => m.items);
    const completedCount = allItems.filter(i => i.completed).length;
    const progress = allItems.length > 0
      ? Math.round((completedCount / allItems.length) * 100)
      : 0;

    this.course.set({ ...current, modules: updatedModules, progress });
  }
}
