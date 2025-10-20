import React, { useState, useEffect } from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { Check, X, Info } from "lucide-react";

export default function PlanComparisonTable({ currentPlan }) {
  const [containerWidth, setContainerWidth] = useState('100%');

  useEffect(() => {
    const updateWidth = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) { // mobile
        setContainerWidth(`${screenWidth - 88}px`); // Account for padding
      } else {
        setContainerWidth('100%');
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  // Define features and their availability by plan
  const features = [
    {
      name: "Messages",
      free: "50 messages",
      pro: "1,000 messages",
      advanced: "10,000 messages",
      enterprise: "Unlimited messages",
      category: "Messaging",
    },
    {
      name: "AI Agents",
      free: "1 AI Agent",
      pro: "3 AI Agents",
      advanced: "5 AI Agents",
      enterprise: "Unlimited Agents",
      category: "Agents",
    },
    {
      name: "OpenAI Models",
      free: "Basic Models",
      pro: "Advanced Models",
      advanced: "Advanced Models",
      enterprise: "Advanced Models + Reasoning Models",
      category: "AI Models",
    },
    {
      name: "Anthropic Models",
      free: "Basic Models",
      pro: "Advanced Models",
      advanced: "Advanced Models",
      enterprise: "Advanced Models + Reasoning Models",
      category: "AI Models",
    },
    {
      name: "XAI Models",
      free: "Basic Models",
      pro: "Advanced Models",
      advanced: "Advanced Models",
      enterprise: "Advanced Models + Reasoning Models",
      category: "AI Models",
    },
    {
      name: "Gemini Models",
      free: "Basic Models",
      pro: "Advanced Models",
      advanced: "Advanced Models",
      enterprise: "Advanced Models + Reasoning Models",
      category: "AI Models",
    },
    // {
    //   name: "Agent Capabilities",
    //   free: "Basic capabilities",
    //   pro: "Advanced AI capabilities",
    //   advanced: "Advanced AI capabilities",
    //   enterprise: "Custom AI model training",
    //   category: "Agents",
    // },
    {
      name: "Additional Agents",
      free: null,
      pro: "£9.99/month per agent",
      advanced: "£4.99/month per agent",
      enterprise: "All included",
      category: "Agents",
    },
    {
      name: "Agentic Workflows",
      free: null,
      pro: 'Basic workflow automation',
      advanced: "Advanced workflow automation",
      enterprise: "Custom automations",
      category: "Advanced Agent Configuration",
    },
    {
      name: "MCP Tooling",
      free: null,
      pro: '',
      advanced: "",
      enterprise: "",
      category: "Advanced Agent Configuration",
    },
     {
      name: "Website",
      free: "",
      pro: "",
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
    {
      name: "Facebook",
      free: "",
      pro: "",
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
    {
      name: "Instagram",
      free: "",
      pro: "",
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
    {
      name: "Twitter",
      free: null,
      pro: "",
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
      {
      name: "Telegram",
      free: null,
      pro: "",
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
        {
      name: "WhatsApp",
      free: null,
      pro: null,
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
   
    {
      name: "Webhook (CRM)",
      free: null,
      pro: null,
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
    {
      name: "Custom CRM",
      free: null,
      pro: null,
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
      {
      name: "Email Solutions",
      free: null,
      pro: null,
      advanced: "",
      enterprise: "",
      category: "Channels",
    },
      {
      name: "SMS Engagement",
      free: null,
      pro: null,
      advanced: null,
      enterprise: "",
      category: "Channels",
    },
  
    {
      name: "Support",
      free: "Email support",
      pro: "Priority support",
      advanced: "Priority support",
      enterprise: "24/7 phone support + Dedicated account manager",
      category: "Support",
    },
    {
      name: "Team Members",
      free: "1 team member",
      pro: "Up to 3 team members",
      advanced: "Up to 10 team members",
      enterprise: "Unlimited team members",
      category: "Team",
    },
    {
      name: "Custom AI Reports",
      free: null,
      pro: null,
      advanced: "",
      enterprise: "",
      category: "Olivia Ask",
    },
    {
      name: "Remove Olivia Branding",
      free: null,
      pro: "",
      advanced: "",
      enterprise: "",
      category: "Customization",
    },
  ];

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {});

  // Helper function to render feature availability
  const renderFeatureAvailability = (plan, value) => {
    const isCurrentPlan = plan === currentPlan;

    if (value === null) {
      return (
        <div className="flex justify-center">
          <X
            className={`w-4 h-4 ${isCurrentPlan ? "text-red-500" : "text-gray-400"
              }`}
          />
        </div>
      );
    }

    return (
      <div className={`text-xs ${isCurrentPlan ? "font-medium" : "text-gray-600"}`}>
        <div className="flex items-center justify-center gap-1.5">
          <Check
            className={`w-3 h-3 flex-shrink-0 ${isCurrentPlan ? "text-brand" : "text-gray-400"
              }`}
          />
          <span className="line-clamp-2 text-center">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <Card 
      className="border border-gray-200 mt-6 overflow-hidden" 
      shadow="none"
      style={{ width: containerWidth }}
    >
      <CardBody className="p-0 overflow-hidden">
        <div className="p-3 bg-gray-50">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand" />
            Plan Comparison
          </h3>
          <p className="text-xs text-gray-600">
            Compare features across different plans to find the best fit for your needs
          </p>
        </div>
        <Divider />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-900 w-1/5">
                  Feature
                </th>
                <th className="py-2 px-3 text-center text-xs font-semibold text-gray-900 w-1/5">
                  Free
                  {currentPlan === "free" && (
                    <span className="ml-1 text-[10px] bg-brand text-gray-900 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </th>
                <th className="py-2 px-3 text-center text-xs font-semibold text-gray-900 w-1/5">
                  Pro
                  {currentPlan === "pro" && (
                    <span className="ml-1 text-[10px] bg-brand text-gray-900 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </th>
                <th className="py-2 px-3 text-center text-xs font-semibold text-gray-900 w-1/5">
                  Advanced
                  {currentPlan === "advanced" && (
                    <span className="ml-1 text-[10px] bg-brand text-gray-900 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </th>
                <th className="py-2 px-3 text-center text-xs font-semibold text-gray-900 w-1/5">
                  Enterprise
                  {currentPlan === "enterprise" && (
                    <span className="ml-1 text-[10px] bg-brand text-gray-900 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedFeatures).map(([category, categoryFeatures], categoryIndex) => (
                <React.Fragment key={category}>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={5}
                      className="py-1.5 px-3 text-[10px] font-semibold text-gray-500 uppercase text-left"
                    >
                      {category}
                    </td>
                  </tr>
                  {categoryFeatures.map((feature, featureIndex) => (
                    <tr
                      key={`${category}-${feature.name}`}
                      className={featureIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="py-2 px-3 text-xs font-medium text-gray-900 text-left">
                        {feature.name}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {renderFeatureAvailability("free", feature.free)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {renderFeatureAvailability("pro", feature.pro)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {renderFeatureAvailability("advanced", feature.advanced)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {renderFeatureAvailability("enterprise", feature.enterprise)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
