import axios from 'axios';
import { supabase } from '../../lib/supabase';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Cache the session to avoid multiple simultaneous calls
let sessionCache = null;
let sessionCacheTime = 0;
const SESSION_CACHE_DURATION = 5000; // 5 seconds

// Add auth token to requests if available
axiosInstance.interceptors.request.use(async (config) => {
  try {
    console.log('🔍 API Interceptor: Getting session for', config.method?.toUpperCase(), config.url);
    
    // Use cached session if available and not expired
    const now = Date.now();
    if (sessionCache && (now - sessionCacheTime) < SESSION_CACHE_DURATION) {
      console.log('🔄 API: Using cached session');
      if (sessionCache?.access_token) {
        config.headers.Authorization = `Bearer ${sessionCache.access_token}`;
        console.log('✅ API: Bearer token attached (cached) for', config.method?.toUpperCase(), config.url);
      }
      return config;
    }
    
    // Get the current session - don't use timeout here, let it work naturally
    console.log('🔄 API: Fetching fresh session...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Cache the session
    sessionCache = session;
    sessionCacheTime = now;
    
    if (error) {
      console.warn('❌ API: Session error:', error.message);
      // Don't return early, let the request proceed without auth
    }
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('✅ API: Bearer token attached for', config.method?.toUpperCase(), config.url);
      console.log('🔑 Token preview:', session.access_token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ API: No session or access_token for', config.method?.toUpperCase(), config.url);
      console.log('🔍 Session data:', { hasSession: !!session, hasToken: !!session?.access_token });
      // Don't return early, let the request proceed without auth
    }
  } catch (error) {
    console.warn('❌ API: Auth failed for', config.method?.toUpperCase(), config.url, error.message);
    // Don't return early, let the request proceed without auth
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear session cache
      sessionCache = null;
      sessionCacheTime = 0;
      
      // Sign out and redirect to login
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out:', e);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export function to clear session cache
export const clearSessionCache = () => {
  sessionCache = null;
  sessionCacheTime = 0;
  console.log('🔄 API: Session cache cleared');
};

export default axiosInstance;

