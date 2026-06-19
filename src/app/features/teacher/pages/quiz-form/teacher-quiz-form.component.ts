import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendQuiz } from '../../../../core/models/api.models';

@Component({
  selector: 'app-teacher-quiz-form',
  imports: [ReactiveFormsModule],
  styles: [`
    .page { flex: 1; padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 48rem; margin: 0 auto; }
    .title { font-size: 1.5rem; font-weight: 700; color: var(--fg); margin-bottom: 2rem; }
    .card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); padding: 1.5rem; }
    @media (min-width: 768px) { .card { padding: 2rem; } }
    .form-group { margin-bottom: 1.25rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--fg); margin-bottom: 0.375rem; }
    input, select { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; background: var(--bg); color: var(--fg); outline: none; box-sizing: border-box; font-family: inherit; }
    input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
    .field-error { font-size: 0.75rem; color: var(--danger); margin-top: 0.25rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem; }
    .btn { padding: 0.625rem 1.5rem; border: none; border-radius: 0.5rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-cancel { background: transparent; color: var(--fg-muted); border: 1px solid var(--border); }
    .btn-cancel:hover { background: var(--overlay); }
    .loading-state { text-align: center; padding: 3rem; color: var(--fg-subtle); }
    .error-msg { padding: 0.75rem; background: var(--danger-bg); color: var(--danger); border-radius: 0.375rem; margin-bottom: 1rem; font-size: 0.8125rem; }
    .back-link { font-size: 0.875rem; font-weight: 500; color: var(--primary); cursor: pointer; background: none; border: none; padding: 0; margin-bottom: 1.5rem; display: inline-flex; align-items: center; gap: 0.25rem; }
    .back-link:hover { text-decoration: underline; }
    .options-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    @media (min-width: 640px) { .options-grid { grid-template-columns: 1fr 1fr; } }
  `],
  template: `
    <div class="page">
      <div class="container">
        <button class="back-link" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Volver a cuestionarios
        </button>

        <h1 class="title">{{ isEditing() ? 'Editar cuestionario' : 'Nuevo cuestionario' }}</h1>

        @if (formError()) {
          <div class="error-msg">{{ formError() }}</div>
        }

        @if (isLoadingEdit()) {
          <div class="loading-state">Cargando datos del cuestionario...</div>
        } @else {
          <div class="card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="question">Pregunta</label>
                <input id="question" type="text" formControlName="question" placeholder="Ej: ¿Cu&aacute;l es la capital de Francia?" />
                @if (form.get('question')?.invalid && form.get('question')?.touched) {
                  <div class="field-error">La pregunta es obligatoria</div>
                }
              </div>

              <div class="options-grid">
                <div class="form-group">
                  <label for="optionA">Opci&oacute;n A</label>
                  <input id="optionA" type="text" formControlName="optionA" placeholder="Opci&oacute;n A" />
                  @if (form.get('optionA')?.invalid && form.get('optionA')?.touched) {
                    <div class="field-error">Campo obligatorio</div>
                  }
                </div>

                <div class="form-group">
                  <label for="optionB">Opci&oacute;n B</label>
                  <input id="optionB" type="text" formControlName="optionB" placeholder="Opci&oacute;n B" />
                  @if (form.get('optionB')?.invalid && form.get('optionB')?.touched) {
                    <div class="field-error">Campo obligatorio</div>
                  }
                </div>

                <div class="form-group">
                  <label for="optionC">Opci&oacute;n C</label>
                  <input id="optionC" type="text" formControlName="optionC" placeholder="Opci&oacute;n C" />
                  @if (form.get('optionC')?.invalid && form.get('optionC')?.touched) {
                    <div class="field-error">Campo obligatorio</div>
                  }
                </div>

                <div class="form-group">
                  <label for="correctAnswer">Respuesta correcta</label>
                  <select id="correctAnswer" formControlName="correctAnswer">
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                  @if (form.get('correctAnswer')?.invalid && form.get('correctAnswer')?.touched) {
                    <div class="field-error">Selecciona la respuesta correcta</div>
                  }
                </div>
              </div>

              <div class="actions">
                <button type="button" class="btn btn-cancel" (click)="goBack()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting()">
                  {{ isSubmitting() ? 'Guardando...' : (isEditing() ? 'Actualizar cuestionario' : 'Crear cuestionario') }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class TeacherQuizFormComponent implements OnInit {
  @Input() courseId!: string;
  @Input() quizId?: string;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  form: FormGroup;
  isEditing = signal(false);
  isLoadingEdit = signal(false);
  isSubmitting = signal(false);
  formError = signal('');

  constructor() {
    this.form = this.fb.group({
      question: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      correctAnswer: ['A', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.quizId) {
      this.isEditing.set(true);
      this.isLoadingEdit.set(true);
      this.http.get<BackendQuiz>(`/api/quizzes/${this.quizId}`).subscribe({
        next: quiz => {
          this.form.patchValue({
            question: quiz.question,
            optionA: quiz.optionA,
            optionB: quiz.optionB,
            optionC: quiz.optionC,
            correctAnswer: quiz.correctAnswer,
          });
          this.isLoadingEdit.set(false);
        },
        error: err => {
          this.isLoadingEdit.set(false);
          this.formError.set(err.error?.message || 'Error al cargar el cuestionario');
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.formError.set('');

    const body = { ...this.form.value, courseId: Number(this.courseId) };

    if (this.isEditing()) {
      this.http.put(`/api/quizzes/${this.quizId}`, body).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/teacher/courses', this.courseId, 'quizzes']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.formError.set(err.error?.message || 'Error al actualizar el cuestionario');
        },
      });
    } else {
      this.http.post('/api/quizzes', body).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/teacher/courses', this.courseId, 'quizzes']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.formError.set(err.error?.message || 'Error al crear el cuestionario');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'quizzes']);
  }
}
