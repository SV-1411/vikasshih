import { supabase } from './supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { User } from '../types';
import { db } from './database';
import { v4 as uuidv4 } from 'uuid';

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface RegisterResult {
  success: boolean;
  user?: User;
  error?: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!supabase) {
      // Fallback to local user if Supabase is not configured
      this.getCurrentUser();
      return;
    }

    supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        await this.syncUserSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        localStorage.removeItem('vikas_current_user');
      }
    });

    // Check for an existing session on startup
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await this.syncUserSession(session.user);
    } else {
      // Fallback to locally stored user if no session
      this.getCurrentUser();
    }
  }

  async login(username: string, password: string): Promise<LoginResult> {
    // Try Supabase auth first
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@vikas.local`, // Assuming email format
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // The onAuthStateChange listener will handle setting the user
        return { success: true, user: this.currentUser || undefined };
      }
    }

    // Fallback to local auth for demo users or offline mode
    return this.loginLocal(username, password);
  }

  private async loginLocal(username: string, password: string): Promise<LoginResult> {
    try {
      const user = await db.getUser(username);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // For demo purposes, we'll use a simple password check
      // In production, use proper bcrypt comparison
      const isValid = password === 'demo123';
      
      if (!isValid) {
        return { success: false, error: 'Invalid password' };
      }

      this.currentUser = user;
      localStorage.setItem('vikas_current_user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  }

  async register(username: string, password: string, role: User['role'] = 'student'): Promise<RegisterResult> {
    try {
      // First try local registration for demo users
      const localResult = await this.registerLocal(username, role);
      if (localResult.success) {
        return localResult;
      }

      // If local registration fails (user exists), try Supabase
      if (supabase) {
        try {
        // Check if username already exists in profiles table
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single();

        if (existingProfile) {
          return { success: false, error: 'User with this username already exists' };
        }

        const { data, error } = await supabase.auth.signUp({
          email: `${username}@vikas.local`,
          password,
          options: {
            data: {
              username,
              role
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Profile should be created automatically by trigger
          const newUser: User = {
            id: data.user.id,
            username,
            role,
            group_ids: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };


          this.currentUser = newUser;
          localStorage.setItem('vikas_current_user', JSON.stringify(newUser));
          
          // Cache user locally
          await db.saveUser(newUser);
          
          return { success: true, user: newUser };
        }

        return { success: false, error: 'Registration failed' };
        } catch (supabaseError) {
        console.error('Supabase registration error:', supabaseError);
        return { success: false, error: 'Registration service unavailable' };
        }
      }
      
      return localResult; // Return local result if Supabase not available
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  private async registerLocal(username: string, role: User['role']): Promise<RegisterResult> {
    try {
      const existingUser = await db.getUser(username);
      
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      const newUser: User = {
        id: uuidv4(),
        username,
        role,
        group_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const savedUser = await db.saveUser(newUser);
      this.currentUser = savedUser;
      localStorage.setItem('vikas_current_user', JSON.stringify(savedUser));
      
      return { success: true, user: savedUser };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  }

  async logout(): Promise<void> {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
    }
    // Clear local user data regardless of Supabase status
    this.currentUser = null;
    localStorage.removeItem('vikas_current_user');
  }

  getCurrentUser(): User | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('vikas_current_user');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(role: User['role']): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  canAccess(requiredRole: User['role']): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roleHierarchy = { 'student': 0, 'teacher': 1, 'admin': 2 };
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  }

  private async syncUserSession(authUser: any): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Failed to fetch user profile:', error);
        return;
      }

      if (profile) {
        const user: User = {
          id: profile.id,
          username: profile.username,
          role: profile.role || 'student',
          group_ids: profile.group_ids || [],
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };

        this.currentUser = user;
        localStorage.setItem('vikas_current_user', JSON.stringify(user));
        await db.saveUser(user);
      }
    } catch (error) {
      console.error('Failed to sync user session:', error);
    }
  }
}

export const auth = new AuthService();