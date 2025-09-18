import PouchDB from 'pouchdb-browser';
import PouchDBAdapter from 'pouchdb-adapter-idb';
import PouchDBFind from 'pouchdb-find';
import { Course, Module, Lesson, Activity, User, ProgressEvent, UserProgress } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Import supabase conditionally to avoid errors when env vars are missing
let supabase: any = null;
try {
  const supabaseModule = await import('./supabase');
  supabase = supabaseModule.supabase;
} catch (error) {
  console.warn('Supabase not configured, running in offline-only mode');
}

PouchDB.plugin(PouchDBAdapter);
PouchDB.plugin(PouchDBFind);

class Database {
  private courses: PouchDB.Database<Course>;
  private modules: PouchDB.Database<Module>;
  private lessons: PouchDB.Database<Lesson>;
  private activities: PouchDB.Database<Activity>;
  private users: PouchDB.Database<User>;
  private progress: PouchDB.Database<ProgressEvent>;
  private userProgress: PouchDB.Database<UserProgress>;
  private offlineQueue: PouchDB.Database<any>;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.courses = new PouchDB<Course>('vikas_courses', { adapter: 'idb' });
    this.modules = new PouchDB<Module>('vikas_modules', { adapter: 'idb' });
    this.lessons = new PouchDB<Lesson>('vikas_lessons', { adapter: 'idb' });
    this.activities = new PouchDB<Activity>('vikas_activities', { adapter: 'idb' });
    this.users = new PouchDB<User>('vikas_users', { adapter: 'idb' });
    this.progress = new PouchDB<ProgressEvent>('vikas_progress', { adapter: 'idb' });
    this.userProgress = new PouchDB<UserProgress>('vikas_user_progress', { adapter: 'idb' });
    this.offlineQueue = new PouchDB('vikas_offline_queue', { adapter: 'idb' });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Sync offline queue when coming back online
  private async syncOfflineQueue() {
    try {
      const queueItems = await this.getOfflineQueue();
      for (const item of queueItems) {
        try {
          await this.processQueueItem(item);
          await this.markQueueItemSynced(item._id);
        } catch (error) {
          console.error('Failed to sync queue item:', error);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline queue:', error);
    }
  }

  private async processQueueItem(item: any) {
    switch (item.action) {
      case 'create_course':
        await this.syncCourseToSupabase(item.data);
        break;
      case 'create_module':
        await this.syncModuleToSupabase(item.data);
        break;
      case 'create_lesson':
        await this.syncLessonToSupabase(item.data);
        break;
      case 'save_progress':
        await this.syncProgressToSupabase(item.data);
        break;
      case 'update_user_progress':
        await this.syncUserProgressToSupabase(item.data);
        break;
      default:
        console.warn('Unknown queue action:', item.action);
    }
  }

  // Course methods with Supabase sync
  async getCourses(): Promise<Course[]> {
    try {
      // Try to fetch from Supabase first if online
      if (this.isOnline && supabase) {
        // Get current user to check for enrollments
        const { auth: authModule } = await import('../lib/auth');
        const user = authModule.getCurrentUser();
        let query;
        
        if (user && user.role === 'student') {
          // For students, get enrolled courses
          query = supabase
            .from('course_enrollments')
            .select(`
              course_id,
              courses!course_enrollments_course_id_fkey (
                id,
                title,
                description,
                language,
                version,
                channel_id,
                course_code,
                created_by,
                created_at,
                updated_at
              )
            `)
            .eq('student_id', user.id)
            .eq('status', 'active');
        } else {
          // For teachers/admins, get all courses or their own courses
          query = supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (user && user.role === 'teacher') {
            query = query.eq('created_by', user.id);
          }
        }

        const { data, error } = await query;

        if (!error && data) {
          let coursesData;
          
          if (user && user.role === 'student') {
            // Extract courses from enrollment data
            coursesData = data
              .filter(enrollment => enrollment.courses)
              .map(enrollment => enrollment.courses);
          } else {
            coursesData = data;
          }
          
          // Update local cache
          for (const course of coursesData) {
            const localCourse: Course = {
              _id: `course_${course.id}`,
              id: course.id,
              title: course.title,
              description: course.description,
              language: course.language,
              version: course.version,
              channel_id: course.channel_id,
              created_at: course.created_at,
              updated_at: course.updated_at
            };
            try {
              await this.courses.put(localCourse);
            } catch (error) {
              // Handle conflicts
              if (error.name === 'conflict') {
                const existing = await this.courses.get(localCourse._id);
                localCourse._rev = existing._rev;
                await this.courses.put(localCourse);
              }
            }
          }
          return coursesData.map(course => ({
            _id: `course_${course.id}`,
            id: course.id,
            title: course.title,
            description: course.description,
            language: course.language,
            version: course.version,
            channel_id: course.channel_id,
            created_at: course.created_at,
            updated_at: course.updated_at
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch courses from Supabase:', error);
    }

    // Fallback to local data
    const result = await this.courses.allDocs({ include_docs: true });
    return result.rows.map(row => row.doc!);
  }

  async enrollStudentInCourse(studentId: string, courseId: string): Promise<void> {
    if (this.isOnline && supabase) {
      const { error } = await supabase
        .from('course_enrollments')
        .upsert({
          student_id: studentId,
          course_id: courseId,
          status: 'active',
          enrolled_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
    } else {
      await this.addToOfflineQueue('enroll_student', {
        student_id: studentId,
        course_id: courseId
      });
    }
  }

  async getStudentEnrollments(studentId: string): Promise<any[]> {
    // This would return enrollment data - implement as needed
    return [];
  }

  async getCourse(id: string): Promise<Course | null> {
    try {
      return await this.courses.get(id);
    } catch (error) {
      return null;
    }
  }

  async saveCourse(course: Course): Promise<Course> {
    try {
      // Save locally first
      const existing = await this.courses.get(course._id).catch(() => null);
      if (existing) {
        course._rev = existing._rev;
      }
      const result = await this.courses.put(course);
      const savedCourse = { ...course, _rev: result.rev };

      // Sync to Supabase if online
      if (this.isOnline && supabase) {
        await this.syncCourseToSupabase(savedCourse);
      } else {
        await this.addToOfflineQueue('create_course', savedCourse);
      }

      return savedCourse;
    } catch (error) {
      throw error;
    }
  }

  private async syncCourseToSupabase(course: Course) {
    if (!supabase) return;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated for Supabase sync, skipping...');
      return;
    }
    
    const { error } = await supabase
      .from('courses')
      .upsert({
        id: course.id,
        title: course.title,
        description: course.description,
        language: course.language,
        version: course.version,
        channel_id: course.channel_id,
        course_code: `COURSE_${course.id.substring(0, 8).toUpperCase()}`,
        created_at: course.created_at,
        updated_at: course.updated_at,
        created_by: user.id
      });

    if (error) {
      console.error('Failed to sync course to Supabase:', error);
      // Don't throw error to prevent breaking local functionality
    }
  }

  // Module methods with Supabase sync
  async getModulesByCourse(courseId: string): Promise<Module[]> {
    try {
      if (this.isOnline && supabase) {
        const { data, error } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', courseId)
          .order('order', { ascending: true });

        if (!error && data) {
          // Update local cache
          for (const module of data) {
            const localModule: Module = {
              _id: `module_${module.id}`,
              id: module.id,
              course_id: module.course_id,
              title: module.title,
              description: module.description,
              order: module.order,
              created_at: module.created_at
            };
            try {
              await this.modules.put(localModule);
            } catch (error) {
              if (error.name === 'conflict') {
                const existing = await this.modules.get(localModule._id);
                localModule._rev = existing._rev;
                await this.modules.put(localModule);
              }
            }
          }
          return data.map(module => ({
            _id: `module_${module.id}`,
            id: module.id,
            course_id: module.course_id,
            title: module.title,
            description: module.description,
            order: module.order,
            created_at: module.created_at
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch modules from Supabase:', error);
    }

    // Fallback to local data
    const result = await this.modules.find({
      selector: { course_id: courseId },
      sort: [{ course_id: 'asc' }, { order: 'asc' }]
    });
    return result.docs;
  }

  async saveModule(module: Module): Promise<Module> {
    try {
      const existing = await this.modules.get(module._id).catch(() => null);
      if (existing) {
        module._rev = existing._rev;
      }
      const result = await this.modules.put(module);
      const savedModule = { ...module, _rev: result.rev };

      if (this.isOnline && supabase) {
        await this.syncModuleToSupabase(savedModule);
      } else {
        await this.addToOfflineQueue('create_module', savedModule);
      }

      return savedModule;
    } catch (error) {
      throw error;
    }
  }

  private async syncModuleToSupabase(module: Module) {
    if (!supabase) return;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated for Supabase sync, skipping...');
      return;
    }
    
    const { error } = await supabase
      .from('modules')
      .upsert({
        id: module.id,
        course_id: module.course_id,
        title: module.title,
        description: module.description,
        order: module.order,
        created_at: module.created_at
      });

    if (error) {
      console.error('Failed to sync module to Supabase:', error);
    }
  }

  // Lesson methods with Supabase sync
  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    try {
      if (this.isOnline && supabase) {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('module_id', moduleId)
          .order('order', { ascending: true });

        if (!error && data) {
          // Update local cache
          for (const lesson of data) {
            const localLesson: Lesson = {
              _id: `lesson_${lesson.id}`,
              id: lesson.id,
              module_id: lesson.module_id,
              title: lesson.title,
              type: lesson.type,
              content_ref: lesson.content_ref,
              duration: lesson.duration,
              size: lesson.size,
              checksum: lesson.checksum,
              transcript: lesson.transcript,
              order: lesson.order,
              created_at: lesson.created_at
            };
            try {
              await this.lessons.put(localLesson);
            } catch (error) {
              if (error.name === 'conflict') {
                const existing = await this.lessons.get(localLesson._id);
                localLesson._rev = existing._rev;
                await this.lessons.put(localLesson);
              }
            }
          }
          return data.map(lesson => ({
            _id: `lesson_${lesson.id}`,
            id: lesson.id,
            module_id: lesson.module_id,
            title: lesson.title,
            type: lesson.type,
            content_ref: lesson.content_ref,
            duration: lesson.duration,
            size: lesson.size,
            checksum: lesson.checksum,
            transcript: lesson.transcript,
            order: lesson.order,
            created_at: lesson.created_at
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch lessons from Supabase:', error);
    }

    // Fallback to local data
    const result = await this.lessons.find({
      selector: { module_id: moduleId },
      sort: [{ module_id: 'asc' }, { order: 'asc' }]
    });
    return result.docs;
  }

  async getLesson(id: string): Promise<Lesson | null> {
    try {
      return await this.lessons.get(id);
    } catch (error) {
      return null;
    }
  }

  async saveLesson(lesson: Lesson): Promise<Lesson> {
    try {
      const existing = await this.lessons.get(lesson._id).catch(() => null);
      if (existing) {
        lesson._rev = existing._rev;
      }
      const result = await this.lessons.put(lesson);
      const savedLesson = { ...lesson, _rev: result.rev };

      if (this.isOnline && supabase) {
        await this.syncLessonToSupabase(savedLesson);
      } else {
        await this.addToOfflineQueue('create_lesson', savedLesson);
      }

      return savedLesson;
    } catch (error) {
      throw error;
    }
  }

  private async syncLessonToSupabase(lesson: Lesson) {
    if (!supabase) return;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated for Supabase sync, skipping...');
      return;
    }
    
    const { error } = await supabase
      .from('lessons')
      .upsert({
        id: lesson.id,
        module_id: lesson.module_id,
        title: lesson.title,
        type: lesson.type,
        content_ref: lesson.content_ref,
        duration: lesson.duration,
        size: lesson.size,
        checksum: lesson.checksum,
        transcript: lesson.transcript,
        order: lesson.order,
        created_at: lesson.created_at
      });

    if (error) {
      console.error('Failed to sync lesson to Supabase:', error);
    }
  }

  // Activity methods with Supabase sync
  async getActivitiesByLesson(lessonId: string): Promise<Activity[]> {
    try {
      if (this.isOnline && supabase) {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order', { ascending: true });

        if (!error && data) {
          // Update local cache
          for (const activity of data) {
            const localActivity: Activity = {
              _id: `activity_${activity.id}`,
              id: activity.id,
              lesson_id: activity.lesson_id,
              type: activity.type,
              title: activity.title,
              schema: activity.schema,
              order: activity.order
            };
            try {
              await this.activities.put(localActivity);
            } catch (error) {
              if (error.name === 'conflict') {
                const existing = await this.activities.get(localActivity._id);
                localActivity._rev = existing._rev;
                await this.activities.put(localActivity);
              }
            }
          }
          return data.map(activity => ({
            _id: `activity_${activity.id}`,
            id: activity.id,
            lesson_id: activity.lesson_id,
            type: activity.type,
            title: activity.title,
            schema: activity.schema,
            order: activity.order
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch activities from Supabase:', error);
    }

    // Fallback to local data
    const result = await this.activities.find({
      selector: { lesson_id: lessonId },
      sort: [{ lesson_id: 'asc' }, { order: 'asc' }]
    });
    return result.docs;
  }

  async saveActivity(activity: Activity): Promise<Activity> {
    try {
      const existing = await this.activities.get(activity._id).catch(() => null);
      if (existing) {
        activity._rev = existing._rev;
      }
      const result = await this.activities.put(activity);
      const savedActivity = { ...activity, _rev: result.rev };

      if (this.isOnline && supabase) {
        await this.syncActivityToSupabase(savedActivity);
      } else {
        await this.addToOfflineQueue('create_activity', savedActivity);
      }

      return savedActivity;
    } catch (error) {
      throw error;
    }
  }

  private async syncActivityToSupabase(activity: Activity) {
    if (!supabase) return;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated for Supabase sync, skipping...');
      return;
    }
    
    const { error } = await supabase
      .from('activities')
      .upsert({
        id: activity.id,
        lesson_id: activity.lesson_id,
        type: activity.type,
        title: activity.title,
        schema: activity.schema,
        order: activity.order
      });

    if (error) {
      console.error('Failed to sync activity to Supabase:', error);
    }
  }

  // Progress methods with Supabase sync
  async saveProgress(progress: ProgressEvent): Promise<ProgressEvent> {
    try {
      const existing = await this.progress.get(progress._id).catch(() => null);
      if (existing) {
        progress._rev = existing._rev;
      }
      const result = await this.progress.put(progress);
      const savedProgress = { ...progress, _rev: result.rev };

      if (this.isOnline && supabase) {
        await this.syncProgressToSupabase(savedProgress);
      } else {
        await this.addToOfflineQueue('save_progress', savedProgress);
      }

      return savedProgress;
    } catch (error) {
      throw error;
    }
  }

  private async syncProgressToSupabase(progress: ProgressEvent) {
    if (!supabase) return;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated for Supabase sync, skipping...');
      return;
    }
    
    const { error } = await supabase
      .from('progress_events')
      .upsert({
        id: progress.id,
        user_id: progress.user_id,
        lesson_id: progress.lesson_id,
        activity_id: progress.activity_id,
        timestamp: progress.timestamp,
        status: progress.status,
        score: progress.score,
        attempts: progress.attempts,
        time_spent: progress.time_spent,
        data: progress.data,
        synced: true
      });

    if (error) {
      console.error('Failed to sync progress to Supabase:', error);
    }
  }

  async getUserProgress(userId: string, courseId?: string): Promise<ProgressEvent[]> {
    try {
      if (this.isOnline && supabase) {
        let query = supabase
          .from('progress_events')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        const { data, error } = await query;

        if (!error && data) {
          return data.map(progress => ({
            _id: `progress_${progress.id}`,
            id: progress.id,
            user_id: progress.user_id,
            lesson_id: progress.lesson_id,
            activity_id: progress.activity_id,
            timestamp: progress.timestamp,
            status: progress.status,
            score: progress.score,
            attempts: progress.attempts,
            time_spent: progress.time_spent,
            data: progress.data
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress from Supabase:', error);
    }

    // Fallback to local data
    const selector: any = { user_id: userId };
    if (courseId) {
      selector.course_id = courseId;
    }

    const result = await this.progress.find({
      selector,
      sort: [{ timestamp: 'desc' }]
    });
    return result.docs;
  }

  async getUserProgressSummary(userId: string): Promise<UserProgress[]> {
    try {
      if (this.isOnline && supabase) {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId);

        if (!error && data) {
          // Update local cache
          for (const progress of data) {
            const localProgress: UserProgress = {
              _id: `user_progress_${progress.id}`,
              user_id: progress.user_id,
              course_id: progress.course_id,
              total_xp: progress.total_xp,
              current_level: progress.current_level,
              streak_days: progress.streak_days,
              last_activity: progress.last_activity,
              completed_lessons: progress.completed_lessons,
              skill_levels: progress.skill_levels
            };
            try {
              await this.userProgress.put(localProgress);
            } catch (error) {
              if (error.name === 'conflict') {
                const existing = await this.userProgress.get(localProgress._id);
                localProgress._rev = existing._rev;
                await this.userProgress.put(localProgress);
              }
            }
          }
          return data.map(progress => ({
            _id: `user_progress_${progress.id}`,
            user_id: progress.user_id,
            course_id: progress.course_id,
            total_xp: progress.total_xp,
            current_level: progress.current_level,
            streak_days: progress.streak_days,
            last_activity: progress.last_activity,
            completed_lessons: progress.completed_lessons,
            skill_levels: progress.skill_levels
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch user progress from Supabase:', error);
    }

    // Fallback to local data
    const result = await this.userProgress.find({
      selector: { user_id: userId }
    });
    return result.docs;
  }

  async saveUserProgressSummary(userProgress: UserProgress): Promise<UserProgress> {
    try {
      const existing = await this.userProgress.get(userProgress._id).catch(() => null);
      if (existing) {
        userProgress._rev = existing._rev;
      }
      const result = await this.userProgress.put(userProgress);
      const savedProgress = { ...userProgress, _rev: result.rev };

      if (this.isOnline && supabase) {
        await this.syncUserProgressToSupabase(savedProgress);
      } else {
        await this.addToOfflineQueue('update_user_progress', savedProgress);
      }

      return savedProgress;
    } catch (error) {
      throw error;
    }
  }

  private async syncUserProgressToSupabase(userProgress: UserProgress) {
    if (!supabase) return;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('User not authenticated for Supabase sync, skipping...');
      return;
    }
    
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        id: userProgress._id.replace('user_progress_', ''),
        user_id: userProgress.user_id,
        course_id: userProgress.course_id,
        total_xp: userProgress.total_xp,
        current_level: userProgress.current_level,
        streak_days: userProgress.streak_days,
        last_activity: userProgress.last_activity,
        completed_lessons: userProgress.completed_lessons,
        skill_levels: userProgress.skill_levels
      });

    if (error) {
      console.error('Failed to sync user progress to Supabase:', error);
    }
  }

  async updateUserXP(userId: string, courseId: string, xpGained: number): Promise<UserProgress> {
    let progress = await this.getUserProgressSummary(userId);
    let userProgress = progress.find(p => p.course_id === courseId);
    
    if (!userProgress) {
      userProgress = {
        _id: `user_progress_${uuidv4()}`,
        user_id: userId,
        course_id: courseId,
        total_xp: 0,
        current_level: 1,
        streak_days: 0,
        last_activity: new Date().toISOString(),
        completed_lessons: [],
        skill_levels: {}
      };
    }

    userProgress.total_xp += xpGained;
    userProgress.current_level = Math.floor(userProgress.total_xp / 100) + 1;
    userProgress.last_activity = new Date().toISOString();
    
    // Update streak
    const lastActivity = new Date(userProgress.last_activity);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      userProgress.streak_days += 1;
    } else if (daysDiff > 1) {
      userProgress.streak_days = 1;
    }

    return await this.saveUserProgressSummary(userProgress);
  }

  // User methods (using Supabase Auth)
  async getUser(username: string): Promise<User | null> {
    try {
      const result = await this.users.find({
        selector: { username }
      });
      return result.docs[0] || null;
    } catch (error) {
      return null;
    }
  }

  async saveUser(user: User): Promise<User> {
    try {
      const existing = await this.users.get(user._id).catch(() => null);
      if (existing) {
        user._rev = existing._rev;
      }
      const result = await this.users.put(user);
      return { ...user, _rev: result.rev };
    } catch (error) {
      throw error;
    }
  }

  // Teacher-Student connection methods
  async connectStudentToTeacher(studentId: string, teacherId: string): Promise<void> {
    if (this.isOnline && supabase) {
      const { error } = await supabase
        .from('teacher_student_connections')
        .upsert({
          teacher_id: teacherId,
          student_id: studentId,
          status: 'active',
          shared_courses: []
        });

      if (error) {
        throw error;
      }
    } else {
      await this.addToOfflineQueue('connect_teacher_student', {
        teacher_id: teacherId,
        student_id: studentId
      });
    }
  }

  async getStudentsByTeacher(teacherId: string): Promise<User[]> {
    try {
      if (this.isOnline && supabase) {
        const { data, error } = await supabase
          .from('teacher_student_connections')
          .select(`
            student_id,
            profiles!teacher_student_connections_student_id_fkey (
              id,
              username,
              role
            )
          `)
          .eq('teacher_id', teacherId)
          .eq('status', 'active');

        if (!error && data) {
          return data.map((connection: any) => ({
            _id: `user_${connection.student_id}`,
            id: connection.student_id,
            username: connection.profiles?.username || 'Unknown',
            role: 'student' as const,
            hashed_password: '',
            group_ids: [],
            created_at: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch students from Supabase:', error);
    }

    return [];
  }

  async getTeachersByStudent(studentId: string): Promise<User[]> {
    try {
      if (this.isOnline && supabase) {
        const { data, error } = await supabase
          .from('teacher_student_connections')
          .select(`
            teacher_id,
            profiles!teacher_student_connections_teacher_id_fkey (
              id,
              username,
              role
            )
          `)
          .eq('student_id', studentId)
          .eq('status', 'active');

        if (!error && data) {
          return data.map((connection: any) => ({
            _id: `user_${connection.teacher_id}`,
            id: connection.teacher_id,
            username: connection.profiles?.username || 'Unknown',
            role: 'teacher' as const,
            hashed_password: '',
            group_ids: [],
            created_at: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch teachers from Supabase:', error);
    }

    return [];
  }

  async syncUserSession(): Promise<void> {
    try {
      if (!supabase) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Update current user from Supabase session
        const user: User = {
          _id: `user_${session.user.id}`,
          id: session.user.id,
          username: session.user.email || 'Unknown',
          role: session.user.user_metadata?.role || 'student',
          hashed_password: '',
          group_ids: [],
          created_at: session.user.created_at
        };
        await this.saveUser(user);
      }
    } catch (error) {
      console.error('Failed to sync user session:', error);
    }
  }

  // Offline queue methods
  async addToOfflineQueue(action: string, data: any): Promise<void> {
    const queueItem = {
      _id: `queue_${Date.now()}_${Math.random()}`,
      action,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    await this.offlineQueue.put(queueItem);
  }

  async getOfflineQueue(): Promise<any[]> {
    const result = await this.offlineQueue.find({
      selector: { synced: false },
      sort: [{ timestamp: 'asc' }]
    });
    return result.docs;
  }

  async markQueueItemSynced(id: string): Promise<void> {
    const item = await this.offlineQueue.get(id);
    item.synced = true;
    await this.offlineQueue.put(item);
  }

  // Initialize with indexes
  async initializeIndexes(): Promise<void> {
    try {
      await this.modules.createIndex({
        index: { fields: ['course_id', 'order'] }
      });

      await this.lessons.createIndex({
        index: { fields: ['module_id', 'order'] }
      });

      await this.activities.createIndex({
        index: { fields: ['lesson_id', 'order'] }
      });

      await this.progress.createIndex({
        index: { fields: ['user_id', 'timestamp'] }
      });

      await this.users.createIndex({
        index: { fields: ['username'] }
      });
    } catch (error) {
      // Indexes might already exist, ignore conflict errors
      if (error.name !== 'conflict') {
        console.error('Failed to create indexes:', error);
      }
    }
  }
}

export const db = new Database();