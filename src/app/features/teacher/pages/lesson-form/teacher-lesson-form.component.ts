import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendLesson } from '../../../../core/models/api.models';

@Component({
  selector: 'app-teacher-lesson-form',
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
    input, textarea, select { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; background: var(--bg); color: var(--fg); outline: none; box-sizing: border-box; font-family: inherit; }
    input:focus, textarea:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
    textarea { min-height: 10rem; resize: vertical; }
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
  `],
  template: `
    <div class="page">
      <div class="container">
        <button class="back-link" (click)="goBack()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Volver a lecciones
        </button>

        <h1 class="title">{{ isEditing() ? 'Editar lecci&oacute;n' : 'Nueva lecci&oacute;n' }}</h1>

        @if (formError()) {
          <div class="error-msg">{{ formError() }}</div>
        }

        @if (isLoadingEdit()) {
          <div class="loading-state">Cargando datos de la lecci&oacute;n...</div>
        } @else {
          <div class="card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="title">T&iacute;tulo de la lecci&oacute;n</label>
                <input id="title" type="text" formControlName="title" placeholder="Ej: Introducci&oacute;n a Java" />
                @if (form.get('title')?.invalid && form.get('title')?.touched) {
                  <div class="field-error">El t&iacute;tulo es obligatorio</div>
                }
              </div>

              <div class="form-group">
                <label for="type">Tipo</label>
                <select id="type" formControlName="type">
                  <option value="TEXT">Texto</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>

              <div class="form-group">
                <label for="content">
                  {{ form.get('type')?.value === 'VIDEO' ? 'URL del video' : 'Contenido' }}
                </label>
                @if (form.get('type')?.value === 'VIDEO') {
                  <input id="content" type="url" formControlName="content" placeholder="https://www.youtube.com/watch?v=VIDEO_ID" />
                } @else {
                  <textarea id="content" formControlName="content" placeholder="Escribe el contenido de la lecci&oacute;n aqu&iacute;..."></textarea>
                }
                @if (form.get('content')?.invalid && form.get('content')?.touched) {
                  <div class="field-error">El contenido es obligatorio</div>
                }
              </div>

              <div class="actions">
                <button type="button" class="btn btn-cancel" (click)="goBack()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting()">
                  {{ isSubmitting() ? 'Guardando...' : (isEditing() ? 'Actualizar lecci&oacute;n' : 'Crear lecci&oacute;n') }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class TeacherLessonFormComponent implements OnInit {
  @Input() courseId!: string;
  @Input() lessonId?: string;

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
      title: ['', Validators.required],
      content: ['', Validators.required],
      type: ['TEXT', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.lessonId) {
      this.isEditing.set(true);
      this.isLoadingEdit.set(true);
      this.http.get<BackendLesson>(`/api/lessons/${this.lessonId}`).subscribe({
        next: lesson => {
          this.form.patchValue({
            title: lesson.title,
            content: lesson.content,
            type: lesson.type,
          });
          this.isLoadingEdit.set(false);
        },
        error: err => {
          this.isLoadingEdit.set(false);
          this.formError.set(err.error?.message || 'Error al cargar la lecci&oacute;n');
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
      this.http.put(`/api/lessons/${this.lessonId}`, body).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/teacher/courses', this.courseId, 'lessons']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.formError.set(err.error?.message || 'Error al actualizar la lecci&oacute;n');
        },
      });
    } else {
      this.http.post('/api/lessons', body).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/teacher/courses', this.courseId, 'lessons']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.formError.set(err.error?.message || 'Error al crear la lecci&oacute;n');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses', this.courseId, 'lessons']);
  }
}
