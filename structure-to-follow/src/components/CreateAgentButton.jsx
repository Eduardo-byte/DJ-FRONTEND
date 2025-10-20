import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserDataContext";
import { chatService } from "../api/services/chat.service";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Plus } from "lucide-react";
import Step1 from "./CreateAgent/Step1";
import CloneStep from "./CreateAgent/CloneStep";
import ManualStep from "./CreateAgent/ManualStep";
import GoalSelectionStep from "./CreateAgent/GoalSelectionStep";
import AgentDetailsStep from "./CreateAgent/AgentDetailsStep";
import AutoGenStep from "./CreateAgent/AutoGenStep";

export default function CreateAgentButton({ size = "md", className = "" }) {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    creationType: "", // "clone", "manual", "auto"
    agentDetails: {
      name: "",
      description: "",
      type: "",
    },
  });

  // Dynamic total steps based on creation type
  const getTotalSteps = () => {
    if (wizardData.creationType === "clone") {
      return 2; // Select type -> Clone settings (final step)
    } else if (wizardData.creationType === "manual") {
      return 4; // Select type -> Website analysis -> Goal selection -> Agent details
    }
    return 2; // Default flow: Select type -> Configure details
  };

  const totalSteps = getTotalSteps();

  const handleNext = () => {
    const maxSteps = getTotalSteps();
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const { userData } = useContext(UserDataContext);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState("");

  const handleFinish = async () => {
    // Process the completed wizard data
    //console.log("Wizard completed with data:", wizardData);

    setIsCreating(true);
    setCreationError("");

    try {
      // Handle different creation types
      if (wizardData.creationType === "clone") {
        // Clone flow
        if (!wizardData.cloneData || !wizardData.cloneData.sourceAgentId) {
          setCreationError("No source agent selected for cloning.");
          setIsCreating(false);
          return;
        }

        // Get the original data from the selected agent
        const originalData = wizardData.cloneData.originalData;

        if (!originalData) {
          setCreationError("Original agent data not found.");
          setIsCreating(false);
          return;
        }

        // Extract AI config and chat config
        const aiConfig = originalData.ai_config || {};
        const chatConfig = originalData.chat_config || {};

        // Prepare form data for chat widget generation
        const formData = {
          agentGoal: wizardData.cloneData.goalType === "lead-generation"
            ? "Lead Generation"
            : wizardData.cloneData.goalType === "appointment-setter"
              ? "Appointment Setter"
              : "Customer Support",
          botName: wizardData.cloneData.name,
          company_services: originalData.ai_config?.company_details?.company_services || "",
          intro_message: chatConfig?.global_?.businessDetails?.chatConfig?.introMessage || "",
          website_url: originalData.ai_config?.company_details?.website || "",
          qualification_questions: aiConfig?.chat_info?.qualification_questions?.map(q => q.name) || []
        };

        //console.log("Generating cloned chat widget with form data:", formData);

        // Call the generateChatWidget method
        const result = await chatService.generateChatWidget(
          formData,
          userData.client_id,
          userData.company_name || "Your Company"
        );

        //console.log("Cloned chat widget generation result:", result);

        if (result) {
          // Close the modal
          onClose();

          // Navigate to the playground
          navigate("/playground");

          // Reset wizard state
          setCurrentStep(1);
          setWizardData({
            creationType: "",
            agentDetails: {
              name: "",
              description: "",
              type: "",
            },
          });
        } else {
          setCreationError("Failed to clone agent. Please try again.");
        }
      } else if (wizardData.creationType === "manual") {
        // Manual flow
        // Prepare form data for chat widget generation
        const formData = {
          agentGoal: wizardData.goalData.selectedGoal === "lead-generation"
            ? "Lead Generation"
            : wizardData.goalData.selectedGoal === "appointment-setter"
              ? "Appointment Setter"
              : "Customer Support",
          botName: wizardData.detailsData.agentName,
          company_services: wizardData.detailsData.additionalInfo,
          intro_message: wizardData.manualData?.analysisResult?.agentInfo?.intro_message || "",
          website_url: wizardData.manualData?.websiteUrl || "",
          qualification_questions: wizardData.goalData.qualificationQuestions || []
        };

        //console.log("Generating chat widget with form data:", formData);

        // Call the generateChatWidget method
        const result = await chatService.generateChatWidget(
          formData,
          userData.client_id,
          userData.company_name || "Your Company"
        );

        //console.log("Chat widget generation result:", result);

        if (result) {
          // Close the modal
          onClose();

          // Navigate to the playground
          navigate("/playground");

          // Reset wizard state
          setCurrentStep(1);
          setWizardData({
            creationType: "",
            agentDetails: {
              name: "",
              description: "",
              type: "",
            },
          });
        } else {
          setCreationError("Failed to create agent. Please try again.");
        }
      } else {
        // Auto flow or other flows
        setCreationError("Unsupported creation type.");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      setCreationError("An error occurred while creating the agent. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const updateWizardData = (newData) => {
    setWizardData({ ...wizardData, ...newData });
  };

  const renderStep = () => {
    // First step is always the creation type selection
    if (currentStep === 1) {
      return (
        <Step1
          wizardData={wizardData}
          updateWizardData={updateWizardData}
        />
      );
    }

    // For clone flow
    if (wizardData.creationType === "clone") {
      if (currentStep === 2) {
        return (
          <CloneStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
      }
    }
    // For manual flow
    else if (wizardData.creationType === "manual") {
      if (currentStep === 2) {
        return (
          <ManualStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onAnalysisComplete={handleNext}
          />
        );
      } else if (currentStep === 3) {
        return (
          <GoalSelectionStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
      } else if (currentStep === 4) {
        return (
          <AgentDetailsStep
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
      }
    }
    // For auto flow
    else if (wizardData.creationType === "auto") {
      return (
        <AutoGenStep
          wizardData={wizardData}
          updateWizardData={updateWizardData}
          onBack={() => setCurrentStep(1)}
        />
      );
    }

    return <div>Unknown step</div>;
  };

  // Check if the button should be disabled
  const isButtonDisabled = () => {
    if (currentStep === 1 && !wizardData.creationType) {
      return true;
    }

    if (currentStep === 2 && wizardData.creationType === "clone") {
      if (!wizardData.cloneData) return true;

      const { sourceAgentId, name, goalType } = wizardData.cloneData;
      //console.log("Checking fields:", { sourceAgentId, name, goalType });

      return !sourceAgentId || !name || !goalType;
    }

    if (currentStep === 2 && wizardData.creationType === "manual") {
      if (!wizardData.manualData) return true;

      // The button should be disabled by default
      // Only enable it when:
      // 1. Analysis is complete AND
      // 2. Analysis was successful
      return !(wizardData.manualData.analysisComplete &&
        wizardData.manualData.analysisResult &&
        wizardData.manualData.analysisResult.success === true);
    }

    if (currentStep === 3 && wizardData.creationType === "manual") {
      if (!wizardData.goalData) return true;

      // Disable the button if no goal is selected
      return !wizardData.goalData.selectedGoal;
    }

    if (currentStep === 4 && wizardData.creationType === "manual") {
      if (!wizardData.detailsData) return true;

      // Disable the button if agent name is not provided
      return !wizardData.detailsData.agentName;
    }

    return false;
  };

  // Get the button text based on the current step and creation type
  const getButtonText = () => {
    if (currentStep === 1) {
      return "Next";
    }

    if (wizardData.creationType === "clone") {
      return "Clone Agent";
    }

    if (wizardData.creationType === "manual") {
      if (currentStep === 2) {
        return "Next";
      }
      if (currentStep === 3) {
        return "Next";
      }
      return "Create Agent";
    }

    return "Create Agent";
  };

  return (
    <>
      <Button
        className={`bg-brand text-gray-900 ${className}`}
        startContent={<Plus className="w-4 h-4" />}
        onPress={onOpen}
        size={size}
      >
        Create Agent
      </Button>

      {/* Create Agent Modal */}
      <Modal scrollBehavior="inside" isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              {/* Only show header with progress bar for non-auto flows or first step */}
              {(wizardData.creationType !== "auto" || currentStep === 1) && (
                <ModalHeader className="flex flex-col gap-1 border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Create New Agent
                  </h3>

                  {/* Simple Progress Bar - Hide for auto flow after step 1 */}
                  {(wizardData.creationType !== "auto" || currentStep === 1) && (
                    <div className="w-full mt-3 flex items-center">
                      <div className="flex-1 flex">
                        {Array.from({ length: totalSteps }, (_, i) => (
                          <div key={i} className="flex-1 flex items-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${i + 1 <= currentStep
                                  ? "bg-brand text-white"
                                  : "bg-gray-200 text-gray-500"
                                }`}
                            >
                              {i + 1}
                            </div>
                            {i < totalSteps - 1 && (
                              <div
                                className={`h-1 flex-1 mx-1 ${i + 1 < currentStep ? "bg-brand" : "bg-gray-200"
                                  }`}
                              ></div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="ml-3 text-sm text-gray-500">
                        {currentStep === 1
                          ? "Select creation method"
                          : wizardData.creationType === "clone" && currentStep === 2
                            ? "Select agent to clone"
                            : wizardData.creationType === "manual" && currentStep === 2
                              ? "Website analysis"
                              : wizardData.creationType === "manual" && currentStep === 3
                                ? "Select goal"
                                : "Configure agent details"}
                      </div>
                    </div>
                  )}
                </ModalHeader>
              )}

              <ModalBody>
                {renderStep()}
              </ModalBody>

              {/* Only show footer with buttons for non-auto flows or first step */}
              {(wizardData.creationType !== "auto" || currentStep === 1) && (
                <ModalFooter className={`w-full flex ${currentStep > 1 ? "justify-between " : " justify-end"} items-center`}>
                  {currentStep > 1 && wizardData.creationType !== "auto" && (
                    <Button variant="light" onPress={handlePrevious}>
                      Previous
                    </Button>
                  )}
                  <div className="flex flex-col items-end">
                    {creationError && (
                      <p className="text-red-500 text-xs mb-1">{creationError}</p>
                    )}
                    <Button
                      className="bg-gradient-to-tr from-brand to-brand-secondary text-gray-900"
                      onPress={handleNext}
                      isDisabled={isButtonDisabled() || isCreating}
                      isLoading={isCreating && currentStep === totalSteps}
                    >
                      {getButtonText()}
                    </Button>
                  </div>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
