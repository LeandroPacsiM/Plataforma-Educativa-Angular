import { Component, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CoursePlayerService } from '../../../../core/services/course-player.service';
import { CourseService } from '../../../../core/services/course.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quiz-view',
  imports: [FormsModule],
  styles: [`
    :host { display: block; max-width: 48rem; margin: 0 auto; width: 100%; padding: 1.5rem; padding-bottom: 6rem; }
    @media (min-width: 768px) { :host { padding: 3rem; padding-bottom: 6rem; } }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; background: #fef3c7; color: #92400e; font-size: 0.75rem; font-weight: 500; border-radius: 999px; margin-bottom: 1rem; }
    h1 { font-size: 1.875rem; font-weight: 700; color: var(--fg); margin-bottom: 0.5rem; }
    .subtitle { color: var(--fg-subtle); font-size: 0.9375rem; margin-bottom: 2rem; }

    .quiz-card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.04); margin-bottom: 2rem; }
    .qheader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; font-size: 0.875rem; font-weight: 500; color: var(--fg-subtle); }
    .qnum { color: var(--fg-muted); }
    .qprog { background: var(--bg-alt); padding: 0.25rem 0.75rem; border-radius: 999px; }
    h3 { font-size: 1.125rem; font-weight: 500; color: var(--fg); margin-bottom: 1.5rem; }

    .option { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; border-radius: 0.5rem; border: 2px solid var(--border); cursor: pointer; transition: all 0.15s; margin-bottom: 0.75rem; }
    .option:hover { border-color: var(--primary); background: var(--overlay); }
    .option.selected { border-color: var(--primary); background: var(--primary-bg); }
    .option.correct { border-color: #22c55e; background: #f0fdf4; }
    .option.incorrect { border-color: #ef4444; background: #fef2f2; }
    .option.disabled { opacity: 0.5; pointer-events: none; }
    .option input[type="radio"] { margin-top: 0.25rem; accent-color: var(--primary); flex-shrink: 0; }
    .option label { flex: 1; font-size: 0.9375rem; font-weight: 500; color: var(--fg-muted); cursor: pointer; }

    .feedback-box { padding: 1.5rem; border-radius: 0.75rem; border: 1px solid; display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 2rem; }
    .feedback-box.correct { background: #f0fdf4; border-color: #bbf7d0; }
    .feedback-box.incorrect { background: #fef2f2; border-color: #fecaca; }
    .fb-icon { flex-shrink: 0; margin-top: 0.25rem; }
    .fb-title { font-weight: 700; margin-bottom: 0.25rem; }
    .fb-title.correct { color: #166534; }
    .fb-title.incorrect { color: #991b1b; }
    .fb-desc { font-size: 0.875rem; }
    .fb-desc.correct { color: #15803d; }
    .fb-desc.incorrect { color: #b91c1c; }

    .bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--card); border-top: 1px solid var(--border); padding: 1rem; display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; z-index: 20; }
    @media (min-width: 768px) { .bottom-bar { left: 20rem; } }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; border: none; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-outline { background: none; border: 1px solid var(--border); color: var(--fg-muted); }
    .btn-outline:hover { background: var(--overlay); }
    .ml-auto { margin-left: auto; }
  `],
  template: `
    @if (quiz()) {
      <span class="badge">Cuestionario Obligatorio</span>
      <h1>{{ quiz()!.title }}</h1>
      <p class="subtitle">Responde correctamente para avanzar en el curso.</p>

      <div class="quiz-card">
        <div class="qheader">
          <span class="qnum">Pregunta 1 de 1</span>
          <span class="qprog">Progreso: 0%</span>
        </div>

        <h3>{{ quiz()!.question }}</h3>

        <div>
          @for (opt of quiz()!.options; track $index; let idx = $index) {
            <div class="option"
              [class.selected]="selectedOption() === idx"
              [class.correct]="isSubmitted() && idx === quiz()!.correctOptionIndex"
              [class.incorrect]="isSubmitted() && selectedOption() === idx && idx !== quiz()!.correctOptionIndex"
              [class.disabled]="isSubmitted()">
              <input type="radio" name="quiz-option" [value]="idx" [ngModel]="selectedOption()" (ngModelChange)="selectOption($event)" [disabled]="isSubmitted()" />
              <label>{{ opt }}</label>
            </div>
          }
        </div>
      </div>

      @if (isSubmitted()) {
        <div class="feedback-box" [class.correct]="isCorrect()" [class.incorrect]="!isCorrect()">
          <div class="fb-icon">
            @if (isCorrect()) {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            } @else {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            }
          </div>
          <div>
            <div class="fb-title" [class.correct]="isCorrect()" [class.incorrect]="!isCorrect()">
              {{ isCorrect() ? '&iexcl;Correcto! Has aprobado el cuestionario.' : 'Incorrecto. Debes intentarlo de nuevo.' }}
            </div>
            <div class="fb-desc" [class.correct]="isCorrect()" [class.incorrect]="!isCorrect()">
              {{ isCorrect() ? 'Puedes avanzar a la siguiente secci&oacute;n del curso.' : 'Revisa el material de la lecci&oacute;n anterior e int&eacute;ntalo nuevamente para poder avanzar.' }}
            </div>
          </div>
        </div>
      }

      <div class="bottom-bar">
        @if (!isSubmitted()) {
          <button class="btn btn-primary ml-auto" (click)="submitAnswer()" [disabled]="selectedOption() === null">
            Enviar respuestas
          </button>
        } @else {
          @if (!isCorrect()) {
            <button class="btn btn-outline" (click)="reset()">Reintentar</button>
          }
          <button class="btn btn-primary ml-auto" (click)="goNext()" [disabled]="!isCorrect()">
            Siguiente <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        }
      </div>

    } @else {
      <p style="color:var(--fg-subtle)">Cuestionario no encontrado.</p>
    }
  `
})
export class QuizViewComponent {
  @Input() quizId!: string;

  private router = inject(Router);
  private player = inject(CoursePlayerService);
  private courseSvc = inject(CourseService);

  protected selectedOption = signal<number | null>(null);
  protected isSubmitted = signal(false);
  protected isCorrect = signal(false);

  quiz() {
    const course = this.player.course();
    if (!this.quizId || !course) return null;
    for (const mod of course.modules) {
      const found = mod.items.find(i => i.id === this.quizId);
      if (found) return found;
    }
    return null;
  }

  selectOption(idx: number): void {
    if (!this.isSubmitted()) this.selectedOption.set(idx);
  }

  submitAnswer(): void {
    if (this.selectedOption() === null) return;
    const quizItem = this.quiz();
    if (!quizItem) return;
    const correct = this.selectedOption() === quizItem.correctOptionIndex;
    this.isCorrect.set(correct);
    this.isSubmitted.set(true);
    if (correct) {
      const numericId = parseInt(quizItem.id.replace(/\D/g, ''), 10);
      this.courseSvc.completeItem('quiz', numericId).subscribe({
        next: () => this.player.markItemComplete(quizItem.id),
      });
    }
  }

  reset(): void {
    this.isSubmitted.set(false);
    this.selectedOption.set(null);
  }

  goNext(): void {
    const course = this.player.course();
    if (!course || !this.quizId) return;
    for (let mi = 0; mi < course.modules.length; mi++) {
      const items = course.modules[mi].items;
      for (let ii = 0; ii < items.length; ii++) {
        if (items[ii].id === this.quizId) {
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
