const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('nurslab_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('nurslab_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('nurslab_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.detail || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  updateMe: (data: any) => request<any>('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // CMS
  getPublicCMS: () => request<any>('/cms/public', { cache: 'no-cache' }),
  getNavigation: () => request<any[]>('/cms/navigation'),
  updateNavigation: (id: string, data: any) => request<any>(`/cms/navigation/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAllSections: () => request<any[]>('/cms/sections'),
  updateSection: (key: string, data: any) => request<any>(`/cms/sections/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateBlock: (id: string, data: any) => request<any>(`/cms/blocks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Courses
  getCategories: () => request<any[]>('/courses/categories'),
  getInstructors: () => request<any[]>('/courses/instructors'),
  getCourses: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/courses/${qs}`);
  },
  getCourseDetail: (slug: string) => request<any>(`/courses/${slug}`),
  enrollCourse: (courseId: string) => request<any>(`/courses/${courseId}/enroll`, { method: 'POST' }),
  getAdminCourses: () => request<any[]>('/courses/admin/all'),
  createCourse: (data: any) => request<any>('/courses/', { method: 'POST', body: JSON.stringify(data) }),
  updateCourse: (id: string, data: any) => request<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  duplicateCourse: (id: string) => request<any>(`/courses/${id}/duplicate`, { method: 'POST' }),
  deleteCourse: (id: string) => request<any>(`/courses/${id}`, { method: 'DELETE' }),
  createCourseSection: (courseId: string, data: any) => request<any>(`/courses/${courseId}/sections`, { method: 'POST', body: JSON.stringify(data) }),
  updateCourseSection: (sectionId: string, data: any) => request<any>(`/courses/sections/${sectionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCourseSection: (sectionId: string) => request<any>(`/courses/sections/${sectionId}`, { method: 'DELETE' }),
  createLesson: (sectionId: string, data: any) => request<any>(`/courses/sections/${sectionId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  updateLesson: (lessonId: string, data: any) => request<any>(`/courses/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLesson: (lessonId: string) => request<any>(`/courses/lessons/${lessonId}`, { method: 'DELETE' }),

  // Lessons
  getLessonDetail: (lessonId: string) => request<any>(`/lessons/${lessonId}`),

  // Progress
  updateLessonProgress: (lessonId: string, data: { is_completed: boolean; last_position_seconds: number }) =>
    request<any>(`/progress/lesson/${lessonId}`, { method: 'POST', body: JSON.stringify(data) }),
  getStudentDashboard: () => request<any>('/progress/dashboard'),
  createNote: (data: { lesson_id: string; timestamp_seconds: number; content: string }) =>
    request<any>('/progress/notes', { method: 'POST', body: JSON.stringify(data) }),
  getLessonNotes: (lessonId: string) => request<any[]>(`/progress/notes/${lessonId}`),

  // Quizzes
  getQuizByLesson: (lessonId: string) => request<any>(`/quizzes/by-lesson/${lessonId}`),
  submitQuiz: (quizId: string, answers: any[]) =>
    request<any>(`/quizzes/${quizId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Certificates
  getMyCertificates: () => request<any[]>('/certificates/my'),
  verifyCertificate: (code: string) => request<any>(`/certificates/verify/${code}`),

  // Payments & Invoices
  getPricingPlans: () => request<any[]>('/payments/plans'),
  checkout: (data: any) => request<any>('/payments/checkout', { method: 'POST', body: JSON.stringify(data) }),
  getMyInvoices: () => request<any[]>('/payments/invoices/my'),

  // Workshops
  getWorkshopCities: () => request<any[]>('/workshops/cities'),
  getWorkshopTopics: () => request<any[]>('/workshops/topics'),
  submitWorkshopInterest: (data: any) => request<any>('/workshops/interest', { method: 'POST', body: JSON.stringify(data) }),
  getAdminWorkshopRegistrations: () => request<any[]>('/workshops/admin/registrations'),
  updateWorkshopRegistrationStatus: (id: string, status: string) =>
    request<any>(`/workshops/admin/registrations/${id}/status?status_str=${status}`, { method: 'PUT' }),

  // Home Nursing
  getHomeNursingServices: () => request<any[]>('/home-nursing/services'),
  submitHomeNursingRequest: (data: any) => request<any>('/home-nursing/request', { method: 'POST', body: JSON.stringify(data) }),
  getAdminHomeNursingRequests: () => request<any[]>('/home-nursing/admin/requests'),
  updateHomeNursingStatus: (id: string, status: string) =>
    request<any>(`/home-nursing/admin/requests/${id}/status?status_str=${status}`, { method: 'PUT' }),

  // Articles
  getArticles: (categorySlug?: string) => {
    const qs = categorySlug ? `?category_slug=${categorySlug}` : '';
    return request<any[]>(`/articles/${qs}`);
  },
  getArticleCategories: () => request<any[]>('/articles/categories'),
  getArticleBySlug: (slug: string) => request<any>(`/articles/${slug}`),

  // Webinars & Speakers
  getWebinars: () => request<any[]>('/webinars/'),
  getSpeakers: () => request<any[]>('/webinars/speakers'),
  getSpeakerDetail: (speakerId: string) => request<any>(`/webinars/speakers/${speakerId}`),
  registerWebinar: (webinarId: string) => request<any>('/webinars/register', { method: 'POST', body: JSON.stringify({ webinar_id: webinarId }) }),
  getAdminWebinars: () => request<any[]>('/webinars/admin/all'),
  createWebinar: (data: any) => request<any>('/webinars/', { method: 'POST', body: JSON.stringify(data) }),
  updateWebinar: (id: string, data: any) => request<any>(`/webinars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWebinar: (id: string) => request<any>(`/webinars/${id}`, { method: 'DELETE' }),
  createSpeaker: (data: any) => request<any>('/webinars/speakers', { method: 'POST', body: JSON.stringify(data) }),
  updateSpeaker: (id: string, data: any) => request<any>(`/webinars/speakers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSpeaker: (id: string) => request<any>(`/webinars/speakers/${id}`, { method: 'DELETE' }),

  // Global Search
  searchGlobal: (query: string) => request<any>(`/search/?q=${encodeURIComponent(query)}`),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: (search?: string) => {
    const qs = search ? `?search=${search}` : '';
    return request<any[]>(`/admin/users${qs}`);
  },
  updateUserRole: (userId: string, role: string) =>
    request<any>(`/admin/users/${userId}/role?new_role=${role}`, { method: 'PUT' }),
  getAdminOrders: () => request<any[]>('/admin/orders'),

  // Media
  uploadMedia: (formData: FormData) => request<any>('/media/upload', { method: 'POST', body: formData }),
  getMediaAssets: () => request<any[]>('/media/'),
};
