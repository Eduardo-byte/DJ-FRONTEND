import { useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { Users, MessageSquare, Calendar, Sparkles, Plus, Pencil, X } from "lucide-react";
import RegenerateModal from "./RegenerateModal";

export default function GoalSelectionStep({ wizardData, updateWizardData }) {
  // Debug: Log the wizardData to see if analysisResult is being passed correctly
  // console.log("GoalSelectionStep wizardData:", wizardData);
  // console.log("Analysis result:", wizardData?.manualData?.analysisResult);
  // console.log("Qualification questions:", wizardData?.manualData?.analysisResult?.qualificationQuestions);
  // Sample qualification questions for lead generation
  const defaultQualificationQuestions = [
    "What are the main challenges your organization faces in adopting AI-driven solutions, specifically in the Web3 space?",
    "Can you describe your current process for managing digital assets or trading activities, and what improvements you are seeking?",
    "How soon are you looking to implement a new AI-powered trading solution, and what is driving your timeline?",
    "What budget have you allocated for incorporating AI solutions into your current systems, and are there particular targets you need to meet?",
    "Who will be the key decision-makers involved in the adoption of AI solutions in your company, and what roles do they play?",
    "How does your team currently assess new technology solutions, and what factors are most important in making your final decision?"
  ];

  // Calendar options
  const calendarOptions = [
    { key: "google", name: "Google Calendar" },
    { key: "outlook", name: "Outlook Calendar" },
    { key: "apple", name: "Apple Calendar" }
  ];

  // Initialize with qualification questions from analysis result if available
  const initialQualificationQuestions =
    wizardData?.manualData?.analysisResult?.qualificationQuestions ||
    defaultQualificationQuestions;

  // console.log("Initial qualification questions:", initialQualificationQuestions);

  const [goalData, setGoalData] = useState(wizardData.goalData || {
    selectedGoal: "",
    qualificationQuestions: initialQualificationQuestions,
    newQuestion: "",
    calendarType: "",
    calendarUrl: "",
  });

  const handleGoalSelect = (goal) => {
    let updatedData = { ...goalData, selectedGoal: goal };

    // If the goal is lead-generation or appointment-setter and we have analysis results with qualification questions,
    // update the qualification questions
    if ((goal === "lead-generation" || goal === "appointment-setter") &&
      wizardData?.manualData?.analysisResult?.qualificationQuestions) {
      // console.log("Populating qualification questions from analysis result");
      updatedData = {
        ...updatedData,
        qualificationQuestions: wizardData.manualData.analysisResult.qualificationQuestions
      };
      // console.log("Updated qualification questions:", updatedData.qualificationQuestions);
    } else {
      // console.log("Not populating qualification questions. Goal:", goal);
      // console.log("Analysis result available:", !!wizardData?.manualData?.analysisResult);
      // console.log("Qualification  questions available:", !!wizardData?.manualData?.analysisResult?.qualificationQuestions);
    }

    setGoalData(updatedData);
    updateWizardData({ goalData: updatedData });
  };

  const handleRegenerate = (regeneratedQuestions) => {
    //console.log("Received regenerated questions:", regeneratedQuestions);

    if (Array.isArray(regeneratedQuestions) && regeneratedQuestions.length > 0) {
      // Update the qualification questions with the regenerated ones
      // Replace the entire array, not append
      const updatedData = {
        ...goalData,
        qualificationQuestions: regeneratedQuestions
      };

      //console.log("Updating qualification questions with:", updatedData.qualificationQuestions);

      setGoalData(updatedData);
      updateWizardData({ goalData: updatedData });
    } else {
      console.error("Invalid regenerated questions format:", regeneratedQuestions);
    }
  };

  const goalOptions = [
    {
      key: "customer-support",
      name: "Customer Support",
      description: "Handle customer inquiries 24/7",
      icon: MessageSquare,
      iconColor: "text-lime-500",
      bgColor: "bg-lime-50",
    },
    {
      key: "lead-generation",
      name: "Lead Generation",
      description: "Qualify and convert leads automatically",
      icon: Users,
      iconColor: "text-lime-500",
      bgColor: "bg-lime-50",
    },
    {
      key: "appointment-setter",
      name: "Book Appointments",
      description: "Let AI handle your scheduling",
      icon: Calendar,
      iconColor: "text-lime-500",
      bgColor: "bg-lime-50",
    },
  ];

  return (
    <div className="space-y-6 px-1 py-6">

      <div className="flex flex-col justify-center items-center gap-1">
        <h3 className="font-bold text-lg">What's your main goal?</h3>
        <span className="text-xs">First, tell us how you want your AI to help your business grow</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goalOptions.map((option) => (
          <Button
            key={option.key}
            className={`p-6 h-auto rounded-xl border-2 transition-all hover:shadow-md ${goalData.selectedGoal === option.key
              ? "border-brand bg-brand/10"
              : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            onPress={() => handleGoalSelect(option.key)}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-4`}>
                <option.icon className={`w-8 h-8 text-brand`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">{option.name}</h3>
              <p className="text-xs text-gray-600">{option.description}</p>
            </div>
          </Button>
        ))}
      </div>

      {goalData.selectedGoal === "lead-generation" && (
        <div className="mt-8 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-base font-medium text-gray-900">Qualification Questions</h4>
                <p className="text-sm text-gray-600">Help your AI identify the best opportunities</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  Improves lead quality by 75%
                </div>
                <RegenerateModal
                  onRegenerate={handleRegenerate}
                  websiteUrl={wizardData?.manualData?.websiteUrl || ""}
                  qualificationQuestions={goalData.qualificationQuestions}
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {goalData.qualificationQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-700">{question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => {
                        const newQuestions = [...goalData.qualificationQuestions];
                        newQuestions.splice(index, 1);
                        const updatedData = { ...goalData, qualificationQuestions: newQuestions };
                        setGoalData(updatedData);
                        updateWizardData({ goalData: updatedData });
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="What would you like to know about potential customers?"
                value={goalData.newQuestion}
                onChange={(e) => {
                  const updatedData = { ...goalData, newQuestion: e.target.value };
                  setGoalData(updatedData);
                  updateWizardData({ goalData: updatedData });
                }}
                className="flex-grow"
              />
              <Button
                className="bg-brand text-white"
                isDisabled={!goalData.newQuestion.trim()}
                onPress={() => {
                  if (!goalData.newQuestion.trim()) return;

                  const newQuestions = [...goalData.qualificationQuestions, goalData.newQuestion];
                  const updatedData = {
                    ...goalData,
                    qualificationQuestions: newQuestions,
                    newQuestion: ""
                  };
                  setGoalData(updatedData);
                  updateWizardData({ goalData: updatedData });
                }}
                startContent={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {goalData.selectedGoal === "appointment-setter" && (
        <div className="mt-8 space-y-4">
          {/* Calendar Integration Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-base font-medium text-gray-900">Calendar Integration</h4>
                <p className="text-sm text-gray-600">Connect your calendar for automated booking</p>
              </div>
              <div className="text-sm text-gray-600">
                Automates scheduling completely
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select
                placeholder="Select Calendar Type"
                selectedKeys={goalData.calendarType ? [goalData.calendarType] : []}
                onChange={(e) => {
                  const updatedData = { ...goalData, calendarType: e.target.value };
                  setGoalData(updatedData);
                  updateWizardData({ goalData: updatedData });
                }}
              >
                {calendarOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.name}
                  </SelectItem>
                ))}
              </Select>

              <Input
                placeholder="Calendar URL"
                value={goalData.calendarUrl}
                onChange={(e) => {
                  const updatedData = { ...goalData, calendarUrl: e.target.value };
                  setGoalData(updatedData);
                  updateWizardData({ goalData: updatedData });
                }}
              />
            </div>
          </div>

          {/* Qualification Questions Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-base font-medium text-gray-900">Qualification Questions</h4>
                <p className="text-sm text-gray-600">Help your AI identify the best opportunities</p>
              </div>
              <div className="flex items-center gap-2">
                <RegenerateModal
                  onRegenerate={handleRegenerate}
                  websiteUrl={wizardData?.manualData?.websiteUrl || ""}
                  qualificationQuestions={goalData.qualificationQuestions}
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {goalData.qualificationQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex-grow">
                    <p className="text-sm text-gray-700">{question}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onPress={() => {
                        const newQuestions = [...goalData.qualificationQuestions];
                        newQuestions.splice(index, 1);
                        const updatedData = { ...goalData, qualificationQuestions: newQuestions };
                        setGoalData(updatedData);
                        updateWizardData({ goalData: updatedData });
                      }}
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="What would you like to know about potential customers?"
                value={goalData.newQuestion}
                onChange={(e) => {
                  const updatedData = { ...goalData, newQuestion: e.target.value };
                  setGoalData(updatedData);
                  updateWizardData({ goalData: updatedData });
                }}
                className="flex-grow"
              />
              <Button
                className="bg-brand text-white"
                isDisabled={!goalData.newQuestion.trim()}
                onPress={() => {
                  if (!goalData.newQuestion.trim()) return;

                  const newQuestions = [...goalData.qualificationQuestions, goalData.newQuestion];
                  const updatedData = {
                    ...goalData,
                    qualificationQuestions: newQuestions,
                    newQuestion: ""
                  };
                  setGoalData(updatedData);
                  updateWizardData({ goalData: updatedData });
                }}
                startContent={<Plus className="w-4 h-4" />}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {goalData.selectedGoal === "customer-support" && (
        <div className="mt-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-base font-medium text-gray-900">Customer Support Configuration</h4>
                <p className="text-sm text-gray-600">Your AI will be optimized for customer support</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
