import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAuthError } from "../utils/errorMessages";
import { clientService } from "../api/services/client.service";
import { subscriptionService } from "../api/services/subscription.service";
import {
  RegistrationMethodStep,
  EmailRegistrationStep
} from "../components/auth/register";

export default function Register() {
  const [step, setStep] = useState(1); // 1: registration method, 2: email form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    businessName: "",
    phoneNumber: "",
    profileEmail: "",
    websiteUrl: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState("");
  const { signUp, signInWithGoogle, signInWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Step 1: Create Supabase user account
      await signUp(formData.email, formData.password);
      
      // For email registration, we can't create subscription and client immediately
      // because the user needs to confirm their email first and we don't have the user ID yet.
      // The client creation will happen in RegisterSetup.jsx when they complete the setup
      // after email confirmation, similar to how it works for OAuth users.
      
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      toast.success("Account created successfully! Please check your email to confirm your account.");
      
      // Redirect to setup route with user data
      // The RegisterSetup.jsx will handle creating subscription and client when the user is authenticated
      navigate(`/register/setup?from=email&email=${encodeURIComponent(formData.email)}&name=${encodeURIComponent(fullName)}&businessName=${encodeURIComponent(formData.businessName)}&phoneNumber=${encodeURIComponent(formData.phoneNumber || '')}`);
      
    } catch (error) {
      console.error("Error in email registration:", error);
      toast.error(getAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setRegistrationMethod(provider);
    setIsLoading(true);
    
    try {
      if (provider === "Google") {
        await signInWithGoogle();
        // The redirect will be handled by Supabase
      } else if (provider === "Facebook") {
        await signInWithFacebook();
        // The redirect will be handled by Supabase
      }
    } catch (error) {
      toast.error(`Failed to connect with ${provider}: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleEmailContinue = () => {
    setRegistrationMethod("email");
    setStep(2);
  };

  const handleBackToOptions = () => {
    setStep(1);
  };

  // Step 1: Registration method selection
  if (step === 1) {
    return (
      <RegistrationMethodStep
        onEmailContinue={handleEmailContinue}
        onSocialLogin={handleSocialLogin}
      />
    );
  }

  // Step 2: Email registration form
  return (
    <EmailRegistrationStep
      formData={formData}
      onFormDataChange={setFormData}
      onSubmit={handleEmailSubmit}
      onBack={handleBackToOptions}
      isLoading={isLoading}
    />
  );
}
