import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import { Toaster } from "sonner";

// Pages
import { Agents, ApiKeys, Ask, Conversations, Dashboard, EmailCampaign, Extensions, ForgotPassword, Leads, Login, Playground, Profile, Register, RegisterSetup, ResetPassword, SmsCampaign, Staff } from "./pages";
import AuthCallback from "./pages/AuthCallback";
import DashboardLayout from "./layouts/DashboardLayout";
import DirectUpdatePassword from "./pages/DirectUpdatePassword";
import WhatsAppAuthCallback from "./pages/WhatsppAuthCallback";
import WhatsAppTemplates from "./pages/WhatsappTemplates";
import ChatLanding from "./pages/ChatLanding";
import SocialMedia from "./pages/SocialMedia";

function App() {
  return (
    <HeroUIProvider>
      <Router>
        <Toaster richColors position="top-right" />
        <Routes>
          {/* Chat landing page - completely outside AuthProvider to prevent redirects */}
          <Route path="/chat/:agentId" element={<ChatLanding />} />
          
          {/* All other routes wrapped in AuthProvider */}
          <Route path="/*" element={
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/setup" element={<RegisterSetup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<ResetPassword />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route path="/whatsapp-auth-callback" element={<WhatsAppAuthCallback />} />
                <Route path="/direct-update-password" element={<DirectUpdatePassword />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/ask"
                element={
                  <RoleProtectedRoute requiredRole="God Mode">
                    <Ask />
                  </RoleProtectedRoute>
                }
              />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/campaigns/social-media" element={<SocialMedia />} />
              <Route path="/campaigns/sms" element={<SmsCampaign />} />
              <Route path="/campaigns/email" element={<EmailCampaign />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/playground/:agentId" element={<Playground />} />
              <Route path="/integrations" element={<Extensions />} />
              <Route path="/whatsapp-templates" element={<WhatsAppTemplates />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/agents" element={<Agents />} />
              <Route
                path="/api-keys"
                element={
                  <RoleProtectedRoute requiredRole="God Mode">
                    <ApiKeys />
                  </RoleProtectedRoute>
                }
              />
            </Route>
              </Routes>
            </AuthProvider>
          } />
        </Routes>
      </Router>
    </HeroUIProvider>
  );
}

export default App;
