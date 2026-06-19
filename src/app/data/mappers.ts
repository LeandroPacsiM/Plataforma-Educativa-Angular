import { Course, CourseModule, CourseModuleItem } from './course.model';
import { BackendCourse } from '../core/models/api.models';

export function mapBackendCourse(bc: BackendCourse, progressPercent = 0, completedLessons: Set<string> = new Set()): Course {
  const items: CourseModuleItem[] = [];

  if (bc.lessons) {
    for (const l of bc.lessons) {
      const id = `l${l.id}`;
      items.push({
        id,
        type: 'lesson',
        title: l.title,
        content: l.content,
        lessonType: l.type,
        completed: completedLessons.has(id),
      });
    }
  }

  if (bc.quizzes) {
    for (const q of bc.quizzes) {
      const id = `q${q.id}`;
      const options = [q.optionA, q.optionB, q.optionC];
      const correctIndex = q.correctAnswer === 'A' ? 0 : q.correctAnswer === 'B' ? 1 : 2;
      items.push({
        id,
        type: 'quiz',
        title: q.question,
        completed: completedLessons.has(id),
        passed: completedLessons.has(id),
        question: q.question,
        options,
        correctOptionIndex: correctIndex,
      });
    }
  }

  const modules: CourseModule[] = items.length > 0
    ? [{ id: `m${bc.id}`, title: 'Contenido del curso', items }]
    : [];

  return {
    id: String(bc.id),
    title: bc.title,
    description: bc.description,
    image: bc.imageUrl,
    price: bc.price,
    progress: progressPercent,
    modules,
    author: bc.author?.name,
  };
}
