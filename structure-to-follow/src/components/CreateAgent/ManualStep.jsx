import { useState } from "react";
import {
  Input,
  Button,
  Progress,
} from "@heroui/react";
import { Globe, Scan, Search, Brain, Wand2, Zap } from "lucide-react";
import { webScraperService } from "../../api/services/webscraper.service";

export default function ManualStep({ wizardData, updateWizardData, onAnalysisComplete }) {
  const [manualData, setManualData] = useState(wizardData.manualData || {
    websiteUrl: "",
    isAnalyzing: false,
    analysisStep: 0,
    analysisComplete: false,
  });

  const [validationError, setValidationError] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleInputChange = (field, value) => {
    const updatedData = { ...manualData, [field]: value };
    setManualData(updatedData);
    updateWizardData({ manualData: updatedData });
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const startAnalysis = async () => {
    if (!manualData.websiteUrl) {
      setValidationError("Please enter a website URL");
      return;
    }

    if (!isValidUrl(manualData.websiteUrl)) {
      setValidationError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    // Clear any previous validation errors
    setValidationError("");

    // Set button states
    setIsButtonLoading(true);
    setIsButtonDisabled(true);

    // Update the analysis state
    const updatedData = {
      ...manualData,
      isAnalyzing: true,
      analysisStep: 1
    };
    setManualData(updatedData);
    updateWizardData({ manualData: updatedData });

    try {
      // Call the generateFullFlow API
      const data = {
        websiteContent: manualData.websiteUrl,
        options: {
          model: "gpt-4o",
          temperature: 0,
          batchQuestions: true,
          batchSize: 1500
        }
      };

      // Progress through steps as the API call is processing
      handleInputChange("analysisStep", 2);

      const result = await webScraperService.generateFullFlow(data);

      // Log the result
      //console.log("Full flow analysis result:", result);

      // Continue with the analysis steps
      handleInputChange("analysisStep", 3);
      setTimeout(() => {
        handleInputChange("analysisStep", 4);
        setTimeout(() => {
          handleInputChange("analysisStep", 5);

          // Store the result in the state
          const updatedDataWithResult = {
            ...manualData,
            analysisResult: result,
            analysisComplete: true
          };
          setManualData(updatedDataWithResult);
          updateWizardData({ manualData: updatedDataWithResult });

          // Log the updated state for debugging
          // console.log("Updated manualData with result:", updatedDataWithResult);
          // console.log("Analysis success:", result?.success);

          // Check if the API call was successful and re-enable the button
          if (result && result.success === true) {
            // Keep the button disabled but update the loading state
            setIsButtonLoading(false);
            
            // Automatically proceed to the next step after a short delay
            setTimeout(() => {
              if (onAnalysisComplete) {
                onAnalysisComplete();
              }
            }, 1500); // 1.5 second delay to show completion
          } else {
            // If not successful, re-enable the button completely
            setIsButtonLoading(false);
            setIsButtonDisabled(false);
            setValidationError("Analysis completed but with issues. You may try again.");
          }
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error("Error analyzing website:", error);
      setValidationError("Failed to analyze website. Please try again.");
      handleInputChange("isAnalyzing", false);
      setIsButtonLoading(false);
      setIsButtonDisabled(false);
    }
  };

  const analysisSteps = [
    { id: 1, label: "Scanning website content", icon: Scan, color: "text-brand" },
    { id: 2, label: "Identifying key information", icon: Search, color: "text-gray-400" },
    { id: 3, label: "Training AI with your content", icon: Brain, color: "text-gray-400" },
    { id: 4, label: "Crafting your AI assistant", icon: Wand2, color: "text-gray-400" },
    { id: 5, label: "Optimizing AI responses", icon: Zap, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-6 px-1">

      <div className="py-8">
        <div className="flex flex-col justify-center items-center w-full">
          <label className="flex flex-col justify-center items-center text-sm font-medium text-gray-700 mb-1">
            <h3 className="font-bold text-lg">Website URL</h3>
            <span className="text-xs"> Enter your website URL and we'll help you create an AI assistant tailored to your content</span>
          </label>
          <div className="relative w-full mt-2">
            <Input
              placeholder="https://example.com"
              variant="bordered"
              value={manualData.websiteUrl}
              onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
              className="w-full "
              startContent={<Globe className="w-5 h-5 text-gray-400" />}
              isInvalid={!!validationError}
              errorMessage={validationError}
            />
          </div>
        </div>

        <Button
          className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 h-12"
          onPress={startAnalysis}
          isDisabled={isButtonDisabled}
          isLoading={isButtonLoading}
          startContent={!isButtonLoading && <Scan className="w-4 h-4" />}
        >
          {isButtonLoading ? "Analysing Website..." : "Let me analyze your website"}
        </Button>

        {manualData.isAnalyzing && (
          <div className="mt-8 space-y-6">
            <div className="w-full bg-brand/10 rounded-full h-2.5 mb-8">
              <div
                className="bg-brand h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(manualData.analysisStep / 5) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-6">
              {analysisSteps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${manualData.analysisStep >= step.id
                      ? "bg-brand/10"
                      : "bg-gray-100"
                    }`}>
                    <step.icon className={`w-5 h-5 ${manualData.analysisStep >= step.id
                        ? "text-brand"
                        : "text-gray-300"
                      }`} />
                  </div>
                  <span className={`text-sm ${manualData.analysisStep >= step.id
                      ? "text-gray-700 font-medium"
                      : "text-gray-400"
                    }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
