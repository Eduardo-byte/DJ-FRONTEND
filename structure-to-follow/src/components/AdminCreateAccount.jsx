import { useState, useContext, useEffect } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Checkbox,
} from "@heroui/react";
import { UserPlus, Mail, User, Building, Phone } from "lucide-react";
import { UserDataContext } from "../context/UserDataContext";
import { clientService } from "../api/services/client.service";
import { subscriptionService } from "../api/services/subscription.service";
import { chatService } from "../api/services/chat.service";
import { supabase } from "../lib/supabase";
import axios from "axios";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/phone-input.css';

// Available roles in the system
const USER_ROLES = [
  { key: "Standard", label: "Standard User" },
  { key: "Admin", label: "Admin" },
  { key: "Agency", label: "Agency" },
  { key: "Tester", label: "Tester" },
  { key: "God Mode", label: "God Mode" },
];

// Available subscription plans
const SUBSCRIPTION_PLANS = [
  {
    key: "basic",
    label: "Basic",
    monthly_cost: 4.99,
    annual_cost: 59.88,
    message_limit: 50,
    storage_limit: 500,
  },
  {
    key: "pro",
    label: "Pro",
    monthly_cost: 99,
    annual_cost: 950,
    message_limit: 1000,
    storage_limit: 5000,
  },
  {
    key: "advanced",
    label: "Advanced",
    monthly_cost: 249,
    annual_cost: 2390,
    message_limit: 5000,
    storage_limit: 50000,
  },
  {
    key: "enterprise",
    label: "Enterprise",
    monthly_cost: 999,
    annual_cost: 9999,
    message_limit: -1, // Unlimited
    storage_limit: -1, // Unlimited
  },
];

export default function AdminCreateAccount({ isOpen, onClose, onSuccess }) {
  const { loggedInUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(false);

  // Fix dropdown z-index only when modal is open
  useEffect(() => {
    if (!isOpen) return;
    
    const style = document.createElement('style');
    style.id = 'admin-modal-dropdown-fix';
    style.textContent = `
      /* Target HeroUI Select dropdown popover - this is the actual dropdown list */
      [role="listbox"] {
        z-index: 2147483647 !important;
      }
      
      /* Target the popover wrapper that contains the listbox */
      [data-slot="base"][role="dialog"] {
        z-index: 2147483647 !important;
      }
      
      /* Target any positioned div that might be the dropdown container */
      div[style*="position: absolute"][style*="z-index"]:has([role="listbox"]) {
        z-index: 2147483647 !important;
      }
      
      /* Alternative approach - target by NextUI/HeroUI specific classes */
      .nextui-popover {
        z-index: 2147483647 !important;
      }
      
      /* Target any absolute positioned element with specific HeroUI attributes */
      div[data-slot][style*="position: absolute"] {
        z-index: 2147483647 !important;
      }
      
      /* Broader approach for any absolute positioned element that's not Joyride */
      body > div[style*="position: absolute"]:not([class*="joyride"]) {
        z-index: 2147483647 !important;
      }
      
      /* Ensure Joyride stays on top */
      [class*="joyride"], [id*="joyride"], .joyride-tooltip, .joyride-overlay {
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.getElementById('admin-modal-dropdown-fix');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, [isOpen]);

  // Generate secure password
  const generateSecurePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Sign up with email using Supabase
  const signUpWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      businessName: "",
      phoneNumber: "",
      website: "",
      role: "Admin",
      accountType: "basic",
      sendCredentials: true,
      createAgent: true,
      agentName: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setIsLoading(true);
      try {
        // Step 1: Generate password and create Supabase user
        const randomPassword = generateSecurePassword();
        const signUpResponse = await signUpWithEmail(values.email, randomPassword);
        
        if (signUpResponse.error) {
          throw new Error(signUpResponse.error.message);
        }

        const userId = signUpResponse.data.user.id;
        if (!userId) {
          throw new Error("Failed to create user account");
        }

        // Step 2: Create subscription
        const selectedPlan = SUBSCRIPTION_PLANS.find(plan => plan.key === values.accountType);
        const subscriptionData = {
          plan_name: selectedPlan.label,
          monthly_cost: selectedPlan.monthly_cost,
          annual_cost: selectedPlan.annual_cost,
          message_limit: selectedPlan.message_limit,
          storage_limit: selectedPlan.storage_limit,
          feature_list: {},
          active: true
        };

        console.log("Creating subscription with data:", subscriptionData);
        const subscription = await subscriptionService.createNewSubscription(subscriptionData);
        
        if (!subscription || subscription.success === false) {
          throw new Error(`Failed to create subscription: ${subscription?.message || 'Unknown error'}`);
        }

        // Step 3: Create main client account (not staff) - Match RegisterSetup.jsx format exactly
        const fullName = `${values.firstName} ${values.lastName}`.trim();
        const clientData = {
          company_name: values.businessName || '',
          contact_name: fullName,
          first_name: values.firstName || '',
          last_name: values.lastName || '',
          contact_email: values.email,
          contact_phone: values.phoneNumber || '',
          website: values.website || '',
          account_status: "active",
          role: values.role,
          authenticated_id: userId,
          account_type: values.accountType,
          subscription_id: subscription.subscription_id,
          trial_message_count: selectedPlan.message_limit,
        };

        console.log("Creating main client account with data:", clientData);
        const clientResult = await clientService.insertClient(clientData);
        console.log("Client creation result:", clientResult);
        
        if (!clientResult || clientResult.error) {
          console.error("Detailed client creation error:", clientResult?.error);
          // Try to extract more specific error information
          const errorMessage = clientResult?.error?.response?.data?.message || 
                              clientResult?.error?.message || 
                              'Unknown error';
          throw new Error(`Failed to create client: ${errorMessage}`);
        }

        // Step 4: Create AI Agent if requested
        if (values.createAgent) {
          try {
            const agentFormData = {
              agentGoal: "Customer Support", // Default goal
              botName: values.agentName || values.businessName || "AI Assistant",
              company_services: "",
              intro_message: "Hello! How can I assist you today?",
              website_url: values.website || "",
              qualification_questions: [] // Empty for customer support
            };

            console.log("Creating AI agent with form data:", agentFormData);

            const agentResult = await chatService.generateChatWidget(
              agentFormData,
              clientResult.client_id,
              values.businessName || "Your Company"
            );

            console.log("Chat widget generation result:", agentResult);

            if (agentResult && agentResult.chat_id) {
              console.log("AI Agent created successfully with ID:", agentResult.chat_id);
            } else {
              console.warn("Failed to create AI agent, but account creation will continue");
            }
          } catch (agentError) {
            console.error("Error creating AI agent:", agentError);
            // Don't throw error here - account creation is more important than agent creation
            toast.warning("Account created but AI agent creation failed. You can create one later.");
          }
        }

        // Step 5: Send credentials to support@olivianetwork.ai if requested
        let successMessage = "Account created successfully!";
        if (values.createAgent) {
          successMessage += " AI Agent also created.";
        }
        
        if (values.sendCredentials) {
          try {
            // Send email to support@olivianetwork.ai using existing endpoint
            const emailPayload = {
              recipient_email: ["eduardo@olivianetwork.ai", "support@olivianetwork.ai","ben@olivianetwork.ai","fabio@olivianetwork.ai","monica@olivianetwork.ai","nathan@olivianetwork.ai"],
              temporary_password: randomPassword,
              // Add additional info in a custom message format
              account_email: values.email,
              account_name: `${values.firstName} ${values.lastName}`,
              business_name: values.businessName,
              role: values.role,
              plan: values.accountType,
              created_by: loggedInUser?.email || loggedInUser?.contact_email || "Admin",
            };
            
            // Using the same endpoint as Staff.jsx with axios
            await axios.post(
              `${import.meta.env.VITE_API_URL}/send-user-info-email`,
              emailPayload,
              {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
              }
            );
            
            toast.success(
              `${successMessage} Account details sent to support@olivianetwork.ai`,
              { duration: 8000 }
            );
          } catch (emailError) {
            console.error("Error sending email notification:", emailError);
            toast.success(
              `${successMessage} (Email notification failed - password: ${randomPassword})`,
              { duration: 10000 }
            );
          }
        } else {
          toast.success(successMessage);
        }

        resetForm();
        onSuccess && onSuccess();
        onClose();

      } catch (error) {
        console.error("Error creating account:", error);
        toast.error(error.message || "Failed to create account. Please try again.");
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Only allow God Mode users to access this component
  if (loggedInUser?.role !== "God Mode") {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <span>Create New Account</span>
          </div>
          <p className="text-sm text-gray-500 font-normal">
            Create a new main client account with custom role and subscription plan
          </p>
        </ModalHeader>
        
        <ModalBody>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold">Personal Information</h4>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    type="text"
                    label="First Name"
                    placeholder="John"
                    value={formik.values.firstName}
                    onChange={(e) => formik.setFieldValue('firstName', e.target.value)}
                    isDisabled={isLoading}
                    startContent={<User className="w-4 h-4 text-default-400" />}
                    required
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    label="Last Name"
                    placeholder="Doe"
                    value={formik.values.lastName}
                    onChange={(e) => formik.setFieldValue('lastName', e.target.value)}
                    isDisabled={isLoading}
                    required
                    className="flex-1"
                  />
                </div>

                <Input
                  type="email"
                  label="Email Address"
                  placeholder="john@company.com"
                  value={formik.values.email}
                  onChange={(e) => formik.setFieldValue('email', e.target.value)}
                  isDisabled={isLoading}
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                  required
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
                  <PhoneInput
                    placeholder="Phone Number"
                    value={formik.values.phoneNumber}
                    onChange={(value) => formik.setFieldValue('phoneNumber', value)}
                    defaultCountry="GB"
                    disabled={isLoading}
                    className="phone-input-custom"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold">Business Information</h4>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  type="text"
                  label="Business Name"
                  placeholder="Acme Corporation"
                  value={formik.values.businessName}
                  onChange={(e) => formik.setFieldValue('businessName', e.target.value)}
                  isDisabled={isLoading}
                  startContent={<Building className="w-4 h-4 text-default-400" />}
                  required
                />

                <Input
                  type="url"
                  label="Website (Optional)"
                  placeholder="https://company.com"
                  value={formik.values.website}
                  onChange={(e) => formik.setFieldValue('website', e.target.value)}
                  isDisabled={isLoading}
                />
              </CardBody>
            </Card>

            {/* Account Configuration */}
            <Card>
              <CardHeader>
                <h4 className="text-lg font-semibold">Account Configuration</h4>
              </CardHeader>
              <CardBody className="space-y-4">
                <Select
                  label="User Role"
                  placeholder="Select a role"
                  selectedKeys={[formik.values.role]}
                  onSelectionChange={(selection) => {
                    const selectedRole = Array.from(selection)[0];
                    formik.setFieldValue("role", selectedRole);
                  }}
                  isDisabled={isLoading}
                  required
                >
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role.key} value={role.key}>
                      {role.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Subscription Plan"
                  placeholder="Select a plan"
                  selectedKeys={[formik.values.accountType]}
                  onSelectionChange={(selection) => {
                    const selectedPlan = Array.from(selection)[0];
                    formik.setFieldValue("accountType", selectedPlan);
                  }}
                  isDisabled={isLoading}
                  required
                >
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <SelectItem 
                      key={plan.key} 
                      value={plan.key}
                      description={`£${plan.monthly_cost}/month • ${plan.message_limit === -1 ? 'Unlimited' : plan.message_limit} messages`}
                    >
                      {plan.label}
                    </SelectItem>
                  ))}
                </Select>

                <div className="space-y-3">
                  <Checkbox
                    isSelected={formik.values.createAgent}
                    onValueChange={(checked) => {
                      formik.setFieldValue('createAgent', checked);
                      // Auto-fill agent name if not already set
                      if (checked && !formik.values.agentName) {
                        formik.setFieldValue('agentName', formik.values.businessName || 'AI Assistant');
                      }
                    }}
                  >
                    Create default AI Agent
                  </Checkbox>

                  {formik.values.createAgent && (
                    <Input
                      type="text"
                      label="Agent Name"
                      placeholder="AI Assistant"
                      value={formik.values.agentName}
                      onChange={(e) => formik.setFieldValue('agentName', e.target.value)}
                      isDisabled={isLoading}
                      size="sm"
                      description="The name for the AI agent that will be created"
                    />
                  )}

                  <Checkbox
                    isSelected={formik.values.sendCredentials}
                    onValueChange={(checked) => formik.setFieldValue('sendCredentials', checked)}
                  >
                    Send account details to support@olivianetwork.ai
                  </Checkbox>
                </div>
              </CardBody>
            </Card>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={formik.handleSubmit}
            isLoading={isLoading}
            startContent={!isLoading && <UserPlus className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
