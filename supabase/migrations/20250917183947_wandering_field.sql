/*
  # Create Vikas Learning Platform Tables

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
    - `courses` - Learning courses
    - `modules` - Course modules/chapters
    - `lessons` - Individual lessons within modules
    - `activities` - Quizzes and exercises for lessons
    - `progress_events` - Student learning progress tracking
    - `user_progress` - Aggregated user progress per course
    - `teacher_student_connections` - Teacher-student relationships

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
*/

-- Create profiles table extending auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  group_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  language text DEFAULT 'en',
  version text DEFAULT '1.0.0',
  channel_id text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('audio', 'video', 'text', 'interactive')),
  content_ref text NOT NULL,
  duration integer,
  size bigint,
  checksum text,
  transcript text,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('quiz', 'exercise', 'assignment')),
  title text NOT NULL,
  schema jsonb NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create progress_events table
CREATE TABLE IF NOT EXISTS progress_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES activities(id) ON DELETE SET NULL,
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('started', 'completed', 'failed', 'reviewed')),
  score integer,
  attempts integer DEFAULT 1,
  time_spent integer,
  data jsonb,
  synced boolean DEFAULT true
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  streak_days integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  completed_lessons text[] DEFAULT '{}',
  skill_levels jsonb DEFAULT '{}',
  UNIQUE(user_id, course_id)
);

-- Create teacher_student_connections table
CREATE TABLE IF NOT EXISTS teacher_student_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  connected_at timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  shared_courses text[] DEFAULT '{}',
  UNIQUE(teacher_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_student_connections ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can read student profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    role = 'student' AND 
    EXISTS (
      SELECT 1 FROM teacher_student_connections 
      WHERE teacher_id = auth.uid() AND student_id = id AND status = 'active'
    )
  );

-- Courses policies
CREATE POLICY "Anyone can read courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers and admins can create courses"
  ON courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Course creators can update their courses"
  ON courses
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Modules policies
CREATE POLICY "Anyone can read modules"
  ON modules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Course creators can manage modules"
  ON modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE id = course_id AND created_by = auth.uid()
    )
  );

-- Lessons policies
CREATE POLICY "Anyone can read lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Course creators can manage lessons"
  ON lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN modules m ON m.course_id = c.id
      WHERE m.id = module_id AND c.created_by = auth.uid()
    )
  );

-- Activities policies
CREATE POLICY "Anyone can read activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Course creators can manage activities"
  ON activities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses c
      JOIN modules m ON m.course_id = c.id
      JOIN lessons l ON l.module_id = m.id
      WHERE l.id = lesson_id AND c.created_by = auth.uid()
    )
  );

-- Progress events policies
CREATE POLICY "Users can read own progress"
  ON progress_events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress"
  ON progress_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Teachers can read student progress"
  ON progress_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teacher_student_connections 
      WHERE teacher_id = auth.uid() AND student_id = user_id AND status = 'active'
    )
  );

-- User progress policies
CREATE POLICY "Users can read own user progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own user progress"
  ON user_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can read student user progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teacher_student_connections 
      WHERE teacher_id = auth.uid() AND student_id = user_id AND status = 'active'
    )
  );

-- Teacher-student connections policies
CREATE POLICY "Users can read own connections"
  ON teacher_student_connections
  FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Students can create connection requests"
  ON teacher_student_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can manage their connections"
  ON teacher_student_connections
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_activities_lesson_id ON activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_user_id ON progress_events(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_events_lesson_id ON progress_events(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_teacher_id ON teacher_student_connections(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student_id ON teacher_student_connections(student_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();