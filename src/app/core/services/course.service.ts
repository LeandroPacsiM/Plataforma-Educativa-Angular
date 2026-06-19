import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { BackendCourse, BackendDashboard, BackendEnrolledCourse } from '../models/api.models';
import { mapBackendCourse } from '../../data/mappers';
import { Course } from '../../data/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);

  getCourses() {
    return this.http.get<BackendCourse[]>('/api/courses').pipe(
      map(courses => courses.map(bc => mapBackendCourse(bc)))
    );
  }

  getCourseById(id: string) {
    return this.http.get<BackendCourse>(`/api/courses/${id}`).pipe(
      map(bc => mapBackendCourse(bc))
    );
  }

  getDashboard() {
    return this.http.get<BackendDashboard>('/api/dashboard/home');
  }

  completeItem(type: 'lesson' | 'quiz', id: number) {
    const paramName = type === 'lesson' ? 'lessonId' : 'quizId';
    return this.http.post<{ success: boolean }>('/api/progress/complete', null, {
      params: { [paramName]: String(id) }
    });
  }

  completeLesson(lessonId: number) {
    return this.completeItem('lesson', lessonId);
  }

  completeQuiz(quizId: number) {
    return this.completeItem('quiz', quizId);
  }

  mapEnrolledCourses(enrolled: BackendEnrolledCourse[]): { course: Course; progressPercent: number; completed: boolean }[] {
    return enrolled.map(ec => ({
      course: mapBackendCourse(ec.course, ec.progressPercent),
      progressPercent: ec.progressPercent,
      completed: ec.completed,
    }));
  }

  mapAvailableCourses(available: BackendCourse[]): Course[] {
    return available.map(bc => mapBackendCourse(bc));
  }
}
