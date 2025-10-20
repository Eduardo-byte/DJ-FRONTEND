import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { clientService } from "../api/services/client.service";
import { subscriptionService } from "../api/services/subscription.service";
import { chatService } from "../api/services/chat.service";
import {
  ProfileSetupStep,
  WelcomeStep,
  KnowledgeBaseStep
} from "../components/auth/register";
import { webScraperService } from "../api";

export default function RegisterSetup() {
  const [step, setStep] = useState(3); // Start from step 3 (profile setup) for OAuth, step 4 (welcome) for email
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const hasInsertedClient = useRef(false);

  // Check if user came from social login callback or email registration
  

  useEffect(() => {
    const fromSocial = searchParams.get('from');
    const userEmail = searchParams.get('email');
    const userName = searchParams.get('name');
    const businessName = searchParams.get('businessName');
    const phoneNumber = searchParams.get('phoneNumber');
    
    // If coming from email registration, skip profile setup and go to welcome step
    if (fromSocial === 'email') {
      setFormData(prev => ({
        ...prev,
        email: userEmail || '',
        firstName: userName?.split(' ')[0] || '',
        lastName: userName?.split(' ').slice(1).join(' ') || '',
        businessName: businessName || '',
        phoneNumber: phoneNumber || ''
      }));
      
      // Set step to 4 (WelcomeStep) for email users since they already provided all info
      setStep(4);
      
      toast.success(`Welcome! Your account has been created successfully.`);
      
      // Create subscription and client for email users when user is authenticated
      if (!hasInsertedClient.current && user) {
        hasInsertedClient.current = true;
        (async () => {
          try {
            console.log("Starting subscription and client creation process for email user...");
            
            // Step 1: Create subscription first
            const subscriptionData = {
              plan_name: "Basic",
              monthly_cost: 4.99,
              annual_cost: 299.99,
              message_limit: 50,
              storage_limit: 500,
              feature_list: {},
              active: true
            };
            
            console.log("Creating subscription with data:", subscriptionData);
            const subscription = await subscriptionService.createNewSubscription(subscriptionData);
            console.log("Subscription creation result:", subscription);
            
            if (!subscription || subscription.success === false) {
              console.error("Subscription creation failed:", subscription);
              throw new Error(`Failed to create subscription: ${subscription?.message || 'Unknown error'}`);
            }

            // Step 2: Create client with subscription ID
            const subscriptionId = subscription.subscription_id;
            console.log("Using subscription ID:", subscriptionId);
            
            const fullName = userName || '';
            const clientData = {
              company_name: businessName || '',
              contact_name: fullName,
              first_name: fullName.split(' ')[0] || '',
              last_name: fullName.split(' ').slice(1).join(' ') || '',
              contact_email: userEmail,
              contact_phone: phoneNumber || '',
              website: "",
              account_status: "active",
              role: "Admin",
              authenticated_id: user.id,
              account_type: "basic",
              subscription_id: subscriptionId,
              trial_message_count: 50
            };
            
            console.log("Creating client with data:", clientData);
            const result = await clientService.insertClient(clientData);
            console.log("Client creation result:", result);
            
            if (result && !result.error && result.client_id) {
              console.log("Client created successfully with ID:", result.client_id);
              setFormData(prev => ({
                ...prev,
                client_id: result.client_id
              }));
            } else {
              console.error("Client creation failed:", result);
              throw new Error(`Failed to create client: ${result?.error || 'Unknown error'}`);
            }
          } catch (err) {
            // Reset the flag if there was an error so it can be retried
            hasInsertedClient.current = false;
            console.error("Error inserting client and subscription:", err);
            toast.error("Failed to create account. Please try again.");
          }
        })();
      }
    }
    // If user is authenticated (from social login), use their data and start at profile setup
    else if (user && fromSocial) {
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || userName || '';
      const email = user.email || userEmail || '';
      
      setFormData(prev => ({
        ...prev,
        email: email,
        firstName: fullName.split(' ')[0] || '',
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        businessName: businessName || '',
        phoneNumber: phoneNumber || ''
      }));
      
      // Keep step 3 (ProfileSetupStep) for OAuth users
      toast.success(`Welcome ${fullName || 'back'}! Please complete your profile setup.`);

      // Prevent duplicate insert: only call insertClient once
      if (!hasInsertedClient.current) {
        hasInsertedClient.current = true;
        (async () => {
          try {
            console.log("Starting subscription and client creation process...");
            
            // Step 1: Create subscription first
            const subscriptionData = {
              plan_name: "Basic",
              monthly_cost: 4.99,
              annual_cost: 299.99,
              message_limit: 50,
              storage_limit: 500,
              feature_list: {},
              active: true
            };
            
            console.log("Creating subscription with data:", subscriptionData);
            const subscription = await subscriptionService.createNewSubscription(subscriptionData);
            console.log("Subscription creation result:", subscription);
            
            if (!subscription || subscription.success === false) {
              console.error("Subscription creation failed:", subscription);
              throw new Error(`Failed to create subscription: ${subscription?.message || 'Unknown error'}`);
            }

            // Step 2: Create client with subscription ID
            const subscriptionId = subscription.subscription_id;
            console.log("Using subscription ID:", subscriptionId);
            
            const clientData = {
              company_name: "",
              contact_name: fullName,
              first_name: fullName.split(' ')[0] || '',
              last_name: fullName.split(' ').slice(1).join(' ') || '',
              contact_email: email,
              contact_phone: "",
              website: "",
              account_status: "active",
              role: "Admin",
              authenticated_id: user.id,
              account_type: "basic",
              subscription_id: subscriptionId,
              trial_message_count: 50
            };
            
            console.log("Creating client with data:", clientData);
            const result = await clientService.insertClient(clientData);
            console.log("Client creation result:", result);
            
            if (result && !result.error && result.client_id) {
              console.log("Client created successfully with ID:", result.client_id);
              setFormData(prev => ({
                ...prev,
                client_id: result.client_id
              }));
            } else {
              console.error("Client creation failed:", result);
              throw new Error(`Failed to create client: ${result?.error || 'Unknown error'}`);
            }
          } catch (err) {
            // Reset the flag if there was an error so it can be retried
            hasInsertedClient.current = false;
            console.error("Error inserting client and subscription:", err);
            toast.error("Failed to create account. Please try again.");
          }
        })();
      }
    }
  }, [searchParams, user]);

  const handleProfileSetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare updated data for client
      const updatedData = {
        company_name: formData.businessName,
        contact_phone: formData.phoneNumber,
        // Add any other fields you want to update
      };

      // Use client_id from formData if available, otherwise fetch by email or authenticated_id
      let clientId = formData.client_id;
      if (!clientId && user) {
        // Try to fetch client by authenticated_id
        const client = await clientService.fetchClientDataByAudId(user.id);
        clientId = client?.client_id;
      }

      if (clientId) {
        await clientService.updateClientInfo(clientId, updatedData);
      }
      toast.success("Profile setup complete!");
      setStep(4); // Go to welcome screen
    } catch (err) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBeginJourney = () => {
    setStep(5); // Go to knowledge base step
  };

  const handleEditCompanyName = () => {
    setStep(3); // Go back to profile setup to edit company name
  };

  const handleSkipToDashboard = () => {
    navigate("/");
  };

  const handleKnowledgeBaseSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get client data to use for agent creation
      let clientData = null;
      let clientId = formData.client_id;
      
      if (!clientId && user) {
        // Try to fetch client by authenticated_id
        clientData = await clientService.fetchClientDataByAudId(user.id);
        clientId = clientData?.client_id;
      } else if (clientId) {
        // Fetch full client data if we only have the ID
        clientData = await clientService.fetchClientData(clientId);
      }

      if (!clientData || !clientId) {
        // If no client data found, try to create/fetch it using the current user
        if (user) {
          try {
            clientData = await clientService.fetchClientDataByAudId(user.id);
            if (!clientData) {
              toast.error("Please complete your profile setup first.");
              setStep(3); // Go back to profile setup
              setIsLoading(false);
              return;
            }
            clientId = clientData.client_id;
          } catch (error) {
            console.error("Error fetching client data:", error);
            toast.error("Unable to find your account information. Please try again.");
            setIsLoading(false);
            return;
          }
        } else {
          toast.error("Please log in to continue.");
          setIsLoading(false);
          return;
        }
      }

      let contentData = null
      if(formData.websiteUrl){
        contentData = await webScraperService.generateFullFlowV2(formData.websiteUrl, {})
      }

      // Prepare form data for chat widget generation (similar to CreateAgentButton.jsx)
      const agentFormData = {
        agentGoal: "Customer Support", // Default goal for knowledge base setup
        botName: formData.botName || formData.businessName || clientData.company_name || "AI Assistant",
        company_services: contentData?.agentInfo?.company_services || "",
        intro_message: contentData?.agentInfo?.intro_message || "Hello! How can I assist you today?",
        website_url: formData.websiteUrl || "",
        qualification_questions: contentData?.qualificationQuestions || [] // Empty for customer support
      };

      console.log("Creating AI agent with form data:", agentFormData);

      // Call the generateChatWidget method
      const result = await chatService.generateChatWidget(
        agentFormData,
        clientId,
        formData.businessName || clientData.company_name || "Your Company"
      );

      console.log("Chat widget generation result:", result);

      if (result && result.chat_id) {
        toast.success("AI Agent created successfully! Redirecting to playground...");
        if (formData.noWebsite && !formData.websiteUrl) {
          // Redirect to playground with the chat_id
          navigate(`/playground/${result.chat_id}`);
        }else if (formData.websiteUrl) {
          // Start web scraping if website URL is provided
          const scrapeWebsite = await webScraperService.startCrawlCronJob(result.chat_id, {
            url: formData.websiteUrl,
            limit: 500,
            clientId: clientId
          });
          // Redirect to playground with the chat_id
          navigate(`/playground/${result.chat_id}`);
        }
      } else {
        toast.error("Failed to create AI agent. Please try again.");
      }
    } catch (error) {
      console.error("Error creating AI agent:", error);
      toast.error("An error occurred while creating your AI agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKnowledgeBaseSkip = () => {
    navigate("/");
  };

  // Step 3: Profile setup
  if (step === 3) {
    return (
      <ProfileSetupStep
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleProfileSetup}
        isLoading={isLoading}
      />
    );
  }

  // Step 4: Welcome screen
  if (step === 4) {
    return (
      <WelcomeStep
        businessName={formData.businessName}
        onBeginJourney={handleBeginJourney}
        onEditCompanyName={handleEditCompanyName}
        onSkipToDashboard={handleSkipToDashboard}
        isLoading={isLoading}
      />
    );
  }

  // Step 5: Knowledge base setup
  return (
    <KnowledgeBaseStep
      formData={formData}
      onFormDataChange={setFormData}
      onSubmit={handleKnowledgeBaseSubmit}
      onSkip={handleKnowledgeBaseSkip}
      isLoading={isLoading}
    />
  );
}
