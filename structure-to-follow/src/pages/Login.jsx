import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { clientExtensionService, facebookService, metaAuthService } from "../api/index.js";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getAuthError } from "../utils/errorMessages";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle auth error from Facebook/Instagram
  useEffect(() => {
    // Check if we have an auth error
    const searchParams = new URLSearchParams(location.search);
    const isAuthError = searchParams.get('auth_error') === 'true';
    const error = searchParams.get('error');

    if (isAuthError && error) {
      toast.error(`Authentication failed: ${error}`);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      const from = location.state?.from?.pathname || "/";
      navigate(from);
      toast.success("Welcome back!");
    } catch (error) {
      toast.error(getAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      toast.success(`Connecting with ${provider}...`);
      if (provider === "Google") {
        await signInWithGoogle();
      } else if (provider === "Facebook") {
        await signInWithFacebook();
      }
    } catch (error) {
      toast.error(`Failed to connect with ${provider}. Please try again.`);
      console.error(`${provider} login error:`, error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <img
            className="w-[80px] mx-auto mb-4"
            src="Olivia-ai-LOGO.png"
            alt="Olivia AI Network"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome to <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">Olivia AI Network</span>
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to your account to continue
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {/* Google */}
          <Button
            className="w-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 min-h-[48px] justify-start"
            startContent={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            }
            onPress={() => handleSocialLogin("Google")}
          >
            Continue with Google
          </Button>

          {/* Facebook */}
          <Button
            className="w-full bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 min-h-[48px] justify-start"
            startContent={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            }
            onPress={() => handleSocialLogin("Facebook")}
          >
            Continue with Facebook
          </Button>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            type="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            endContent={<Mail className="w-4 h-4 text-gray-400" />}
            isDisabled={isLoading}
            autoComplete="email"
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />
          <Input
            type="password"
            label="Password"
            labelPlacement="outside"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endContent={<Lock className="w-4 h-4 text-gray-400" />}
            isDisabled={isLoading}
            autoComplete="current-password"
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-500 hover:text-brand transition-all duration-200"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            endContent={<ArrowRight className="w-4 h-4" />}
            isLoading={isLoading}
            size="lg"
          >
            Sign in
          </Button>
        </form>

        <div className="text-center mt-8">
          <span className="text-sm text-gray-500">
            Don't have an account?{" "}
          </span>
          <Link
            to="/register"
            className="text-sm text-brand font-semibold hover:opacity-80 transition-all duration-200"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
