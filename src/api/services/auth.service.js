import { supabase } from '../../lib/supabase';

/**
 * Authentication service for handling user authentication operations
 */
class AuthService {
  /**
   * Get current authenticated user
   * @returns {Promise<Object|null>} - The user object or null if an error occurs
   */
  async getUser() {
    try {
      console.log('🔍 getUser: Starting simple check...');
      console.log('🔍 Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
      console.log('🔍 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
      
      // Direct call without timeout to see raw error
      const { data: { user }, error } = await supabase.auth.getUser();
      
      console.log('✅ Raw Supabase response:', { user: user ? 'Found' : null, error: error || 'None' });
      
      if (error) {
        console.error('❌ Supabase getUser error:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('❌ getUser exception:', error);
      return null;
    }
  }

  /**
   * Require authentication - redirect to login if not authenticated
   * @returns {Promise<Object|null>} - The user object or null if not authenticated
   */
  async requireAuth() {
    const user = await this.getUser();
    if (!user) {
      window.location.href = '/login';
      return null;
    }
    return user;
  }

  /**
   * Sign in with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Sign in response data
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Supabase automatically stores the session - no manual storage needed!
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<Object>} - Sign up response data
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Supabase automatically clears the session - no manual cleanup needed!
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();

