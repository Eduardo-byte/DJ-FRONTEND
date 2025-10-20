import { findMatchingGoalKey, findMatchingModelKey } from "../../../../utils/formatUtils";
import { aiGoals, aiModels, aiModelsV2 } from "../../utils/configData";

export const useAgentHandlers = (
  setSelectedAgent,
  setBotName,
  setIntroMessage,
  setSelectedModel,
  setSelectedModelV2,
  setSelectedGoal,
  setBrandColor,
  setShowLeadForm,
  setResponseDelay,
  setCalendarLink,
  setAvatarImage,
  setGuidelines,
  setQualificationQuestions,
  setCountryCode,
  setCompanyServices,
  setChatMessages,
  setScrapedUrls,
  setWebhook,
  setChatType,
  setAvatarMessage
) => {
  // Handle selecting an agent
  // When the Agents dropDown changes to set the states for the right agent
  const handleSelectAgent = (agent) => {
    if (!agent) {
      console.log("this client have no  agent");
    }
    // console.log("I've been triggered with this agent:", agent);
    setSelectedAgent(agent);
    // Get the original chat data
    const chatData = agent.originalData;
    const chatConfigObject = agent.chatConfig
    const agentConfigObject = agent.agentConfig

    // console.log("chatData.webhooksData?.endpoint_url", chatData.webhooksData?.endpoint_url);
    setWebhook(agent.webhooksData?.endpoint_url || "");
    setChatType(chatData.chat_type)
    //here - || chatConfigObject.global_?.businessDetails?.chatConfig?.botName || agentConfigObject.bot_config?.bot_name
    // Update all the state variables based on the selected chat
    setBotName(chatData.chat_config?.global_?.businessDetails?.chatConfig?.botName ||
      chatData.ai_config?.bot_config?.bot_name || chatConfigObject.global_?.businessDetails?.chatConfig?.botName || agentConfigObject.bot_config?.bot_name ||
      "");

    //here - || chatConfigObject.global_?.businessDetails?.chatConfig?.introMessage  
    setIntroMessage(chatData.chat_config?.global_?.businessDetails?.chatConfig?.introMessage || chatConfigObject.global_?.businessDetails?.chatConfig?.introMessage ||
      "");

    // Set model
    const modelName = chatData.model_name;
    if (modelName) {
      const matchedModelKey = findMatchingModelKey(modelName, aiModels);
      setSelectedModel(matchedModelKey || "gpt-4o-mini");
    } else {
      setSelectedModel("gpt-4o-mini");
    }

    const modelNameV2 = chatData.model_names_v2;
    if (modelNameV2) {
      const matchedModelKeyV2 = findMatchingModelKey(modelNameV2, aiModelsV2);
      setSelectedModelV2(matchedModelKeyV2 || "gpt-4.1");
    } else {
      setSelectedModelV2("gpt-4.1");
    }

    // Set goal - only set it if we're loading a new agent, not when changing goals manually
    // We'll store the original goal from the API to use as a reference
    const botGoalName = chatData.extra_info?.bot_goal?.name;
    if (botGoalName) {
      const matchedGoalKey = findMatchingGoalKey(botGoalName, aiGoals);
      // Store the original goal but don't reset the current selection if it's been changed
      agent.originalGoal = matchedGoalKey || "customer-support";

      // Only set the goal if this is the first time loading the agent
      if (!agent.goalManuallyChanged) {
        setSelectedGoal(agent.originalGoal);
      }
    } else {
      agent.originalGoal = "customer-support";
      if (!agent.goalManuallyChanged) {
        setSelectedGoal("customer-support");
      }
    }

    // Set other values without logging
    setBrandColor(chatData.chat_config?.global_?.businessDetails?.brandDesign?.primaryColor || chatConfigObject.global_?.businessDetails?.brandDesign?.primaryColor || "#CCFC01");
    setShowLeadForm(!chatData.is_form_deactivated);
    setResponseDelay(chatData.response_delay || 0);

    // Set calendar link if available
    setCalendarLink(chatData?.booking_link || "");

    // Set avatar image if available
    if (chatData.chat_config?.avatar?.avatarImage) {
      // console.log("im here", chatData.chat_config?.avatar?.avatarImage);
      setAvatarImage(chatData.chat_config?.avatar?.avatarImage);
    } else {
      setAvatarImage(null);
    }

    if (chatData.chat_config?.avatar?.message) {
      // console.log("im here", chatData.chat_config?.avatar?.avatarImage);
      setAvatarMessage(chatData.chat_config?.avatar?.message);
    } else {
      setAvatarMessage(null);
    }

    // Set guidelines
    const guidelinesArray = chatData.ai_config?.chat_info?.guidelines?.extra_info || [];
    setGuidelines(guidelinesArray);

    // Set qualification questions
    const questionsArray = chatData.ai_config?.chat_info?.qualification_questions || [];
    setQualificationQuestions(questionsArray);

    // Set country code
    setCountryCode(chatData.country_code || "GB");

    // Set company services
    setCompanyServices(chatData.ai_config?.company_details?.company_services || "");

    // Reset chat with new intro message
    setChatMessages([{
      role: "assistant",
      content: chatData.chat_config?.global_?.businessDetails?.chatConfig?.introMessage ||
        "Hi there 👋, how can I help you today?"
    }]);

    // Set training data
    //console.log("chatData.training_data", chatData);

    if (chatData.training_data && Array.isArray(chatData.training_data)) {
      const transformedTrainingData = chatData.training_data.map(item => ({
        id: item.id,
        url: item.url,
        scrapedAt: new Date(item.created_at).toLocaleString(),
        fileType: item.url.startsWith("Q:") ? "FAQ" : "URL",
        processing: false,
        content: item.url.startsWith("Q:") ? item.url : undefined
      }));

      setScrapedUrls(transformedTrainingData);
    } else {
      setScrapedUrls([])
    }
  };

  return {
    handleSelectAgent
  };
};
