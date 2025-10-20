import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { djService, clearSessionCache } from '../api';

const useAuthStore = create((set) => ({
  // State
  user: null,
  djProfile: null,
  session: null,
  loading: true,
  initialized: false,

  // Actions
  setUser: (user) => set({ user }),
  setDjProfile: (djProfile) => set({ djProfile }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  // Initialize auth state - let Supabase handle session recovery
  initialize: async () => {
    console.log('🔄 Auth store initializing - using event-driven approach');
    
    // Set a longer timeout for initialization to allow for API calls
    const initTimeout = setTimeout(() => {
      console.log('⏰ Auth initialization timeout - setting default state');
      set({ 
        session: null, 
        user: null, 
        djProfile: null,
        loading: false,
        initialized: true
      });
    }, 10000); // Increased to 10 seconds

    // Let Supabase's onAuthStateChange handle the session
    // This will be called when Supabase completes its internal recovery
    const checkInitialState = () => {
      clearTimeout(initTimeout);
      // Don't log here - let the auth state change handler do it
    };

    // Wait for Supabase to complete its internal initialization
    // The onAuthStateChange callback will handle the actual state setting
    setTimeout(checkInitialState, 100);
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear session cache
      clearSessionCache();

      set({
        user: null,
        djProfile: null,
        session: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Refresh DJ profile
  refreshDjProfile: async () => {
    try {
      console.log('🔄 refreshDjProfile: Starting...');
      const djProfile = await djService.getDjProfile();
      console.log('🔄 refreshDjProfile: Result:', djProfile ? 'Success' : 'Failed');
      set({ djProfile });
      return djProfile;
    } catch (error) {
      console.error('❌ Error refreshing DJ profile:', error);
      set({ djProfile: null });
      return null;
    }
  },
}));

// Listen to auth state changes - this is the main auth handler
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('🔄 Auth state change:', event, session ? 'Has session' : 'No session');
  
  const store = useAuthStore.getState();
  
  // Update session and user state
  store.setSession(session);
  store.setUser(session?.user || null);

  if (event === 'SIGNED_IN' && session?.user) {
    console.log('👤 User signed in:', session.user.email);
    console.log('🔑 Session token preview:', session.access_token?.substring(0, 20) + '...');
    
    // Get DJ profile when signed in - wait for it to complete
    console.log('🔍 Fetching DJ profile after sign in...');
    
    // Add a small delay to ensure session is fully ready
    setTimeout(async () => {
      try {
        const djProfile = await store.refreshDjProfile();
        console.log('✅ DJ profile fetch completed:', djProfile ? 'Success' : 'Failed');
        
        // Only set loading to false after DJ profile is fetched (or failed)
        useAuthStore.setState({ loading: false, initialized: true });
      } catch (error) {
        console.error('❌ DJ profile fetch failed:', error);
        // Still set loading to false even if profile fetch fails
        useAuthStore.setState({ loading: false, initialized: true });
      }
    }, 100);
    
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out');
    clearSessionCache();
    store.setDjProfile(null);
    useAuthStore.setState({ loading: false, initialized: true });
    
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refreshed');
    useAuthStore.setState({ loading: false, initialized: true });
    
  } else {
    // For any other event, ensure loading is false
    console.log('🔄 Other auth event:', event);
    useAuthStore.setState({ loading: false, initialized: true });
  }
});

export default useAuthStore;
