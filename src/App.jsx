import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/useAuthStore';

// Components
import Layout from './components/Layout';
import GuardedRoute from './components/GuardedRoute';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Finances from './pages/Finances';
import Settings from './pages/Settings';
import PublicRequest from './pages/PublicRequest';
import DjRouter from './pages/DjRouter';

function App() {
  const { initialize, loading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading spinner while initializing auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes - NO LAYOUT */}
        <Route path="/r/:djSlug" element={<DjRouter />} />
        <Route path="/event/:eventId/request" element={<PublicRequest />} />
        
        {/* Auth Routes - WITH LAYOUT */}
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        
        {/* Protected DJ Routes - WITH LAYOUT */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <GuardedRoute>
                <Dashboard />
              </GuardedRoute>
            </Layout>
          }
        />
        <Route
          path="/events"
          element={
            <Layout>
              <GuardedRoute>
                <Events />
              </GuardedRoute>
            </Layout>
          }
        />
        <Route
          path="/finances"
          element={
            <Layout>
              <GuardedRoute>
                <Finances />
              </GuardedRoute>
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <GuardedRoute>
                <Settings />
              </GuardedRoute>
            </Layout>
          }
        />
        
        {/* Test route to verify routing works */}
        <Route path="/test" element={
          <div style={{padding: '20px'}}>
            <h1>Test Route Works!</h1>
            <p>If you see this, routing is working.</p>
            <a href="/r/dj-ed-9eded26f">Test QR Route</a>
          </div>
        } />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="text-6xl mb-4">404</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                  <p className="text-gray-600 mb-4">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            </Layout>
          }
        />
      </Routes>
      
      {/* Global Toast Notifications */}
      <Toast />
    </Router>
  );
}

export default App;