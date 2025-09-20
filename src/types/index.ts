export interface Course {
  _id?: string;
  id: string;
  title: string;
  description: string;
  language: string;
  version: string;
  channel_id: string;
  created_by: string;
  updated_at: string;
  course_code?: string;
}

export interface Module {
  _id?: string;
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  created_at: string;
}

export interface Lesson {
  _id?: string;
  id: string;
  module_id: string;
  title: string;
  type: 'audio' | 'video' | 'text' | 'interactive';
  content_ref: string;
  duration?: number;
  size?: number;
  checksum?: string;
  transcript?: string;
  order: number;
  created_at: string;
}

export interface Activity {
  id: string;
  lesson_id: string;
  type: 'quiz' | 'exercise' | 'assignment';
  schema: ExerciseSchema;
  title: string;
  order: number;
  created_at: string;
}

export interface ExerciseSchema {
  type: 'mcq' | 'multi-select' | 'fill-blank' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string | string[] | number;
  explanation?: string;
  points: number;
}

export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  group_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface ProgressEvent {
  id: string;
  user_id: string;
  lesson_id: string;
  activity_id?: string;
  timestamp: string;
  status: 'started' | 'completed' | 'failed' | 'reviewed';
  score?: number;
  attempts: number;
  time_spent?: number;
  data?: Record<string, any>;
  synced: boolean;
}

export interface Manifest {
  channel_id: string;
  version: string;
  title: string;
  description?: string;
  created_at: string;
  language: string;
  resources: Resource[];
  deltas?: Delta[];
}

export interface Resource {
  id: string;
  type: 'audio' | 'video' | 'text' | 'exercise' | 'image';
  path: string;
  sha256: string;
  size: number;
  metadata?: Record<string, any>;
}

export interface Delta {
  version: string;
  created_at: string;
  changes: ChangeItem[];
}

export interface ChangeItem {
  operation: 'add' | 'update' | 'delete';
  resource_id: string;
  path?: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  total_xp: number;
  current_level: number;
  streak_days: number;
  last_activity: string;
  completed_lessons: string[];
  skill_levels: Record<string, number>;
}

export interface TestSubmission {
  id: string;
  user_id: string;
  test_id: string;
  answers: Record<string, any>;
  score?: number;
  submitted_at: string;
  synced: boolean;
}

export interface TeacherStudentConnection {
  id: string;
  teacher_id: string;
  student_id: string;
  connected_at: string;
  status: 'active' | 'pending' | 'inactive';
  shared_courses: string[];
}

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'inactive' | 'completed';
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
}

export interface LearningPath {
  user_id: string;
  course_id: string;
  current_lesson_id: string;
  recommended_lessons: string[];
  mastery_levels: Record<string, number>;
  next_review_date: string;
  learning_mode: 'adaptive' | 'teacher_content';
  adaptive_difficulty: number; // 1-10 scale
  spaced_repetition_schedule: Record<string, string>; // lesson_id -> next_review_date
}

export interface SyncStatus {
  last_sync: string;
  status: 'idle' | 'syncing' | 'error';
  pending_changes: number;
  conflicts: number;
}

export interface AdaptiveLearningNode {
  id: string;
  title: string;
  description: string;
  difficulty_level: number; // 1-10
  prerequisites: string[]; // Other node IDs
  learning_objectives: string[];
  estimated_time: number; // minutes
  content_type: 'concept' | 'practice' | 'assessment';
  mastery_threshold: number; // 0-100%
  spaced_repetition_interval: number; // days
}

// Educational Platform Types
export interface College {
  id: string;
  name: string;
  code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  college_id?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  group_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  code: string;
  teacher_id: string;
  college_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
  members_count?: number;
  member_ids?: string[];
}

export interface ClassroomMember {
  id: string;
  classroom_id: string;
  student_id: string;
  joined_at: string;
  is_active: boolean;
  student?: Profile;
}

export interface Assignment {
  id: string;
  classroom_id: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  max_points: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  classroom?: Classroom;
  submissions_count?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content?: string;
  file_urls: string[];
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  student?: Profile;
  assignment?: Assignment;
}

export interface Quiz {
  id: string;
  classroom_id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  time_limit?: number;
  max_attempts: number;
  is_published: boolean;
  due_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  classroom?: Classroom;
  attempts_count?: number;
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'multi-select' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correct_answer: string | string[] | number;
  points: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, any>;
  score?: number;
  max_score?: number;
  started_at: string;
  submitted_at?: string;
  time_taken?: number;
  attempt_number: number;
  student?: Profile;
  quiz?: Quiz;
}

export interface Poll {
  id: string;
  classroom_id: string;
  question: string;
  options: PollOption[];
  is_active: boolean;
  is_anonymous: boolean;
  multiple_choice: boolean;
  created_by: string;
  created_at: string;
  ends_at?: string;
  classroom?: Classroom;
  responses_count?: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

export interface PollResponse {
  id: string;
  poll_id: string;
  student_id: string;
  selected_options: number[];
  responded_at: string;
  student?: Profile;
}

export interface LiveLecture {
  id: string;
  classroom_id: string;
  college_id: string;
  title: string;
  description?: string;
  teacher_id: string;
  scheduled_at: string;
  duration?: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  meeting_url?: string;
  recording_url?: string;
  created_at: string;
  updated_at: string;
  teacher?: Profile;
  classroom?: Classroom;
  attendees_count?: number;
}

export interface LectureAttendee {
  id: string;
  lecture_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  duration_attended?: number;
  user?: Profile;
}

export interface ClassroomChat {
  id: string;
  classroom_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'file' | 'image' | 'announcement';
  file_urls: string[];
  reply_to?: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  sender?: Profile;
  reply_message?: ClassroomChat;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'quiz' | 'poll' | 'lecture' | 'chat' | 'announcement';
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Form Types
export interface CollegeRegistrationForm {
  name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface UserRegistrationForm {
  full_name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
  college_code: string;
  phone?: string;
}

export interface ClassroomForm {
  name: string;
  description?: string;
  subject?: string;
}

export interface AssignmentForm {
  title: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  max_points: number;
}

export interface QuizForm {
  title: string;
  description?: string;
  questions: QuizQuestion[];
  time_limit?: number;
  max_attempts: number;
  due_date?: string;
}

export interface PollForm {
  question: string;
  options: string[];
  is_anonymous: boolean;
  multiple_choice: boolean;
  ends_at?: string;
}

export interface LiveLectureForm {
  title: string;
  description?: string;
  scheduled_at: string;
  duration?: number;
}