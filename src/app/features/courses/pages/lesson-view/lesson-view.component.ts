import { Component, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursePlayerService } from '../../../../core/services/course-player.service';
import { CourseService } from '../../../../core/services/course.service';

@Component({
  selector: 'app-lesson-view',
  styles: [`
    :host { display: block; max-width: 56rem; margin: 0 auto; width: 100%; padding: 1.5rem; padding-bottom: 6rem; height: 100%; }
    @media (min-width: 768px) { :host { padding: 3rem; padding-bottom: 6rem; } }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; background: var(--primary-bg); color: var(--primary); font-size: 0.75rem; font-weight: 500; border-radius: 999px; margin-bottom: 1rem; }
    h1 { font-size: 1.875rem; font-weight: 700; color: var(--fg); margin-bottom: 1rem; line-height: 1.2; }
    .content, .content-text { max-width: none; margin-bottom: 3rem; }
    .content p, .content-text p { color: var(--fg-muted); line-height: 1.75; margin-bottom: 1rem; font-size: 0.9375rem; }
    .content h3, .content-text h3 { font-size: 1.125rem; font-weight: 700; color: var(--fg); margin: 1.75rem 0 0.75rem; }
    .content ul, .content-text ul { padding-left: 1.5rem; color: var(--fg-muted); margin-bottom: 1rem; }
    .content li, .content-text li { margin-bottom: 0.5rem; font-size: 0.9375rem; line-height: 1.6; }
    .video-frame { width: 100%; aspect-ratio: 16 / 9; border-radius: 0.75rem; border: none; margin: 2rem 0 2.5rem; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }

    .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--card); border-top: 1px solid var(--border); padding: 1rem; display: flex; justify-content: space-between; align-items: center; z-index: 20; }
    @media (min-width: 768px) { .bottom-bar { left: 20rem; } }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: background 0.2s; }
    .btn-complete { background: var(--success-bg); color: var(--success); }
    .btn-complete:hover { filter: brightness(0.95); }
    .btn-outline { background: none; border: 1px solid var(--border); color: var(--fg-muted); }
    .btn-outline:hover { background: var(--overlay); }
    .btn-next { background: var(--primary); color: #fff; }
    .btn-next:hover { background: var(--primary-hover); }
  `],
  template: `
    @if (lesson()) {
      <span class="badge">Lecci&oacute;n</span>
      <h1>{{ lesson()!.title }}</h1>

      @if (lesson()!.lessonType === 'VIDEO' && lesson()!.content) {
        <iframe class="video-frame" [src]="sanitizedVideoUrl(lesson()!.content!)" allowfullscreen></iframe>
      } @else if (lesson()!.content) {
        <div class="content-text" [innerHTML]="lesson()!.content"></div>
      } @else {
        <p style="color:var(--fg-subtle);margin:2rem 0 2.5rem;">Esta lecci&oacute;n no tiene contenido.</p>
      }

      <div class="bottom-bar">
        <button class="btn" [class.btn-complete]="lesson()!.completed" [class.btn-outline]="!lesson()!.completed && !completing()" (click)="completeLesson()" [disabled]="completing() || lesson()!.completed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          {{ lesson()!.completed ? 'Completada' : completing() ? 'Guardando...' : 'Marcar como completada' }}
        </button>
        <button class="btn btn-next" (click)="goToNext()">
          Siguiente
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    } @else {
      <p style="color:var(--fg-subtle)">Lecci&oacute;n no encontrada.</p>
    }
  `
})
export class LessonViewComponent {
  @Input() lessonId!: string;

  private router = inject(Router);
  private player = inject(CoursePlayerService);
  private courseSvc = inject(CourseService);
  private sanitizer = inject(DomSanitizer);

  protected completing = signal(false);

  sanitizedVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.toEmbedUrl(url));
  }

  /** Convierte URLs de YouTube al formato embed */
  private toEmbedUrl(url: string): string {
    if (!url) return url;

    // YouTube watch: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // YouTube short: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // YouTube shorts: https://www.youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    // Ya es embed o no es YouTube — se devuelve tal cual
    return url;
  }

  lesson() {
    const course = this.player.course();
    if (!this.lessonId || !course) return null;
    for (const mod of course.modules) {
      const found = mod.items.find(i => i.id === this.lessonId);
      if (found) return found;
    }
    return null;
  }

  completeLesson(): void {
    const lesson = this.lesson();
    if (!lesson || lesson.completed || this.completing()) return;
    this.completing.set(true);
    const numericId = parseInt(lesson.id.replace(/\D/g, ''), 10);
    this.courseSvc.completeItem('lesson', numericId).subscribe({
      next: () => {
        this.player.markItemComplete(lesson.id);
        this.completing.set(false);
      },
      error: () => this.completing.set(false),
    });
  }

  goToNext(): void {
    const course = this.player.course();
    if (!course) return;
    for (let mi = 0; mi < course.modules.length; mi++) {
      const items = course.modules[mi].items;
      for (let ii = 0; ii < items.length; ii++) {
        const item = items[ii];
          if (item.id === this.lessonId) {
          const next = items[ii + 1];
          if (next) {
            this.router.navigate(['/course', this.player.courseId(), next.type, next.id]);
            return;
          }
          const nextMod = course.modules[mi + 1];
          if (nextMod && nextMod.items.length > 0) {
            const first = nextMod.items[0];
            this.router.navigate(['/course', this.player.courseId(), first.type, first.id]);
            return;
          }
          this.router.navigate(['/dashboard']);
          return;
        }
      }
    }
  }
}
