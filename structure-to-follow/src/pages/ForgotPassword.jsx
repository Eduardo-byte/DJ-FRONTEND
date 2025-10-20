import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
} from "@heroui/react";
import { Mail, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getAuthError } from "../utils/errorMessages";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      toast.success("Reset link sent! Check your email.");
      // Redirect to login page after showing success message
      setTimeout(() => {
        navigate("/login");
      }, 2000); // Wait 2 seconds to allow the user to see the success message
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
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
            Reset password
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            We'll send you a reset link
          </p>
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

          <Button
            type="submit"
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            endContent={<Send className="w-4 h-4" />}
            isLoading={isLoading}
            size="lg"
          >
            Send reset link
          </Button>
        </form>

        <div className="text-center mt-8">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-brand font-semibold hover:opacity-80 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
