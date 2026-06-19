import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendCourse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-teacher-course-form',
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
    input, textarea { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--border); border-radius: 0.5rem; font-size: 0.875rem; background: var(--bg); color: var(--fg); outline: none; box-sizing: border-box; font-family: inherit; }
    input:focus, textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-bg); }
    textarea { min-height: 6rem; resize: vertical; }
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
  `],
  template: `
    <div class="page">
      <div class="container">
        <h1 class="title">{{ isEditing() ? 'Editar curso' : 'Nuevo curso' }}</h1>

        @if (formError()) {
          <div class="error-msg">{{ formError() }}</div>
        }

        @if (isLoadingEdit()) {
          <div class="loading-state">Cargando datos del curso...</div>
        } @else {
          <div class="card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="form-group">
                <label for="title">T&iacute;tulo del curso</label>
                <input id="title" type="text" formControlName="title" placeholder="Ej: Java desde cero" />
                @if (form.get('title')?.invalid && form.get('title')?.touched) {
                  <div class="field-error">El t&iacute;tulo es obligatorio</div>
                }
              </div>

              <div class="form-group">
                <label for="description">Descripci&oacute;n</label>
                <textarea id="description" formControlName="description" placeholder="Describe el contenido del curso"></textarea>
                @if (form.get('description')?.invalid && form.get('description')?.touched) {
                  <div class="field-error">La descripci&oacute;n es obligatoria</div>
                }
              </div>

              <div class="form-group">
                <label for="imageUrl">URL de la imagen</label>
                <input id="imageUrl" type="text" formControlName="imageUrl" placeholder="https://ejemplo.com/imagen.jpg" />
              </div>

              <div class="form-group">
                <label for="price">Precio (\$)</label>
                <input id="price" type="number" formControlName="price" step="0.01" min="0" placeholder="0.00" />
                @if (form.get('price')?.invalid && form.get('price')?.touched) {
                  <div class="field-error">Ingresa un precio v&aacute;lido</div>
                }
              </div>

              <div class="actions">
                <button type="button" class="btn btn-cancel" (click)="goBack()">Cancelar</button>
                <button type="submit" class="btn btn-primary" [disabled]="form.invalid || isSubmitting()">
                  {{ isSubmitting() ? 'Guardando...' : (isEditing() ? 'Actualizar curso' : 'Crear curso') }}
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `
})
export class TeacherCourseFormComponent implements OnInit {
  @Input() courseId?: string;

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
      description: ['', Validators.required],
      imageUrl: [''],
      price: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    if (this.courseId) {
      this.isEditing.set(true);
      this.isLoadingEdit.set(true);
      this.http.get<BackendCourse>(`/api/courses/${this.courseId}`).subscribe({
        next: bc => {
          this.form.patchValue({
            title: bc.title,
            description: bc.description,
            imageUrl: bc.imageUrl,
            price: bc.price,
          });
          this.isLoadingEdit.set(false);
        },
        error: err => {
          this.isLoadingEdit.set(false);
          this.formError.set(err.error?.message || 'Error al cargar el curso');
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    this.formError.set('');

    const body = this.form.value;

    if (this.isEditing()) {
      this.http.put(`/api/courses/${this.courseId}`, body).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/teacher/courses']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.formError.set(err.error?.message || 'Error al actualizar el curso');
        },
      });
    } else {
      this.http.post('/api/courses', body).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/teacher/courses']);
        },
        error: err => {
          this.isSubmitting.set(false);
          this.formError.set(err.error?.message || 'Error al crear el curso');
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/teacher/courses']);
  }
}
