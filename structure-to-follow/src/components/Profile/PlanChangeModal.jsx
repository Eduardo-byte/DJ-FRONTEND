import { useState, useContext, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Spinner,
  Textarea,
} from "@heroui/react";
import { AlertCircle, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { UserDataContext } from "../../context/UserDataContext";
import axios from "axios";
import { subscriptionService } from "../../api/services/subscription.service";

export default function PlanChangeModal({
  isOpen,
  onClose,
  targetPlan,
  isUpgrade,
  currentPlan,
  paymentLinks,
  isLoading: isLoadingLinks,
  hasActivePaidSubscription = true, // New prop to determine if user has paid
}) {
  const { loggedInUser, setLoggedInUser, userData, setUserData } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(false);
  const [enterpriseRequestText, setEnterpriseRequestText] = useState("");
  const [enterpriseRequestSent, setEnterpriseRequestSent] = useState(false);

  // Prevent ESC key from closing the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  // Get plan details - Updated to match PlanSettings.jsx
  const getPlanDetails = (planValue) => {
    const plans = {
      basic: {
        name: "Basic",
        price: "£4.99",
        period: "per month",
        description: "50 Messages per month, 1 AI Agents, Website Widget, Basic AI Models"
      },
      "basic-yearly": {
        name: "Basic",
        price: "£59.88",
        period: "per year",
        description: "50 Messages per month, 1 AI Agents, Website Widget, Basic AI Models"
      },
      pro: {
        name: "Pro",
        price: "£99",
        period: "per month",
        description: "Includes everything in Basic +, Additional agents, MCP tooling, CRM or WhatsApp support, Branding control"
      },
      "pro-yearly": {
        name: "Pro Yearly",
        price: "£950",
        period: "per year",
        description: "Includes everything in Basic +, Additional agents, MCP tooling, CRM or WhatsApp support, Branding control"
      },
      advanced: {
        name: "Advanced",
        price: "£249",
        period: "per month",
        description: "Includes everything in Pro +, WhatsApp, Webhook/CRM integration, Branding removal, Olivia Ask"
      },
      "advanced-yearly": {
        name: "Advanced Yearly",
        price: "£2390",
        period: "per year",
        description: "Includes everything in Pro +, WhatsApp, Webhook/CRM integration, Branding removal, Olivia Ask"
      },
      enterprise: {
        name: "Enterprise",
        price: "Custom",
        period: "contact us",
        description: "Everything in Advanced +, 24/7 phone support, Dedicated account manager, Unlimited messages or team"
      },
    };
    return plans[planValue] || plans.basic;
  };

  const currentPlanDetails = getPlanDetails(currentPlan);
  const targetPlanDetails = getPlanDetails(targetPlan);

  // Get payment link for the target plan
  const getPaymentLink = () => {
    if (!paymentLinks || Object.keys(paymentLinks).length === 0) return null;

    // Map the target plan value to the corresponding payment link key
    const planCodeMap = {
      'pro': 'Pro',
      'pro-yearly': 'ProYearly',
      'advanced': 'Advanced',
      'advanced-yearly': 'AdvancedYearly',
      'basic': 'Basic',
      'basic-yearly': 'BasicYearly'
    };

    const planCode = planCodeMap[targetPlan];
    return planCode ? paymentLinks[planCode] : null;
  };

  // Handle plan change
  const handlePlanChange = async () => {
    // For Enterprise plan requests
    if (targetPlan === "enterprise" && !enterpriseRequestSent) {
      if (!enterpriseRequestText.trim()) {
        toast.error("Please describe your requirements before submitting your request.");
        return;
      }

      setIsLoading(true);

      try {
        // Prepare the data to send to the webhook
        const webhookData = {
          client_id: userData?.client_id || '',
          email: userData?.contact_email || userData?.email || '',
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || '',
          company_name: userData?.company_name || '',
          requirements: enterpriseRequestText
        };

        // Send the request to the webhook
        await axios.post(
          'https://hook.eu1.make.com/sdm2nuy5w85ggvqggkpdi1jpqqomjsag',
          webhookData
        );

        // Update state to show success message
        setEnterpriseRequestSent(true);
        toast.success("Your Enterprise plan request has been sent successfully!");

        setIsLoading(false);
      } catch (error) {
        console.error("Error sending Enterprise plan request:", error);
        toast.error("Failed to send your request. Please try again later.");
        setIsLoading(false);
      }

      return;
    }

    let paymentLink = getPaymentLink();

    if (isUpgrade && paymentLink) {
      // For upgrades, append user details to the payment link URL
      if (userData) {
        // Create URL object to properly handle parameter addition
        const url = new URL(paymentLink);

        // Add user details as URL parameters
        if (userData.first_name) url.searchParams.append('first_name', userData.first_name);
        if (userData.last_name) url.searchParams.append('last_name', userData.last_name);
        if (userData.contact_email) url.searchParams.append('email', userData.contact_email);
        if (userData.company_name) url.searchParams.append('company_name', userData.company_name);

        // Update payment link with the new URL including parameters
        paymentLink = url.toString();
      }

      // Redirect to the payment link with user details
      window.open(paymentLink, '_blank');
      onClose();
    } else if (!isUpgrade) {
      // For downgrades, use the existing flow
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        // Update user context with new plan
        setUserData({
          ...userData,
          account_type: targetPlan,
        });
        subscriptionService.downgradePlan(userData.contact_email, targetPlan, userData.account_type, userData.client_id)

        // Show success message
        toast.success(`Successfully downgraded to ${targetPlanDetails.name} plan!`);

        // Close modal and reset state
        setIsLoading(false);
        onClose();
      }, 1500);
    } else {
      // No payment link available
      toast.error("Payment link not available. Please try again later.");
    }
  };

  return (
    <Modal isOpen={isOpen} isDismissable={false} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {!hasActivePaidSubscription ? "Choose Your Plan" : isUpgrade ? "Upgrade Your Plan" : "Change Your Plan"}
        </ModalHeader>
        <Divider />
        <ModalBody>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <h3 className="text-base font-semibold mb-1">
                {!hasActivePaidSubscription ? "Selecting:" : isUpgrade ? "Upgrading to:" : "Changing to:"}
              </h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">{targetPlanDetails.name}</p>
                  <div className="flex items-baseline">
                    <span className="text-gray-600 text-sm">{targetPlanDetails.price}</span>
                    <span className="text-gray-500 text-xs ml-1">/{targetPlanDetails.period}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{targetPlanDetails.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Current plan:</p>
                  <p className="font-medium text-sm">{currentPlanDetails.name}</p>
                </div>
              </div>
            </div>

            {isUpgrade && targetPlan !== "enterprise" && (
              <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700 text-sm">
                    Redirect to Payment Page
                  </p>
                  <p className="text-xs text-blue-600">
                    {!hasActivePaidSubscription 
                      ? "You will be redirected to our secure payment page to complete your plan selection. Your subscription will be activated immediately after payment is processed."
                      : "You will be redirected to our secure payment page to complete your upgrade. Your subscription will be updated immediately after payment is processed."
                    }
                  </p>
                </div>
              </div>
            )}

            {targetPlan === "enterprise" && !enterpriseRequestSent && (
              <>
                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700 text-sm">
                      Enterprise Plan Request
                    </p>
                    <p className="text-xs text-blue-600">
                      Our team will contact you within 24 business hours to discuss your Enterprise
                      plan requirements and provide a custom quote. This plan includes
                      unlimited AI agents, all AI models, agentic workflows automation,
                      AI voice agents, SMS engagement, email solutions, custom CRM integrations,
                      custom AI reports and analytics, API access, and custom AI model training.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Please describe your requirements
                  </label>
                  <Textarea
                    placeholder="Tell us about your business needs, expected usage, and any specific features you're interested in..."
                    value={enterpriseRequestText}
                    onChange={(e) => setEnterpriseRequestText(e.target.value)}
                    className="w-full min-h-[100px]"
                  />
                </div>
              </>
            )}

            {targetPlan === "enterprise" && enterpriseRequestSent && (
              <div className="bg-green-50 p-3 rounded-lg flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700 text-sm">
                    Request Sent Successfully
                  </p>
                  <p className="text-xs text-green-600">
                    Thank you for your interest in our Enterprise plan. Our team will contact you within 24 business hours
                    to discuss your requirements and provide a custom quote.
                  </p>
                </div>
              </div>
            )}

            {!isUpgrade && (
              <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700 text-sm">
                    Downgrade Confirmation
                  </p>
                  <p className="text-xs text-amber-600">
                    You will lose access to some features when downgrading. Your
                    plan will change immediately after confirmation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <Divider />
        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            className="bg-gray-100 text-gray-700 text-sm h-8"
          >
            Cancel
          </Button>
          <Button
            className="bg-brand text-gray-900 font-medium text-sm h-8"
            onPress={handlePlanChange}
            isLoading={isLoading || (isUpgrade && isLoadingLinks)}
            endContent={isUpgrade && !isLoadingLinks && <ExternalLink className="w-3 h-3 ml-1" />}
          >
            {isUpgrade
              ? targetPlan === "enterprise"
                ? "Request Enterprise Plan"
                : "Proceed to Payment"
              : "Confirm Downgrade"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
