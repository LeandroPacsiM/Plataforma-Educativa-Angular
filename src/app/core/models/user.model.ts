export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  purchasedCourses: string[];
  role?: string;
}
