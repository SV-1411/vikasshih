/*
  # Educational Platform Schema Extension
  
  Extends the existing learning platform to support:
  1. College registration and management
  2. Classroom system (similar to Google Classroom)
  3. Live lectures with voice support
  4. Interactive features (quizzes, polls, assignments, chat)
  5. Multi-classroom support for teachers and students
*/

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL, -- Unique college code for registration
  address text,
  contact_email text,
  contact_phone text,
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update profiles table to include college association
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS college_id uuid REFERENCES colleges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  subject text,
  code text UNIQUE NOT NULL, -- Unique classroom code for joining
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classroom_members table for student enrollment
CREATE TABLE IF NOT EXISTS classroom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(classroom_id, student_id)
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  instructions text,
  due_date timestamptz,
  max_points integer DEFAULT 100,
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text,
  file_urls text[],
  submitted_at timestamptz DEFAULT now(),
  grade integer,
  feedback text,
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at timestamptz,
  UNIQUE(assignment_id, student_id)
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL, -- Array of question objects
  time_limit integer, -- in minutes
  max_attempts integer DEFAULT 1,
  is_published boolean DEFAULT false,
  due_date timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL, -- Student's answers
  score integer,
  max_score integer,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz,
  time_taken integer, -- in seconds
  attempt_number integer DEFAULT 1
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL, -- Array of poll options
  is_active boolean DEFAULT true,
  is_anonymous boolean DEFAULT false,
  multiple_choice boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz
);

-- Create poll_responses table
CREATE TABLE IF NOT EXISTS poll_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  selected_options integer[], -- Array of selected option indices
  responded_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, student_id)
);

-- Create live_lectures table
CREATE TABLE IF NOT EXISTS live_lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  college_id uuid REFERENCES colleges(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration integer, -- in minutes
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  meeting_url text, -- For voice/video integration
  recording_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lecture_attendees table
CREATE TABLE IF NOT EXISTS lecture_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id uuid REFERENCES live_lectures(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  duration_attended integer, -- in seconds
  UNIQUE(lecture_id, user_id)
);

-- Create classroom_chat table for group discussions
CREATE TABLE IF NOT EXISTS classroom_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'announcement')),
  file_urls text[],
  reply_to uuid REFERENCES classroom_chat(id) ON DELETE SET NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('assignment', 'quiz', 'poll', 'lecture', 'chat', 'announcement')),
  related_id uuid, -- ID of related entity (assignment, quiz, etc.)
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on new tables
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Colleges policies
CREATE POLICY "Anyone can read colleges"
  ON colleges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "College admins can update their college"
  ON colleges
  FOR UPDATE
  TO authenticated
  USING (admin_id = auth.uid());

-- Classrooms policies
CREATE POLICY "College members can read classrooms"
  ON classrooms
  FOR SELECT
  TO authenticated
  USING (
    college_id IN (
      SELECT college_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create classrooms"
  ON classrooms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    teacher_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher')
  );

CREATE POLICY "Teachers can update their classrooms"
  ON classrooms
  FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid());

-- Classroom members policies
CREATE POLICY "Classroom members can read membership"
  ON classroom_members
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id AND teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can join classrooms"
  ON classroom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
  );

-- Assignments policies
CREATE POLICY "Classroom members can read assignments"
  ON assignments
  FOR SELECT
  TO authenticated
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members WHERE student_id = auth.uid()
      UNION
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage assignments in their classrooms"
  ON assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id AND teacher_id = auth.uid()
    )
  );

-- Assignment submissions policies
CREATE POLICY "Students can manage their submissions"
  ON assignment_submissions
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can read submissions for their assignments"
  ON assignment_submissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classrooms c ON c.id = a.classroom_id
      WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can grade submissions"
  ON assignment_submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN classrooms c ON c.id = a.classroom_id
      WHERE a.id = assignment_id AND c.teacher_id = auth.uid()
    )
  );

-- Quizzes policies (similar to assignments)
CREATE POLICY "Classroom members can read published quizzes"
  ON quizzes
  FOR SELECT
  TO authenticated
  USING (
    (is_published = true AND classroom_id IN (
      SELECT classroom_id FROM classroom_members WHERE student_id = auth.uid()
    )) OR
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage quizzes in their classrooms"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id AND teacher_id = auth.uid()
    )
  );

-- Quiz attempts policies
CREATE POLICY "Students can manage their quiz attempts"
  ON quiz_attempts
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can read quiz attempts for their quizzes"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN classrooms c ON c.id = q.classroom_id
      WHERE q.id = quiz_id AND c.teacher_id = auth.uid()
    )
  );

-- Polls policies
CREATE POLICY "Classroom members can read active polls"
  ON polls
  FOR SELECT
  TO authenticated
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members WHERE student_id = auth.uid()
      UNION
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage polls in their classrooms"
  ON polls
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id AND teacher_id = auth.uid()
    )
  );

-- Poll responses policies
CREATE POLICY "Students can manage their poll responses"
  ON poll_responses
  FOR ALL
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can read poll responses for their polls"
  ON poll_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls p
      JOIN classrooms c ON c.id = p.classroom_id
      WHERE p.id = poll_id AND c.teacher_id = auth.uid()
    )
  );

-- Live lectures policies
CREATE POLICY "College members can read lectures"
  ON live_lectures
  FOR SELECT
  TO authenticated
  USING (
    college_id IN (
      SELECT college_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage lectures in their classrooms"
  ON live_lectures
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

-- Lecture attendees policies
CREATE POLICY "Users can manage their lecture attendance"
  ON lecture_attendees
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Teachers can read attendance for their lectures"
  ON lecture_attendees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_lectures 
      WHERE id = lecture_id AND teacher_id = auth.uid()
    )
  );

-- Classroom chat policies
CREATE POLICY "Classroom members can read chat"
  ON classroom_chat
  FOR SELECT
  TO authenticated
  USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members WHERE student_id = auth.uid()
      UNION
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Classroom members can send messages"
  ON classroom_chat
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    classroom_id IN (
      SELECT classroom_id FROM classroom_members WHERE student_id = auth.uid()
      UNION
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages"
  ON classroom_chat
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can read their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_colleges_code ON colleges(code);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_college_id ON classrooms(college_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(code);
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_id ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id ON classroom_members(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_classroom_id ON assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_classroom_id ON quizzes(classroom_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_polls_classroom_id ON polls(classroom_id);
CREATE INDEX IF NOT EXISTS idx_poll_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_live_lectures_classroom_id ON live_lectures(classroom_id);
CREATE INDEX IF NOT EXISTS idx_live_lectures_college_id ON live_lectures(college_id);
CREATE INDEX IF NOT EXISTS idx_lecture_attendees_lecture_id ON lecture_attendees(lecture_id);
CREATE INDEX IF NOT EXISTS idx_classroom_chat_classroom_id ON classroom_chat(classroom_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create function to generate unique codes
CREATE OR REPLACE FUNCTION generate_unique_code(prefix text, table_name text, column_name text)
RETURNS text AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate a random 6-character code
    new_code := prefix || '-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code exists in the specified table
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)', table_name, column_name)
    USING new_code
    INTO code_exists;
    
    -- If code doesn't exist, return it
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate college codes
CREATE OR REPLACE FUNCTION set_college_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_unique_code('COL', 'colleges', 'code');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-generate classroom codes
CREATE OR REPLACE FUNCTION set_classroom_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_unique_code('CLS', 'classrooms', 'code');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-generating codes
CREATE TRIGGER colleges_set_code_trigger
  BEFORE INSERT ON colleges
  FOR EACH ROW
  EXECUTE FUNCTION set_college_code();

CREATE TRIGGER classrooms_set_code_trigger
  BEFORE INSERT ON classrooms
  FOR EACH ROW
  EXECUTE FUNCTION set_classroom_code();

-- Create function to send notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text,
  p_related_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to support college association
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, role, college_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE((NEW.raw_user_meta_data->>'college_id')::uuid, NULL),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
