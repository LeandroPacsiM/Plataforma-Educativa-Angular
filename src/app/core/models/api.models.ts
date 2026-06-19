export interface BackendAuthResponse {
  token: string;
  type: string;
  expiresIn: number;
  user: BackendUserInfo;
}

export interface BackendUserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface BackendCourseAuthor {
  id: number;
  name: string;
  email: string;
}

export interface BackendCourse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  lessons: BackendLesson[];
  quizzes: BackendQuiz[];
  author?: BackendCourseAuthor;
}

export interface BackendLesson {
  id: number;
  title: string;
  content: string;
  type: string;
}

export interface BackendQuiz {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  correctAnswer: string;
}

export interface BackendEnrolledCourse {
  course: BackendCourse;
  progressPercent: number;
  completed: boolean;
}

export interface BackendDashboard {
  isAuthenticated: boolean;
  enrolledCourses: BackendEnrolledCourse[];
  availableCourses: BackendCourse[];
}

export interface GoogleTokenRequest {
  idToken: string;
}

export interface BackendCheckoutRequest {
  items: { courseId: number; title: string; price: number; imageUrl: string }[];
}

export interface BackendCheckoutResponse {
  success: boolean;
  message: string;
}

export interface BackendProgress {
  id: number;
  lesson: BackendLesson | null;
  quiz: BackendQuiz | null;
  completed: boolean;
  completionDate: string;
}

export interface BackendError {
  status: number;
  error: string;
  message: string;
  path: string;
}
