import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CourseService } from '../../../../core/services/course.service';

@Component({
  selector: 'app-certificates',
  styles: [`
    .page { flex: 1; background: var(--bg-alt); padding: 1.5rem; }
    @media (min-width: 768px) { .page { padding: 2.5rem; } }
    .container { max-width: 72rem; margin: 0 auto; }
    .loading { text-align: center; padding: 3rem; color: var(--fg-subtle); }
    .header { margin-bottom: 2rem; }
    .header h1 { font-size: 1.875rem; font-weight: 700; color: var(--fg); margin-bottom: 0.5rem; }
    .header p { color: var(--fg-subtle); max-width: 36rem; }

    .grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    @media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }

    .card { background: var(--card); border-radius: 0.75rem; border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column; align-items: center; padding: 2rem 1.5rem; text-align: center; transition: box-shadow 0.2s; }
    .card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .award { width: 5rem; height: 5rem; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
    .award svg { color: #d97706; }
    .card h3 { font-weight: 700; font-size: 1.125rem; color: var(--fg); margin-bottom: 0.5rem; }
    .card p { font-size: 0.875rem; color: var(--fg-subtle); margin-bottom: 2rem; }
    .btn { margin-top: auto; width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; background: var(--fg); color: var(--bg); border: none; padding: 0.625rem; border-radius: 0.375rem; font-weight: 500; font-size: 0.875rem; cursor: pointer; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }

    .empty-state { grid-column: 1 / -1; padding: 4rem; text-align: center; background: var(--card); border-radius: 0.75rem; border: 2px dashed var(--border); display: flex; flex-direction: column; align-items: center; }
    .empty-icon { color: var(--fg-subtle); margin-bottom: 1rem; }
    .empty-state h3 { font-size: 1.125rem; font-weight: 700; color: var(--fg); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--fg-subtle); max-width: 24rem; margin: 0 auto; }
  `],
  template: `
    <div class="page">
      <div class="container">
        <div class="header">
          <h1>Mis Certificados</h1>
          <p>Descarga los certificados de los cursos que has completado al 100% y con los cuestionarios aprobados.</p>
        </div>

        @if (loading()) {
          <div class="loading">Cargando certificados...</div>
        } @else {
          <div class="grid">
            @for (item of completedList(); track item.course.id) {
              <div class="card">
                <div class="award">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                </div>
                <h3>{{ item.course.title }}</h3>
                <p>Completado con &eacute;xito. Todas las evaluaciones aprobadas.</p>
                <button class="btn" (click)="downloadPdf(item.course.id, item.course.title)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Descargar PDF
                </button>
              </div>
            } @empty {
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                </div>
                <h3>A&uacute;n no tienes certificados</h3>
                <p>Completa un curso al 100% y aprueba sus cuestionarios para desbloquear tu certificado aqu&iacute;.</p>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CertificatesComponent implements OnInit {
  private http = inject(HttpClient);
  private courseSvc = inject(CourseService);

  loading = signal(true);
  completedList = signal<{ course: import('../../../../data/course.model').Course; progressPercent: number; completed: boolean }[]>([]);

  ngOnInit(): void {
    this.courseSvc.getDashboard().subscribe({
      next: data => {
        this.completedList.set(
          this.courseSvc.mapEnrolledCourses(data.enrolledCourses).filter(e => e.completed)
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  downloadPdf(courseId: string, courseTitle: string): void {
    this.http.get(`/api/certificates/issue?courseId=${courseId}`, {}).subscribe({
      next: (cert: any) => {
        this.http.get(`/api/certificates/${cert.id}/download`, { responseType: 'blob' }).subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${courseTitle.replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
      },
      error: () => {
        alert('Error al generar el certificado. Asegúrate de haber completado todas las lecciones y quizzes.');
      }
    });
  }
}
