import { useState, useContext, useEffect } from "react";
import {
  Card,
  CardBody,
  Badge,
  Button,
  Divider,
} from "@heroui/react";
import {
  Check,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { UserDataContext } from "../../context/UserDataContext";
import PlanComparisonTable from "./PlanComparisonTable";
import PlanChangeModal from "./PlanChangeModal";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import { subscriptionService } from "../../api";

import Joyride from "react-joyride";
import useTourController from "../../Demo/utils/useTourController";
import { planSteps } from '../../Demo/Profile/plan.demo'
import MyCustomTooltip from "../../Demo/CustomTooltip/MyCustomTooltip";

export default function PlanSettings() {
  const { userData, loggedInUser } = useContext(UserDataContext);
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [currentPlan, setCurrentPlan] = useState("basic");
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false);
  const [targetPlan, setTargetPlan] = useState("");
  const [isUpgrade, setIsUpgrade] = useState(true);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [paymentLinks, setPaymentLinks] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [hasCancellationScheduled, setHasCancellationScheduled] = useState(false);
  const [cancellationDate, setCancellationDate] = useState(null);

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("plans", loggedInUser);

  // Set current plan based on user data
  useEffect(() => {
    if (userData && userData.account_type) {
      setCurrentPlan(userData.account_type);
      //console.log("account type: ", userData.account_type)
      setSelectedPlan(userData.account_type);
    }
  }, [userData]);

  // Fetch payment links when component mounts
  useEffect(() => {
    const fetchPaymentLinks = async () => {
      setIsLoading(true);
      try {
        const response = await subscriptionService.getPaymentLinks();
        //console.log("PAYMENT LINLS")
        if (response && response.success) {
          setPaymentLinks(response.paymentLinks);
          //console.log("Payment links fetched:", response.paymentLinks);
        }
      } catch (error) {
        console.error("Error fetching payment links:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentLinks();
  }, []);

  // Fetch subscription data when component mounts or user changes
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (userData && userData.client_id) {
        try {
          const data = await subscriptionService.getSubscriptionByClientId(userData.client_id);
          //console.log("subscription data", data);
          setSubscriptionData(data);

          // Check if cancellation is scheduled
          if (data && data.zoho_info &&
            Object.keys(data.zoho_info).length > 0 &&
            data.zoho_info.action_type === 'cancel' &&
            data.zoho_info.scheduled_cancellation_date) {
            setHasCancellationScheduled(true);
            setCancellationDate(data.zoho_info.scheduled_cancellation_date);
          } else {
            setHasCancellationScheduled(false);
            setCancellationDate("")
          }

          if (data &&
            Object.keys(data.zoho_info).length == 0) {
            // console.log("I dont have data.zoho_info");
          } else {
            console.log("");
          }
        } catch (error) {
          console.error("Error fetching subscription data:", error);
        }
      }
    };

    fetchSubscriptionData();
  }, [userData, userData.client_id]);

  const getPlans = () => {
    const monthlyPlans = [
      {
        name: "Basic",
        price: "£4.99",
        period: "per month",
        trial: "Free 14 Day Trial",
        features: [
          "50 Messages per month",
          "1 AI Agents",,
          "Website Widget",
          "Basic AI Models",
        ],
        value: "basic",
      },
      {
        name: "Pro",
        price: "£99",
        period: "per month",
        trial: "Free 14 Day Trial",
        features: [
          "Includes everything in Basic +",
          "Additional agents",
          "MCP tooling",
          "CRM or WhatsApp support",
          "Branding control",
        ],
        value: "pro",
        popular: true,
      },
      {
        name: "Advanced",
        price: "£249",
        period: "per month",
        trial: "Free 14 Day Trial",
        features: [
          "Includes everything in Pro +",
          "WhatsApp",
          "Webhook/CRM integration",
          "Branding removal",
          "Olivia Ask",
        ],
        value: "advanced",
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "contact us",
        features: [
          "Everything in Advanced +",
          "24/7 phone support",
          "Dedicated account manager",
          "Unlimited messages or team",
        ],
        value: "enterprise",
      },
    ];

    const yearlyPlans = [
      {
        name: "Basic",
        price: "£59.88",
        period: "per year",
        trial: "Free 14 Day Trial",
        features: [
          "50 Messages per month",
          "1 AI Agents",,
          "Website Widget",
          "Basic AI Models",
        ],
        value: "basic-yearly",
      },
      {
        name: "Pro Yearly",
        price: "£950",
        period: "per year",
        trial: "Free 14 Day Trial",
        features: [
          "Includes everything in Basic +",
          "Additional agents",
          "MCP tooling",
          "CRM or WhatsApp support",
          "Branding control",
        ],
        value: "pro-yearly",
        popular: true,
      },
      {
        name: "Advanced Yearly",
        price: "£2390",
        period: "per year",
        trial: "Free 14 Day Trial",
        features: [
          "Includes everything in Pro +",
          "WhatsApp",
          "Webhook/CRM integration",
          "Branding removal",
          "Olivia Ask",
        ],
        value: "advanced-yearly",
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "contact us",
        features: [
          "Everything in Advanced +",
          "24/7 phone support",
          "Dedicated account manager",
          "Unlimited messages or team",
        ],
        value: "enterprise",
      },
    ];

    return billingCycle === "monthly" ? monthlyPlans : yearlyPlans;
  };

  const plans = getPlans();

  // Determine if changing to a plan is an upgrade or downgrade
  const isPlanUpgrade = (targetPlanValue) => {
    // Extract the base plan type (without -yearly suffix)
    const getBasePlan = (plan) => plan.replace('-yearly', '');

    // Check if target is yearly version of current plan
    const isYearlyUpgrade =
      targetPlanValue.includes('yearly') &&
      !currentPlan.includes('yearly') &&
      getBasePlan(targetPlanValue) === getBasePlan(currentPlan);

    if (isYearlyUpgrade) {
      return true; // Upgrading from monthly to yearly of same plan type
    }

    const planRank = {
      basic: 0,
      "basic-yearly": 0,
      pro: 1,
      "pro-yearly": 1,
      advanced: 2,
      "advanced-yearly": 2,
      enterprise: 3
    };
    return planRank[targetPlanValue] > planRank[currentPlan];
  };

  // Add this helper function (or inline it) to evaluate if a downgrade is not allowed:
  const isDowngradeNotAllowed = (targetPlanValue) => {
    // Only consider downgrade disallowance when NOT upgrading
    if (isPlanUpgrade(targetPlanValue)) return false;
    // Ensure we have subscription data and the current plan is pro or enterprise
    if (
      subscriptionData &&
      (subscriptionData.plan_name === "pro" || subscriptionData.plan_name === "enterprise" || subscriptionData.plan_name === "custom") &&
      Object.keys(subscriptionData.zoho_info || {}).length === 0
    ) {
      return true;
    }
    return false;
  };

  // Handle plan change button click
  const handlePlanChangeClick = (plan) => {
    // Check if user has actually paid (zoho_info is not empty)
    const hasActivePaidSubscription = subscriptionData && 
      subscriptionData.zoho_info && 
      Object.keys(subscriptionData.zoho_info).length > 0;

    // If user hasn't paid, allow them to "upgrade" to any plan (including their current plan)
    if (!hasActivePaidSubscription) {
      setTargetPlan(plan);
      setIsUpgrade(true); // Always treat as upgrade for unpaid users
      setShowPlanChangeModal(true);
      return;
    }

    // For paid users, prevent selecting the same plan
    if (plan === currentPlan) {
      return; // No change needed
    }

    // Prevent downgrade if not allowed
    if (!isPlanUpgrade(plan) && isDowngradeNotAllowed(plan)) {
      return;
    }

    setTargetPlan(plan);
    setIsUpgrade(isPlanUpgrade(plan));
    setShowPlanChangeModal(true);
  };

  return (
    <div className="mt-6">
      {/* Joyride component at the top level */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={planSteps}
        run={runTour}
        scrollOffset={300}
        continuous={true}
        showSkipButton={true}
        tooltipComponent={MyCustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      {hasCancellationScheduled && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <p className="text-sm font-medium">
            Your subscription is scheduled to be canceled on <strong>{new Date(cancellationDate).toLocaleDateString()}</strong>.
            After this date, you will lose access to your Agents and premium features.
            In order to reactivate your account, please send an email to{" "}
            <a
              href="mailto:support@olivianetwork.ai"
              className="underline font-bold hover:text-yellow-900"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:support@olivianetwork.ai";
              }}
            >
              support@olivianetwork.ai
            </a>.
          </p>
        </div>
      )}

      <div className="welcome-plan">

        <div className="flex justify-center mb-6 monthly-year">
          <div className="border border-gray-200 rounded-lg flex overflow-hidden">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 text-sm ${billingCycle === 'monthly' ? 'bg-brand text-gray-900' : 'bg-white text-gray-600'}`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 text-sm ${billingCycle === 'yearly' ? 'bg-brand text-gray-900' : 'bg-white text-gray-600'}`}
            >
              Yearly Billing (Save up to 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 downgrade-upgrade">
          {plans.map((plan) => {
            const isPlanCurrent = currentPlan === plan.value;
            const isHigherPlan = isPlanUpgrade(plan.value);

            return (
              <Card
                key={plan.value}
                className={`w-full  ${isPlanCurrent
                  ? "border-2 border-brand"
                  : plan.popular && !isPlanCurrent
                    ? "border-2 border-brand/50"
                    : "border border-gray-200"
                  } overflow-hidden`}
                shadow="none"
              >
                <CardBody className="p-3 overflow-hidden">
                  {plan.popular && (
                    <div className="absolute top-0 right-0 mt-2 mr-2">
                      <div className="bg-brand/20 border border-brand text-xs font-medium text-gray-900 px-2 py-0.5 rounded-md">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 flex flex-col h-full justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">
                          {plan.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">{plan.period}</span>
                      </div>
                      {plan.trial && (
                        <div className="text-xs text-gray-600">{plan.trial}</div>
                      )}
                      <Divider className="my-1" />
                      <ul className="space-y-1">
                        {plan.features.slice(0, 5).map((feature, index) => (
                          <li
                            key={index}
                            className={`flex items-start gap-2 text-xs ${isPlanCurrent ? "text-gray-900" : "text-gray-600"
                              }`}
                          >
                            <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isPlanCurrent ? "text-brand" : "text-gray-400"}`} />
                            <span className="line-clamp-2">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-xs text-brand font-medium">
                            +{plan.features.length - 5} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* {!hasCancellationScheduled && (
                    <>
                      {isPlanCurrent ? (
                        <div className="w-full bg-gray-100 text-gray-700 font-medium text-xs h-7 rounded flex items-center justify-center">
                          Current Plan <Check className="w-3 h-3 ml-1" />
                        </div>
                      ) : (
                        <Button
                          className={`w-full ${isHigherPlan
                            ? "bg-brand text-gray-900"
                            : "bg-gray-900 text-white"
                            } font-medium text-sm h-8`}
                          onPress={() => handlePlanChangeClick(plan.value)}
                          endContent={
                            isHigherPlan ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )
                          }
                        >
                          {isHigherPlan
                            ? (plan.value.includes('yearly') && !currentPlan.includes('yearly') &&
                              plan.value.replace('-yearly', '') === currentPlan)
                              ? "Upgrade to Year Plan"
                              : "Upgrade"
                            : "Downgrade"
                          }
                        </Button>
                      )}
                    </>
                  )} */}
                    {!hasCancellationScheduled && (
                      <>
                        {(() => {
                          // Check if user has actually paid (zoho_info is not empty)
                          const hasActivePaidSubscription = subscriptionData && 
                            subscriptionData.zoho_info && 
                            Object.keys(subscriptionData.zoho_info).length > 0;
                          
                          // Only show "Current Plan" if user has paid AND this is their current plan
                          const shouldShowCurrentPlan = isPlanCurrent && hasActivePaidSubscription;
                          
                          if (shouldShowCurrentPlan) {
                            return (
                              <div className="w-full bg-gray-100 text-gray-700 font-medium text-xs h-7 rounded flex items-center justify-center">
                                Current Plan <Check className="w-3 h-3 ml-1" />
                              </div>
                            );
                          } else {
                            // Show upgrade button for all plans if user hasn't paid, or for non-current plans
                            const higherPlan = isPlanUpgrade(plan.value);
                            const disableDowngrade = !higherPlan && isDowngradeNotAllowed(plan.value);
                            
                            return (
                              <Button
                                disabled={disableDowngrade}
                                className={`w-full ${disableDowngrade ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${higherPlan || !hasActivePaidSubscription ? "bg-brand text-gray-900" : "bg-gray-900 text-white"
                                  } font-medium text-sm h-8`}
                                onPress={!disableDowngrade ? () => handlePlanChangeClick(plan.value) : undefined}
                                endContent={
                                  (higherPlan || !hasActivePaidSubscription) ? (
                                    <ArrowUp className="w-3 h-3" />
                                  ) : (
                                    <ArrowDown className="w-3 h-3" />
                                  )
                                }
                              >
                                {!hasActivePaidSubscription
                                  ? "Choose Plan"
                                  : higherPlan
                                    ? plan.value.includes("yearly") &&
                                      !currentPlan.includes("yearly") &&
                                      plan.value.replace("-yearly", "") === currentPlan
                                      ? "Upgrade to Year Plan"
                                      : "Upgrade"
                                    : "Downgrade"}
                              </Button>
                            );
                          }
                        })()}
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <div className="plan-table">
          <PlanComparisonTable currentPlan={currentPlan} />
        </div>
      </div>

      {(!hasCancellationScheduled) && (
        <div className="mt-6 p-4 border border-gray-200 bg-white rounded-lg">
          <div className="flex flex-col md:flex-row gap-2 justify-start items-start md:justify-between md:items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Cancel Your Subscription</h3>
              <p className="text-sm text-gray-600">
                If you no longer need premium features, you can cancel your subscription and revert to the Basic plan.
              </p>
            </div>
            <Button
              className="border border-red-300 bg-white text-red-600 font-medium text-sm h-8"
              onPress={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </Button>
          </div>
        </div>
      )}

      <PlanChangeModal
        isOpen={showPlanChangeModal}
        onClose={() => setShowPlanChangeModal(false)}
        targetPlan={targetPlan}
        isUpgrade={isUpgrade}
        currentPlan={currentPlan}
        paymentLinks={paymentLinks}
        isLoading={isLoading}
        hasActivePaidSubscription={subscriptionData && 
          subscriptionData.zoho_info && 
          Object.keys(subscriptionData.zoho_info).length > 0}
      />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
}
