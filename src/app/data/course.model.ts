export interface CourseModuleItem {
  id: string;
  type: 'lesson' | 'quiz';
  title: string;
  completed: boolean;
  passed?: boolean;
  /** Lesson text content or video URL */
  content?: string;
  /** "TEXT" or "VIDEO" from backend */
  lessonType?: string;
  // Quiz-specific fields
  question?: string;
  options?: string[];
  correctOptionIndex?: number;
}

export interface CourseModule {
  id: string;
  title: string;
  items: CourseModuleItem[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  price: number;
  modules: CourseModule[];
  author?: string;
}
