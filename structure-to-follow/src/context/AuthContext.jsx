import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { clientService } from "../api/services/client.service";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingSetup, setCheckingSetup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the current session and set the user
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle sign in - check if user needs to complete setup
      if (event === 'SIGNED_IN' && session?.user) {
        const currentPath = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        const fromProvider = searchParams.get('from');
        
        // Skip redirect logic if already on register/setup pages or login page
        if (currentPath.includes('/register') || currentPath.includes('/login')) {
          return;
        }
        
        // Skip redirect logic if user is already on a protected route (likely a page refresh)
        // This prevents redirecting to dashboard when user refreshes any page
        const protectedRoutes = ['/conversations', '/leads', '/campaigns', '/playground', '/integrations', '/whatsapp-templates', '/staff', '/profile', '/agents', '/api-keys', '/ask'];
        const isOnProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
        
        if (isOnProtectedRoute) {
          console.log('User already on protected route, skipping redirect logic');
          return;
        }
        
        // Set checking setup state to show loading screen
        setCheckingSetup(true);
        
        // Add a small delay to ensure the auth state is fully settled
        setTimeout(async () => {
          try {
            console.log('Checking client setup for user:', session.user.id);
            
            // Fetch client data to check if setup is complete
            const clientData = await clientService.fetchClientDataByAudId(session.user.id);
            // console.log('Client data:', clientData);
            
            if (!clientData) {
              console.log('No client record found');
              // No client record exists - redirect to setup for social login
              if (session.user.app_metadata?.provider !== 'email') {
                console.log('Social login user without client record - redirecting to setup');
                navigate(`/register/setup?from=${session.user.app_metadata?.provider || 'social'}`);
              } else {
                console.log('Email user without client record - redirecting to login');
                navigate('/login');
              }
            } else {
              // Client record exists - check if setup is complete
              const isSetupComplete = clientData.company_name && clientData.contact_phone;
              // console.log('Setup complete?', isSetupComplete, {
              //   company_name: clientData.company_name,
              //   contact_phone: clientData.contact_phone
              // });
              
              if (!isSetupComplete) {
                // Setup not complete - redirect to setup
                const provider = session.user.app_metadata?.provider || 'email';
                console.log('Setup incomplete - redirecting to setup');
                navigate(`/register/setup?from=${provider}`);
              } else {
                // Setup complete - redirect to dashboard
                console.log('Setup complete - redirecting to dashboard');
                navigate('/');
              }
            }
          } catch (error) {
            console.error('Error checking client setup status:', error);
            // On error, redirect to dashboard instead of login for better UX
            navigate('/');
          } finally {
            // Always reset checking setup state
            setCheckingSetup(false);
          }
        }, 100);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    // Redirect to root and let auth state change logic handle routing
    const redirectUrl = `${window.location.origin}/`;
    console.log('Google OAuth redirect URL:', redirectUrl); // Debug log
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    // Redirect to root and let auth state change logic handle routing
    const redirectUrl = `${window.location.origin}/`;
    console.log('Facebook OAuth redirect URL:', redirectUrl); // Debug log
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    checkingSetup,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    signInWithFacebook,
  };

  // Show loading screen while checking authentication or setup
  if (loading || checkingSetup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/Olivia-ai-LOGO.png" alt="Olivia AI" className="w-full h-full animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">
            {loading ? 'Loading...' : 'Setting up your account...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
