import React, { useState, useEffect } from "react";
import { Accordion, AccordionItem, Textarea, Button, Tooltip } from "@heroui/react";
import { MessageSquare, Plus, X, HelpCircle, Pencil, HelpCircle as QuestionMark } from "lucide-react";
import { setValueAtPath } from "../../../utils/chatUtils";

const ContentConfiguration = ({
  companyServices,
  setCompanyServices,
  guidelines,
  setGuidelines,
  selectedGoal,
  selectedAgent,
  guidelinesArray,
  setGuidelinesArray,
  qualificationQuestions,
  setQualificationQuestions,
  handleApplyChanges,
  setSelectedAgent,
}) => {
  // const [guidelinesArray, setGuidelinesArray] = useState([]);
  const [newGuideline, setNewGuideline] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [editValue, setEditValue] = useState("");

  // State for qualification questions
  // const [qualificationQuestions, setQualificationQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editQuestionIndex, setEditQuestionIndex] = useState(-1);
  const [editQuestionValue, setEditQuestionValue] = useState("");

  // Convert string guidelines to array when component mounts or guidelines prop changes
  useEffect(() => {
    if (guidelines) {
      //console.log("guidelines", guidelines);
      const array = guidelines
      //console.log("guidelinesArray under contentAconfigurations", guidelinesArray);
      setGuidelinesArray(array);
    } else {
      setGuidelinesArray([]);
    }
  }, [guidelines]);

  // Load qualification questions from selected agent when component mounts or agent changes
  useEffect(() => {
    if (selectedAgent?.originalData?.ai_config?.chat_info?.qualification_questions) {
      const questions = selectedAgent.originalData.ai_config.chat_info.qualification_questions || [];
      // Convert each question to an object with a "name" property if it's not already in that format.
      const formattedQuestions = questions.map(q => {
        if (q && typeof q === 'object' && q.name) {
          return q; // Already in the correct format
        } else if (typeof q === 'string') {
          return { name: q };
        }
        return { name: String(q) };
      });
      setQualificationQuestions(formattedQuestions);
    } else {
      setQualificationQuestions([]);
    }
  }, [selectedAgent, setQualificationQuestions]);

  // Update parent component when guidelines array changes
  const updateGuidelines = (updatedArray) => {
    setGuidelinesArray(updatedArray);
    setGuidelines(updatedArray);

    let updatedOriginalData = selectedAgent.originalData;
    let updatedAgentConfig = selectedAgent.agentConfig;

    // Update the guidelines field (adjust the field path as your schema requires)
    updatedOriginalData = setValueAtPath(updatedOriginalData, "ai_config.chat_info.guidelines.extra_info", updatedArray);

    if (updatedAgentConfig) {
      updatedAgentConfig = setValueAtPath(updatedAgentConfig, "chat_info.guidelines.extra_info", updatedArray);
    }
    // Update the agent state with the new guidelines data
    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, agentConfig: updatedAgentConfig });

    handleApplyChanges(false)
  };

  // Add a new guideline
  const handleAddGuideline = () => {
    if (newGuideline.trim() !== "") {
      const updatedArray = [...guidelinesArray, newGuideline.trim()];
      updateGuidelines(updatedArray);
      setNewGuideline("");
    }
  };

  // Remove a guideline
  const handleRemoveGuideline = (index) => {
    const updatedArray = guidelinesArray.filter((_, i) => i !== index);
    updateGuidelines(updatedArray);
  };

  // Start editing a guideline
  const handleStartEdit = (index) => {
    setEditIndex(index);
    setEditValue(guidelinesArray[index]);
  };

  // Save edited guideline
  const handleSaveEdit = () => {
    if (editIndex >= 0 && editValue.trim() !== "") {
      const updatedArray = [...guidelinesArray];
      updatedArray[editIndex] = editValue.trim();
      updateGuidelines(updatedArray);
      setEditIndex(-1);
    }
    // console.log("selectedAgent", selectedAgent);

  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditIndex(-1);
  };

  // Add a new qualification question (store as object with key 'name')
  const handleAddQuestion = () => {
    if (newQuestion.trim() !== "") {
      const updatedArray = [...qualificationQuestions, { name: newQuestion.trim() }];
      setQualificationQuestions(updatedArray);
      setNewQuestion("");
    }
  };

  // Remove a qualification question
  const handleRemoveQuestion = (index) => {
    const updatedArray = qualificationQuestions.filter((_, i) => i !== index);
    setQualificationQuestions(updatedArray);
  };

  // Start editing a qualification question
  const handleStartEditQuestion = (index) => {
    setEditQuestionIndex(index);
    setEditQuestionValue(qualificationQuestions[index].name);
  };

  // Save edited qualification question
  const handleSaveEditQuestion = () => {
    if (editQuestionIndex >= 0 && editQuestionValue.trim() !== "") {
      const updatedArray = [...qualificationQuestions];
      updatedArray[editQuestionIndex] = { name: editQuestionValue.trim() };
      setQualificationQuestions(updatedArray);
      setEditQuestionIndex(-1);
      // Get the current qualification questions from the agent state
      const currentQuestions = selectedAgent.originalData.ai_config.chat_info.qualification_questions;

      // Compare the current questions with the new qualificationQuestions array
      if (JSON.stringify(currentQuestions) === JSON.stringify(updatedArray)) {
        return;
      }

      let updatedOriginalData = selectedAgent.originalData;
      let updatedAgentConfig = selectedAgent.agentConfig;

      // Update the correct field in original data
      updatedOriginalData = setValueAtPath(
        updatedOriginalData,
        "ai_config.chat_info.qualification_questions",
        updatedArray
      );

      updatedOriginalData = setValueAtPath(
        updatedOriginalData,
        "extra_info.qualification_questions",
        updatedArray
      );

      if (selectedAgent.agentConfig?.chat_info?.qualification_questions !== undefined) {
        updatedAgentConfig = setValueAtPath(
          updatedAgentConfig,
          "chat_info.qualification_questions",
          updatedArray
        );
      }
      // Update the selected agent with the new data
      setSelectedAgent({
        ...selectedAgent,
        originalData: updatedOriginalData,
        agentConfig: updatedAgentConfig
      });

      handleApplyChanges()
    }
  };


  // Cancel editing qualification question
  const handleCancelEditQuestion = () => {
    setEditQuestionIndex(-1);
  };
  return (
    <Accordion
      variant="bordered"
      className="bg-white border border-gray-100"
      defaultExpandedKeys={["1"]}
    >
      <AccordionItem
        key="1"
        aria-label="Content Configuration"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand/10">
              <MessageSquare className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-lg font-semibold text-gray-900">Content Configuration</span>
          </div>
        }
        subtitle="Define your company services and Agent guidelines for better responses"
      >
        <div className="px-4 py-2 space-y-4">
          {/* Company Services Section */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold text-gray-800">Your company services</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Explain here what it is your company does, and what you would like the Agent to do for your business with customers it speaks to via your chat widget</p>
            <Textarea
              value={companyServices}
              onChange={(e) => setCompanyServices(e.target.value)}
              placeholder="Describe your services..."
              minRows={3}
              maxRows={5}
              className="w-full border-gray-200 focus:border-brand"
            />
          </div>

          {/* Guidelines Section */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-semibold text-gray-800">Guidelines to make your Agent work better</h3>
              <Tooltip content={
                <div className="max-w-xs">
                  <p className="text-xs text-gray-700 mb-2">Here in the Playground, you can tweak how your Agent works. We recommend having a few test conversations with it. Asking it questions about your company and pretending to be a customer.</p>
                  <div className="bg-gray-100 p-2 rounded-md mb-1">
                    <p className="text-xs text-gray-800 font-medium">Here are some examples of useful instructions:</p>
                    <ul className="text-xs text-gray-700 list-disc pl-5 mt-1 space-y-1">
                      <li>Do not repeat questions.</li>
                      <li>Check which phone number they want us to call them.</li>
                      <li>Make sure you only book callbacks on a Wednesday or Thursday</li>
                    </ul>
                  </div>
                </div>
              }>
                <div className="cursor-help">
                  <HelpCircle size={16} className="text-gray-400" />
                </div>
              </Tooltip>
            </div>

            {/* Guidelines list */}
            <div className="space-y-3 mb-4">
              {guidelinesArray.map((guideline, index) => (
                <div
                  key={index}
                  className="relative bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-all"
                >
                  {editIndex === index ? (
                    <div className="w-full">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full border-gray-200 focus:border-brand mb-2"
                        minRows={2}
                        autoFocus
                      />
                      <div className="flex justify-end mt-2 gap-2">
                        <Button
                          onPress={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="text-xs px-4 py-2"
                        >
                          Cancel
                        </Button>
                        <Button
                          onPress={handleSaveEdit}
                          variant="primary"
                          size="sm"
                          className="text-xs px-4 py-2 bg-brand text-white"
                          disabled={editValue.trim() === ""}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="break-all whitespace-pre-wrap pr-4 text-sm font-medium text-gray-700">{guideline}</div>
                      <div className="flex items-center gap-1">
                        <Tooltip content="Edit">
                          <button
                            onClick={() => handleStartEdit(index)}
                            className="text-gray-400 hover:text-brand p-1.5 rounded-full hover:bg-gray-100"
                            aria-label="Edit guideline"
                          >
                            <Pencil size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip content="Remove">
                          <button
                            onClick={() => handleRemoveGuideline(index)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                            aria-label="Remove guideline"
                          >
                            <X size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add new guideline */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center">
              <Textarea

                value={newGuideline}
                onChange={(e) => setNewGuideline(e.target.value)}
                // onChange={handleNewGuidelineChange}
                placeholder="Type a new instruction..."
                minRows={1}
                onBlur={handleAddGuideline}
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm"
              />
              <Button
                onPress={handleAddGuideline}
                isIconOnly
                variant="ghost"
                className="ml-2 h-10 w-10 p-0 rounded-full bg-brand hover:bg-brand/90 text-white flex-shrink-0"
                disabled={newGuideline.trim() === ""}
                aria-label="Add guideline"
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {/* Qualification Questions Section - only shown for lead-generation or appointment-setter goals */}
          {(selectedGoal === "lead-generation" || selectedGoal === "appointment-setter") && (
            <div className="bg-white rounded-lg border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold text-gray-800">Qualification Questions</h3>
                <Tooltip content={
                  <div className="max-w-xs">
                    <p className="text-xs text-gray-700 mb-2">
                      Qualification questions are asked to users to gather important information before proceeding with lead generation or appointment setting.
                    </p>
                    <div className="bg-gray-100 p-2 rounded-md mb-1">
                      <p className="text-xs text-gray-800 font-medium">Here are some examples of useful questions:</p>
                      <ul className="text-xs text-gray-700 list-disc pl-5 mt-1 space-y-1">
                        <li>What is your budget range for this project?</li>
                        <li>When are you looking to start?</li>
                        <li>Have you worked with similar services before?</li>
                      </ul>
                    </div>
                  </div>
                }>
                  <div className="cursor-help">
                    <QuestionMark size={16} className="text-gray-400" />
                  </div>
                </Tooltip>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Add questions that your Agent will ask to qualify leads before proceeding with the conversation
              </p>

              {/* Questions list */}
              <div className="space-y-3 mb-4">
                {qualificationQuestions.map((question, index) => (
                  <div
                    key={index}
                    className="relative bg-gray-50 rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    {editQuestionIndex === index ? (
                      <div className="w-full">
                        <Textarea
                          value={editQuestionValue}
                          onChange={(e) => setEditQuestionValue(e.target.value)}
                          className="w-full border-gray-200 focus:border-brand mb-2"
                          minRows={2}
                          autoFocus
                        />
                        <div className="flex justify-end mt-2 gap-2">
                          <Button onPress={handleCancelEditQuestion} variant="outline" size="sm" className="text-xs px-4 py-2">
                            Cancel
                          </Button>
                          <Button
                            onPress={handleSaveEditQuestion}
                            variant="primary"
                            size="sm"
                            className="text-xs px-4 py-2 bg-brand text-white"
                            disabled={editQuestionValue.trim() === ""}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {/* Render the question's text from the "name" property */}
                        <div className="pr-4 text-sm font-medium text-gray-700">{question.name}</div>
                        <div className="flex items-center gap-1">
                          <Tooltip content="Edit">
                            <button
                              onClick={() => handleStartEditQuestion(index)}
                              className="text-gray-400 hover:text-brand p-1.5 rounded-full hover:bg-gray-100"
                              aria-label="Edit question"
                            >
                              <Pencil size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Remove">
                            <button
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100"
                              aria-label="Remove question"
                            >
                              <X size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add new qualification question */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center">
                <Textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type a new qualification question..."
                  minRows={1}
                  onBlur={handleAddQuestion}
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm"
                />
                <Button
                  onPress={handleAddQuestion}
                  isIconOnly
                  variant="ghost"
                  className="ml-2 h-10 w-10 p-0 rounded-full bg-brand hover:bg-brand/90 text-white flex-shrink-0"
                  disabled={newQuestion.trim() === ""}
                  aria-label="Add question"
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </AccordionItem>
    </Accordion>
  );
};

export default ContentConfiguration;
