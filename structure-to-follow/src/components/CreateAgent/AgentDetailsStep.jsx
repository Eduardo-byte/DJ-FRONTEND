import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import { Plus, X, FileText, Sparkles } from "lucide-react";
import RegenerateQAModal from "./RegenerateQAModal";

export default function AgentDetailsStep({ wizardData, updateWizardData }) {
  // Debug: Log the wizardData to see if analysisResult is being passed correctly
  //console.log("AgentDetailsStep wizardData:", wizardData);
  //console.log("Analysis result:", wizardData?.manualData?.analysisResult);

  // Extract agent info and QA pairs from analysis result if available
  const analysisResult = wizardData?.manualData?.analysisResult;
  const agentInfo = analysisResult?.agentInfo;
  const qaPairs = analysisResult?.qaPairs;

  //console.log("Agent info:", agentInfo);
  //console.log("QA pairs:", qaPairs);

  // Initialize with data from analysis result or defaults
  const initialAgentName = agentInfo?.bot_name || "";
  const initialQAItems = qaPairs?.length
    ? qaPairs.map(pair => ({ question: pair.question, answer: pair.answer }))
    : [{ question: "", answer: "" }];
  const initialAdditionalInfo = agentInfo?.company_services || "";

  // console.log("Initial agent name:", initialAgentName);
  // console.log("Initial QA items:", initialQAItems);
  // console.log("Initial additional info:", initialAdditionalInfo);

  // Initialize with existing data or defaults
  const [detailsData, setDetailsData] = useState(wizardData.detailsData || {
    agentName: initialAgentName,
    qaItems: initialQAItems,
    additionalInfo: initialAdditionalInfo,
  });

  // Update wizard data immediately if we have initial data from analysis result
  useEffect(() => {
    if (!wizardData.detailsData && (initialAgentName || initialAdditionalInfo || initialQAItems.length > 1 || initialQAItems[0]?.question || initialQAItems[0]?.answer)) {
      const initialData = {
        agentName: initialAgentName,
        qaItems: initialQAItems,
        additionalInfo: initialAdditionalInfo,
      };
      setDetailsData(initialData);
      updateWizardData({ detailsData: initialData });
    }
  }, [initialAgentName, initialAdditionalInfo, initialQAItems, wizardData.detailsData, updateWizardData]);

  const handleInputChange = (field, value) => {
    const updatedData = { ...detailsData, [field]: value };
    setDetailsData(updatedData);
    updateWizardData({ detailsData: updatedData });
  };

  const handleQAChange = (index, field, value) => {
    const updatedQA = [...detailsData.qaItems];
    updatedQA[index] = { ...updatedQA[index], [field]: value };

    const updatedData = { ...detailsData, qaItems: updatedQA };
    setDetailsData(updatedData);
    updateWizardData({ detailsData: updatedData });
  };

  const addQAItem = () => {
    const updatedQA = [...detailsData.qaItems, { question: "", answer: "" }];
    const updatedData = { ...detailsData, qaItems: updatedQA };
    setDetailsData(updatedData);
    updateWizardData({ detailsData: updatedData });
  };

  const removeQAItem = (index) => {
    const updatedQA = detailsData.qaItems.filter((_, i) => i !== index);
    const updatedData = { ...detailsData, qaItems: updatedQA };
    setDetailsData(updatedData);
    updateWizardData({ detailsData: updatedData });
  };

  const handleRegenerate = (regeneratedQA) => {
    //console.log("Received regenerated Q&A pairs:", regeneratedQA);

    if (Array.isArray(regeneratedQA) && regeneratedQA.length > 0) {
      // Update the QA items with the regenerated ones
      // Replace the entire array, not append
      const updatedData = {
        ...detailsData,
        qaItems: regeneratedQA
      };

      //console.log("Updating QA items with:", updatedData.qaItems);

      setDetailsData(updatedData);
      updateWizardData({ detailsData: updatedData });
    } else {
      console.error("Invalid regenerated Q&A format:", regeneratedQA);
    }
  };

  return (
    <div className="space-y-6 px-1 py-6">
      <div className="flex flex-col justify-center items-center gap-1 mb-6">
        <h3 className="font-bold text-lg">Configure Your Agent</h3>
        <span className="text-xs">Provide details to personalize your AI assistant</span>
      </div>

      {/* Agent Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Agent Name <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="Enter a name for your agent"
          value={detailsData.agentName}
          onChange={(e) => handleInputChange("agentName", e.target.value)}
          className="w-full"
        />
      </div>

      {/* Additional Information */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium text-gray-900">Additional Information</h4>
            <p className="text-xs text-gray-600">Provide any other details that will help your AI assistant</p>
          </div>
          <div className="text-xs text-gray-600">
            Makes responses more accurate
          </div>
        </div>

        <div className="rounded-lg bg-white">
          <div className="flex items-start mb-2">
            <Textarea
              placeholder="Add any additional context, information, or instructions for your AI assistant..."
              value={detailsData.additionalInfo}
              startContent={
                <FileText className="w-5 h-5 text-brand mr-2 mt-1" />
              }
              onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
              className="w-full"
              rows={6}
            />
          </div>
        </div>
      </div>

      {/* Q&A Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-base font-medium text-gray-900">Common Questions & Answers</h4>
            <p className="text-xs text-gray-600">Add the most common questions your customers ask to train your AI</p>
          </div>
          <div className="flex items-center gap-2">

          </div>
        </div>
        <div className="w-full flex justify-end items-center gap-2">

          <Button
            size="sm"
            className="bg-brand text-white"
            startContent={<Plus className="w-4 h-4" />}
            onPress={addQAItem}
          >
            Add Q&A
          </Button>
          <RegenerateQAModal
            onRegenerate={handleRegenerate}
            websiteUrl={wizardData?.manualData?.websiteUrl || ""}
            qaItems={detailsData.qaItems}
          />
        </div>

        <div className="space-y-4">
          {detailsData.qaItems.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium text-gray-700">Question #{index + 1}</h5>
                {detailsData.qaItems.length > 1 && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => removeQAItem(index)}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="What question do you want to answer?"
                  value={item.question}
                  onChange={(e) => handleQAChange(index, "question", e.target.value)}
                  className="w-full"
                />

                <Textarea
                  placeholder="Provide a detailed answer to the question"
                  value={item.answer}
                  onChange={(e) => handleQAChange(index, "answer", e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
