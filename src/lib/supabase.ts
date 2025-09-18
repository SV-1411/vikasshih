import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('Supabase environment variables not configured. Running in offline-only mode.');
  // Create a mock client that throws errors for any operation
  supabase = {
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
      signUp: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    from: () => ({
      select: () => Promise.reject(new Error('Supabase not configured')),
      insert: () => Promise.reject(new Error('Supabase not configured')),
      update: () => Promise.reject(new Error('Supabase not configured')),
      upsert: () => Promise.reject(new Error('Supabase not configured')),
      delete: () => Promise.reject(new Error('Supabase not configured'))
    })
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Database types
export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          language: string;
          version: string;
          channel_id: string;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          language?: string;
          version?: string;
          channel_id: string;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          language?: string;
          version?: string;
          channel_id?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          order?: number;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          type: 'audio' | 'video' | 'text' | 'interactive';
          content_ref: string;
          duration: number | null;
          size: number | null;
          checksum: string | null;
          transcript: string | null;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          type: 'audio' | 'video' | 'text' | 'interactive';
          content_ref: string;
          duration?: number | null;
          size?: number | null;
          checksum?: string | null;
          transcript?: string | null;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          type?: 'audio' | 'video' | 'text' | 'interactive';
          content_ref?: string;
          duration?: number | null;
          size?: number | null;
          checksum?: string | null;
          transcript?: string | null;
          order?: number;
        };
      };
      activities: {
        Row: {
          id: string;
          lesson_id: string;
          type: 'quiz' | 'exercise' | 'assignment';
          title: string;
          schema: any;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          type: 'quiz' | 'exercise' | 'assignment';
          title: string;
          schema: any;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          type?: 'quiz' | 'exercise' | 'assignment';
          title?: string;
          schema?: any;
          order?: number;
        };
      };
      progress_events: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          activity_id: string | null;
          timestamp: string;
          status: 'started' | 'completed' | 'failed' | 'reviewed';
          score: number | null;
          attempts: number;
          time_spent: number | null;
          data: any | null;
          synced: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          activity_id?: string | null;
          timestamp?: string;
          status: 'started' | 'completed' | 'failed' | 'reviewed';
          score?: number | null;
          attempts?: number;
          time_spent?: number | null;
          data?: any | null;
          synced?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          activity_id?: string | null;
          timestamp?: string;
          status?: 'started' | 'completed' | 'failed' | 'reviewed';
          score?: number | null;
          attempts?: number;
          time_spent?: number | null;
          data?: any | null;
          synced?: boolean;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          total_xp: number;
          current_level: number;
          streak_days: number;
          last_activity: string;
          completed_lessons: string[];
          skill_levels: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          total_xp?: number;
          current_level?: number;
          streak_days?: number;
          last_activity?: string;
          completed_lessons?: string[];
          skill_levels?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          total_xp?: number;
          current_level?: number;
          streak_days?: number;
          last_activity?: string;
          completed_lessons?: string[];
          skill_levels?: any;
        };
      };
      teacher_student_connections: {
        Row: {
          id: string;
          teacher_id: string;
          student_id: string;
          connected_at: string;
          status: 'active' | 'pending' | 'inactive';
          shared_courses: string[];
        };
        Insert: {
          id?: string;
          teacher_id: string;
          student_id: string;
          connected_at?: string;
          status?: 'active' | 'pending' | 'inactive';
          shared_courses?: string[];
        };
        Update: {
          id?: string;
          teacher_id?: string;
          student_id?: string;
          connected_at?: string;
          status?: 'active' | 'pending' | 'inactive';
          shared_courses?: string[];
        };
      };
    };
  };
}