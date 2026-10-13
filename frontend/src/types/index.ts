export type UserRole = 'super_admin' | 'admin' | 'content_editor' | 'instructor' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  phone?: string;
  avatar_url?: string;
  hospital_affiliation?: string;
  nursing_specialty?: string;
  bio?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'article' | 'quiz' | 'workshop';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  display_order: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  cover_image?: string;
  category_id?: string;
  category_name?: string;
  instructor_name?: string;
  difficulty: CourseDifficulty;
  estimated_hours: number;
  is_free: boolean;
  price: number;
  currency: string;
  is_published: boolean;
  status?: string;
  featured: boolean;
  has_certificate: boolean;
  total_lessons_count?: number;
  metadata_json?: Record<string, any>;
}

export interface LessonSummary {
  id: string;
  title: string;
  slug: string;
  lesson_type: LessonType;
  duration_minutes: number;
  is_preview: boolean;
  order_index: number;
  has_quiz?: boolean;
}

export interface SectionSummary {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons: LessonSummary[];
}

export interface CourseDetail extends Course {
  full_description: string;
  preview_video_url?: string;
  category?: Category;
  instructor_id?: string;
  instructor_specialty?: string;
  completion_threshold_percent: number;
  sections: SectionSummary[];
  is_enrolled?: boolean;
  progress_percent?: number;
}

export interface LessonResource {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  file_size_bytes: number;
}

export interface LessonDetail {
  id: string;
  section_id: string;
  course_id: string;
  course_title: string;
  title: string;
  slug: string;
  description?: string;
  lesson_type: LessonType;
  video_url?: string;
  duration_minutes: number;
  is_preview: boolean;
  order_index: number;
  content_markdown?: string;
  resources: LessonResource[];
  is_completed?: boolean;
  last_position_seconds?: number;
  next_lesson_id?: string;
  prev_lesson_id?: string;
}

export interface CMSContentBlock {
  id: string;
  section_key: string;
  block_key: string;
  title: string;
  content?: string;
  image_url?: string;
  link_label?: string;
  link_url?: string;
  badge?: string;
  badge_variant: string;
  icon?: string;
  display_order: number;
  is_active: boolean;
  metadata_json?: Record<string, any>;
}

export interface CMSSection {
  id: string;
  section_key: string;
  title: string;
  subtitle?: string;
  kicker?: string;
  is_visible: boolean;
  display_order: number;
  metadata_json?: Record<string, any>;
  blocks: CMSContentBlock[];
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order_index: number;
  is_visible: boolean;
  is_button: boolean;
  target_blank: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  billing_interval: 'monthly' | 'annual' | 'lifetime';
  price: number;
  currency: string;
  features_json: string[];
  badge?: string;
}

export interface WorkshopCity {
  id: string;
  name: string;
  county?: string;
  display_order: number;
}

export interface WorkshopTopic {
  id: string;
  title: string;
  slug: string;
  description?: string;
}

export interface WorkshopInterestRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city_name: string;
  topic_title: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface HomeNursingService {
  id: string;
  title: string;
  description: string;
  price_estimate?: string;
  icon: string;
  display_order: number;
}

export interface HomeNursingRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  service_type: string;
  patient_condition?: string;
  urgency_level: string;
  preferred_date?: string;
  status: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown?: string;
  cover_image?: string;
  author_name: string;
  category_id?: string;
  category_name?: string;
  reading_time_minutes: number;
  published_at: string;
}

export interface Speaker {
  id: string;
  full_name: string;
  title: string;
  hospital?: string;
  bio?: string;
  photo_url?: string;
  metadata_json?: Record<string, any>;
}

export interface SpeakerDetail extends Speaker {
  webinars: Webinar[];
}

export interface Webinar {
  id: string;
  title: string;
  slug: string;
  description: string;
  webinar_type: string;
  badge: string;
  scheduled_at: string;
  duration_minutes: number;
  cover_image?: string;
  speaker?: Speaker;
  is_free: boolean;
  recording_url?: string;
  is_registered?: boolean;
  is_published?: boolean;
  metadata_json?: Record<string, any>;
}

export interface LessonAdmin {
  id: string;
  section_id: string;
  title: string;
  slug: string;
  description?: string;
  lesson_type: LessonType;
  video_url?: string;
  duration_minutes: number;
  is_preview: boolean;
  order_index: number;
  is_published: boolean;
  content_markdown?: string;
}

export interface CourseSectionAdmin {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons: LessonAdmin[];
}

export interface CourseAdmin {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  cover_image?: string;
  preview_video_url?: string;
  category_id?: string;
  category_name?: string;
  instructor_id?: string;
  instructor_name?: string;
  instructor_specialty?: string;
  difficulty: CourseDifficulty;
  estimated_hours: number;
  is_free: boolean;
  price: number;
  currency: string;
  is_published: boolean;
  status: string;
  featured: boolean;
  has_certificate: boolean;
  completion_threshold_percent: number;
  metadata_json: Record<string, any>;
  total_sections_count: number;
  total_lessons_count: number;
  sections: CourseSectionAdmin[];
  created_at?: string;
  updated_at?: string;
}

export interface InstructorOption {
  id: string;
  full_name: string;
  email: string;
  specialty?: string;
}

export interface Certificate {
  id: string;
  certificate_code: string;
  student_name: string;
  course_title: string;
  instructor_name: string;
  issue_date: string;
  pdf_url?: string;
  verification_url?: string;
}

export interface Note {
  id: string;
  lesson_id: string;
  timestamp_seconds: number;
  content: string;
  created_at: string;
}

export interface QuizOption {
  id: string;
  option_text: string;
  order_index: number;
}

export interface QuizQuestion {
  id: string;
  question_text: string;
  order_index: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  passing_score_percent: number;
  max_attempts: number;
  questions: QuizQuestion[];
}

export interface QuizResult {
  quiz_id: string;
  score_percent: number;
  passed: boolean;
  passing_score_percent: number;
  attempt_number: number;
  feedback: {
    question_id: string;
    is_correct: boolean;
    explanation?: string;
    correct_option_id: string;
  }[];
  certificate_generated?: boolean;
  certificate_code?: string;
}

export interface StudentStats {
  total_enrolled: number;
  completed_courses: number;
  certificates_earned: number;
  active_subscriptions: number;
  in_progress_courses: {
    course_id: string;
    course_title: string;
    course_slug: string;
    cover_image?: string;
    progress_percent: number;
    is_completed: boolean;
    enrolled_at: string;
    completed_at?: string;
  }[];
}

export interface Invoice {
  id: string;
  order_number: string;
  invoice_series: string;
  invoice_number: number;
  full_invoice_number: string;
  issue_date: string;
  total_amount: number;
  vat_amount: number;
  currency: string;
  status: string;
  pdf_url?: string;
  customer_name: string;
  company_cui?: string;
}

export interface AdminStats {
  total_users: number;
  active_subscribers: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue_ron: number;
  pending_workshop_leads: number;
  pending_home_nursing_leads: number;
  certificates_issued: number;
}
