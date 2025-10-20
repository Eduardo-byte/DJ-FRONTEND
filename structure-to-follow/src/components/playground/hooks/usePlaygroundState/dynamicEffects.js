import { useEffect } from "react";
import { setValueAtPath } from "../../../../utils/chatUtils";

export const useDynamicEffects = (selectedAgent, setSelectedAgent, botName, introMessage, showLeadForm, selectedModel, selectedGoal, brandColor, responseDelay, webhook, countryCode, companyServices, guidelinesArray, qualificationQuestions, chatType, selectedModelV2, calendarLink, customToolsInstructions, avatarMessage) => {

  // Update BotName dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;
    let updatedAgent = selectedAgent;
    let updatedChatConfig = selectedAgent.chatConfig;
    let updatedAgentConfig = selectedAgent.agentConfig;

    updatedOriginalData = setValueAtPath(updatedOriginalData, "ai_config.bot_config.bot_name", botName);
    updatedAgent = setValueAtPath(updatedAgent, "name", botName);
    updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_config.global_.businessDetails.chatConfig.botName", botName);
    updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_config.chatWindow.header.title", botName);

    if (selectedAgent.chatConfig) {
      updatedChatConfig = setValueAtPath(updatedChatConfig, "chatWindow.header.title", botName);
      updatedChatConfig = setValueAtPath(updatedChatConfig, "global_.businessDetails.chatConfig.botName", botName);
    }
    if (selectedAgent.agentConfig) {
      updatedAgentConfig = setValueAtPath(updatedAgentConfig, "bot_config.bot_name", botName);
    }
    setSelectedAgent({
      ...selectedAgent, originalData: updatedOriginalData, chatConfig: updatedChatConfig, agentConfig: updatedAgentConfig
    });
  }, [botName]);

  // Update intro message dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;
    let updatedChatConfig = selectedAgent.chatConfig;

    updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_config.global_.businessDetails.chatConfig.introMessage", introMessage);
    if (selectedAgent.chatConfig) {
      updatedChatConfig = setValueAtPath(updatedChatConfig, "global_.businessDetails.chatConfig.introMessage", introMessage);
    }

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, chatConfig: updatedChatConfig });
  }, [introMessage]);
  
  // Update avatar message dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;
    let updatedChatConfig = selectedAgent.chatConfig;

    updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_config.avatar.message", avatarMessage);
    if (selectedAgent.chatConfig) {
      updatedChatConfig = setValueAtPath(updatedChatConfig, "avatar.message", avatarMessage);
    }

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, chatConfig: updatedChatConfig });
  }, [avatarMessage]);

  // Update showLeadForm dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;
    // console.log("im  here showLeadForm", updatedOriginalData);
    updatedOriginalData = setValueAtPath(updatedOriginalData, "is_form_deactivated", !showLeadForm);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
  }, [showLeadForm]);

  // Update selectedModel dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedOriginalData = selectedAgent.originalData;
    updatedOriginalData = setValueAtPath(updatedOriginalData, "model_name", selectedModel);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
  }, [selectedModel]);

  //Update selectedModelv2 dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedOriginalData = selectedAgent.originalData;
    updatedOriginalData = setValueAtPath(updatedOriginalData, "model_names_v2", selectedModelV2);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
  }, [selectedModelV2]);

  // Update selectedGoal dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedOriginalData = selectedAgent.originalData;
    let updatedAgentConfig = selectedAgent.agentConfig;
    let goalToSave
    if (selectedGoal == "customer-support") {
      goalToSave = "Customer Support"
    } else if (selectedGoal == "lead-generation") {
      goalToSave = "Lead Generation"
    } else if (selectedGoal == "appointment-setter") {
      goalToSave = "Appointment Setter"
    }

    if (selectedAgent.agentConfig) {
      updatedAgentConfig = setValueAtPath(updatedAgentConfig, "bot_config.bot_role", goalToSave);
    }
    updatedOriginalData = setValueAtPath(updatedOriginalData, "ai_config.bot_config.bot_role", goalToSave);
    updatedOriginalData = setValueAtPath(updatedOriginalData, "extra_info.bot_goal.name", goalToSave);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, agentConfig: updatedAgentConfig });
  }, [selectedGoal]);

  // Update brandColor dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedOriginalData = selectedAgent.originalData;
    let updatedChatConfig = selectedAgent.chatConfig;

    if (selectedAgent.chatConfig) {
      updatedChatConfig = setValueAtPath(updatedChatConfig, "global_.businessDetails.brandDesign.primaryColor", brandColor);
    }
    updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_config.global_.businessDetails.brandDesign.primaryColor", brandColor);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, chatConfig: updatedChatConfig });
  }, [brandColor]);

  // Update selectedModel dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedOriginalData = selectedAgent.originalData;
    updatedOriginalData = setValueAtPath(updatedOriginalData, "response_delay", responseDelay);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
  }, [responseDelay]);

  // Update webhook dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedwebhooksData = selectedAgent.webhooksData;
    if (updatedwebhooksData) {
      // console.log("updatedwebhooksData", updatedwebhooksData);
      updatedwebhooksData = setValueAtPath(updatedwebhooksData, "endpoint_url", webhook);
    }

    setSelectedAgent({ ...selectedAgent, webhooksData: updatedwebhooksData });
  }, [webhook]);

  // Update selectedModel dynamically
  useEffect(() => {
    if (!selectedAgent) return;

    let updatedOriginalData = selectedAgent.originalData;
    updatedOriginalData = setValueAtPath(updatedOriginalData, "country_code", countryCode);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
  }, [countryCode]);

  // Update companyServices dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;
    let updatedAgentConfig = selectedAgent.agentConfig;

    updatedOriginalData = setValueAtPath(updatedOriginalData, "ai_config.company_details.company_services", companyServices);

    if (updatedAgentConfig) {
      updatedAgentConfig = setValueAtPath(updatedAgentConfig, "company_details.company_services", companyServices);
    }
    setSelectedAgent({
      ...selectedAgent, originalData: updatedOriginalData, agentConfig: updatedAgentConfig
    });
  }, [companyServices]);

  // Dynamic update for guidelines:
  useEffect(() => {
    if (!selectedAgent) return;
    // console.log("dynamics console log guidelinesArray", guidelinesArray);
    let updatedOriginalData = selectedAgent.originalData;
    let updatedAgentConfig = selectedAgent.agentConfig;

    // Update the guidelines field (adjust the field path as your schema requires)
    updatedOriginalData = setValueAtPath(updatedOriginalData, "ai_config.chat_info.guidelines.extra_info", guidelinesArray);

    if (updatedAgentConfig) {
      updatedAgentConfig = setValueAtPath(updatedAgentConfig, "chat_info.guidelines.extra_info", guidelinesArray);
    }
    // Update the agent state with the new guidelines data
    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, agentConfig: updatedAgentConfig });

  }, [guidelinesArray]);

  // Dynamic update for guidelines:
  useEffect(() => {
    if (!selectedAgent) return;

    // Get the current qualification questions from the agent state
    const currentQuestions = selectedAgent.originalData.ai_config.chat_info.qualification_questions;

    // Compare the current questions with the new qualificationQuestions array
    if (JSON.stringify(currentQuestions) === JSON.stringify(qualificationQuestions)) {
      // If they are the same, do nothing.
      return;
    }

    // console.log("qualificationQuestions", qualificationQuestions);

    let updatedOriginalData = selectedAgent.originalData;
    let updatedAgentConfig = selectedAgent.agentConfig;

    // Update the correct field in original data
    updatedOriginalData = setValueAtPath(
      updatedOriginalData,
      "ai_config.chat_info.qualification_questions",
      qualificationQuestions
    );

    updatedOriginalData = setValueAtPath(
      updatedOriginalData,
      "extra_info.qualification_questions",
      qualificationQuestions
    );

    //here  qualification questions have to save as json like [{name: "value"},{name: "value"}]
    // Optionally, update in agentConfig if that field exists
    if (selectedAgent.agentConfig?.chat_info?.qualification_questions !== undefined) {
      updatedAgentConfig = setValueAtPath(
        updatedAgentConfig,
        "chat_info.qualification_questions",
        qualificationQuestions
      );
    }

    // Update the selected agent with the new data
    setSelectedAgent({
      ...selectedAgent,
      originalData: updatedOriginalData,
      agentConfig: updatedAgentConfig
    });
  }, [qualificationQuestions]);

  // Update chatType
  useEffect(() => {
    if (!selectedAgent) return;
    // console.log("im  trigered");
    let updatedOriginalData = selectedAgent.originalData;
    updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_type", chatType);

    setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData });
  }, [chatType]);

  // Update BookingLink dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;

    updatedOriginalData = setValueAtPath(updatedOriginalData, "booking_link", calendarLink);

    setSelectedAgent({
      ...selectedAgent, originalData: updatedOriginalData
    });
  }, [calendarLink]);


  // Update BookingLink dynamically
  useEffect(() => {
    if (!selectedAgent) return;
    let updatedOriginalData = selectedAgent.originalData;

    updatedOriginalData = setValueAtPath(updatedOriginalData, "custom_tool_instructions", customToolsInstructions);

    setSelectedAgent({
      ...selectedAgent, originalData: updatedOriginalData
    });
  }, [customToolsInstructions]);

};
