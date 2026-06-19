import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';
import { teacherGuard } from './core/guards/teacher.guard';
import { adminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [publicGuard],
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        canActivate: [publicGuard],
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'courses',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/courses/pages/courses-list/courses-list.component').then(m => m.CoursesListComponent),
      },
      {
        path: 'course-details/:courseId',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/courses/pages/course-landing/course-landing.component').then(m => m.CourseLandingComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/cart/pages/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'progress',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/progress/pages/progress/progress.component').then(m => m.ProgressComponent),
      },
      {
        path: 'certificates',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/certificates/pages/certificates/certificates.component').then(m => m.CertificatesComponent),
      },
      {
        path: 'course/:courseId',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/courses/pages/course-layout/course-layout.component').then(m => m.CourseLayoutComponent),
        children: [
          { path: 'lesson/:lessonId', loadComponent: () => import('./features/courses/pages/lesson-view/lesson-view.component').then(m => m.LessonViewComponent) },
          { path: 'quiz/:quizId', loadComponent: () => import('./features/courses/pages/quiz-view/quiz-view.component').then(m => m.QuizViewComponent) },
        ],
      },
      {
        path: 'teacher',
        canActivate: [authGuard, teacherGuard],
        loadComponent: () => import('./features/teacher/pages/teacher-layout/teacher-layout.component').then(m => m.TeacherLayoutComponent),
        children: [
          { path: 'courses', loadComponent: () => import('./features/teacher/pages/courses-list/teacher-courses-list.component').then(m => m.TeacherCoursesListComponent) },
          { path: 'courses/new', loadComponent: () => import('./features/teacher/pages/course-form/teacher-course-form.component').then(m => m.TeacherCourseFormComponent) },
          { path: 'courses/:courseId/edit', loadComponent: () => import('./features/teacher/pages/course-form/teacher-course-form.component').then(m => m.TeacherCourseFormComponent) },
          { path: 'courses/:courseId/lessons', loadComponent: () => import('./features/teacher/pages/lessons-manager/teacher-lessons-manager.component').then(m => m.TeacherLessonsManagerComponent) },
          { path: 'courses/:courseId/lessons/new', loadComponent: () => import('./features/teacher/pages/lesson-form/teacher-lesson-form.component').then(m => m.TeacherLessonFormComponent) },
          { path: 'courses/:courseId/lessons/:lessonId/edit', loadComponent: () => import('./features/teacher/pages/lesson-form/teacher-lesson-form.component').then(m => m.TeacherLessonFormComponent) },
          { path: 'courses/:courseId/quizzes', loadComponent: () => import('./features/teacher/pages/quizzes-manager/teacher-quizzes-manager.component').then(m => m.TeacherQuizzesManagerComponent) },
          { path: 'courses/:courseId/quizzes/new', loadComponent: () => import('./features/teacher/pages/quiz-form/teacher-quiz-form.component').then(m => m.TeacherQuizFormComponent) },
          { path: 'courses/:courseId/quizzes/:quizId/edit', loadComponent: () => import('./features/teacher/pages/quiz-form/teacher-quiz-form.component').then(m => m.TeacherQuizFormComponent) },
          { path: '', redirectTo: 'courses', pathMatch: 'full' },
        ],
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () => import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
        children: [
          { path: 'users', loadComponent: () => import('./features/admin/pages/users-list/users-list.component').then(m => m.AdminUsersListComponent) },
          { path: 'users/new', loadComponent: () => import('./features/admin/pages/user-form/user-form.component').then(m => m.AdminUserFormComponent) },
          { path: 'users/:userId/edit', loadComponent: () => import('./features/admin/pages/user-form/user-form.component').then(m => m.AdminUserFormComponent) },
          { path: '', redirectTo: 'users', pathMatch: 'full' },
        ],
      },
      {
        path: '',
        canActivate: [publicGuard],
        loadComponent: () =>
          import('./features/home/pages/home/home.component').then(m => m.HomeComponent),
      },
    ],
  },
];
