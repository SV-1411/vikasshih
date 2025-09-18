export interface Course {
  id: string;
  title: string;
  description: string;
  language: string;
  version: string;
  channel_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  course_code?: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  created_at: string;
}

export interface Lesson {
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