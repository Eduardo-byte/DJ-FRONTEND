import { useState, useMemo, useContext, useRef } from "react";
import { UserDataContext } from "../../../../context/UserDataContext";
import { getInitialState } from "./initialState";
import { useDataFetching } from "./dataFetching";
import { useChatHandlers } from "./chatHandlers";
import { useFileHandlers } from "./fileHandlers";
import { useAgentHandlers } from "./agentHandlers";
import { useWebScrapingHandlers } from "./webScrapingHandlers";
import { useDynamicEffects } from "./dynamicEffects";
import { useChannelIntegrations } from "../useChannelIntegrations";
import { deployChannelConfigs } from "../..";

export const usePlaygroundState = () => {
  // Get user data from context at the component level
  const { userData } = useContext(UserDataContext);

  // Initialize state with default values
  const initialState = getInitialState();

  // State for active view (Configuration or Advanced Training)
  const [activeView, setActiveView] = useState(initialState.activeView);

  // State for storing chat agents from API
  const [chatAgents, setChatAgents] = useState(initialState.chatAgents);

  // State for all form fields
  const [selectedAgent, setSelectedAgent] = useState(initialState.selectedAgent);
  const [selectedChatConfig, setSelectedChatConfig] = useState(initialState.selectedChatConfig);
  const [selectedAgentConfig, setSelectedAgentConfig] = useState(initialState.selectedAgentConfig);
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [botName, setBotName] = useState(initialState.botName);
  const [introMessage, setIntroMessage] = useState(initialState.introMessage);
  const [avatarMessage, setAvatarMessage] = useState(initialState.avatarMessage);
  const [selectedModel, setSelectedModel] = useState(initialState.selectedModel);
  const [selectedModelV2, setSelectedModelV2] = useState(initialState.selectedModelV2);
  const [selectedGoal, setSelectedGoal] = useState(initialState.selectedGoal);
  const [brandColor, setBrandColor] = useState(initialState.brandColor);
  const [showLeadForm, setShowLeadForm] = useState(initialState.showLeadForm);
  const [responseDelay, setResponseDelay] = useState(initialState.responseDelay);
  const [webhook, setWebhook] = useState(initialState.webhook);
  const [calendarLink, setCalendarLink] = useState(initialState.calendarLink);
  const [companyServices, setCompanyServices] = useState(initialState.companyServices);
  const [guidelines, setGuidelines] = useState(initialState.guidelines);
  const [qualificationQuestions, setQualificationQuestions] = useState(initialState.qualificationQuestions);
  const [avatarImage, setAvatarImage] = useState(initialState.avatarImage);
  const [saveAvatarImage, setSaveAvatarImage] = useState(initialState.saveAvatarImage);
  const [countryCode, setCountryCode] = useState(initialState.countryCode);
  const [guidelinesArray, setGuidelinesArray] = useState([]);
  // Chat widget state
  const [chatMessages, setChatMessages] = useState(initialState.chatMessages);
  const [userInput, setUserInput] = useState(initialState.userInput);
  const [isTyping, setIsTyping] = useState(initialState.isTyping);

  // State for Advanced Training view
  const [activeTrainingTab, setActiveTrainingTab] = useState(initialState.activeTrainingTab);
  const [scrapedUrls, setScrapedUrls] = useState(initialState.scrapedUrls);
  const [websiteUrl, setWebsiteUrl] = useState(initialState.websiteUrl);
  const [singlePageUrl, setSinglePageUrl] = useState(initialState.singlePageUrl);
  const [showUrlModal, setShowUrlModal] = useState(initialState.showUrlModal);
  const [showContentModal, setShowContentModal] = useState(initialState.showContentModal);
  const [modalUrls, setModalUrls] = useState(initialState.modalUrls);
  const [modalContent, setModalContent] = useState(initialState.modalContent);
  const [scrapingUrl, setScrapingUrl] = useState(initialState.scrapingUrl);
  const [faqQuestion, setFaqQuestion] = useState(initialState.faqQuestion);
  const [faqAnswer, setFaqAnswer] = useState(initialState.faqAnswer);

  // State for web crawling
  const [crawlJobId, setCrawlJobId] = useState(initialState.crawlJobId);
  const [crawlStatus, setCrawlStatus] = useState(initialState.crawlStatus);
  const [isCrawling, setIsCrawling] = useState(initialState.isCrawling);
  const [crawlProgress, setCrawlProgress] = useState(initialState.crawlProgress);
  const [crawlResults, setCrawlResults] = useState(initialState.crawlResults);


  //Deploy States
  const [chatType, setChatType] = useState(initialState.chatType);


  //
  const [customToolsInstructions, setCustomToolsInstructions] = useState(initialState.customToolsInstructions);

  // Use a ref to track if we've already fetched data
  const dataFetchedRef = useRef(initialState.dataFetchedRef.current);

  // Use the data fetching hook
  useDataFetching(userData, chatAgents, setChatAgents, dataFetchedRef, selectedAgent);

  // Use the chat handlers hook
  const { handleSendMessage } = useChatHandlers(
    chatMessages,
    setChatMessages,
    userInput,
    setUserInput,
    setIsTyping,
    responseDelay
  );

  const {
    channelConfigs,
    setChannelConfigs,
    facebookPages,
    instagramAccounts,
    whatsappAccounts,
    isLoadingPages,
    isLoadingAccounts,
    isLoadingExtensions,
    isLoadingIntegrations,
    connectedExtensions,
    setConnectedExtensions,
  } = useChannelIntegrations(selectedAgent?.id, selectedAgent);

  // Use the file handlers hook
  const { uploadFileToSupabase, handleFileUpload, handleApplyChanges } = useFileHandlers(
    selectedAgent,
    setSelectedAgent,
    setAvatarImage,
    setSaveAvatarImage,
    avatarImage,
    saveAvatarImage,
    webhook,
    deployChannelConfigs,
    channelConfigs,
    null // setErrors is not used in this component
  );

  // Use the agent handlers hook
  const { handleSelectAgent } = useAgentHandlers(
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
  );

  // Use the web scraping handlers hook
  const {

    checkCrawlStatus,
    handleAddUrl,
    handleAddToAiBrain,
    handleAddFaq,
    handleBulkAddFaqs,
    handlePdfUpload,
  } = useWebScrapingHandlers(
    websiteUrl,
    setIsCrawling,
    setCrawlStatus,
    setCrawlProgress,
    setCrawlResults,
    setScrapingUrl,
    setCrawlJobId,
    setModalUrls,
    setShowUrlModal,
    crawlResults,
    modalUrls,
    scrapingUrl,
    singlePageUrl,
    setModalContent,
    setShowContentModal,
    selectedAgent,
    userData,
    setScrapedUrls,
    setSelectedAgent,
    handleApplyChanges,
    setFaqAnswer,
    setFaqQuestion
  );

  // Use the dynamic effects hook
  useDynamicEffects(selectedAgent, setSelectedAgent, botName, introMessage, showLeadForm, selectedModel, selectedGoal, brandColor, responseDelay, webhook, countryCode, companyServices, guidelinesArray, qualificationQuestions, chatType, selectedModelV2, calendarLink, customToolsInstructions, avatarMessage);

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    return chatAgents.filter(agent =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatAgents, searchQuery]);

  // Function to handle applying content changes
  const handleApplyContentChanges = (contentId) => {
    // In a real implementation, this would save the changes to the content
    //console.log("Applying changes to content:", contentId);
    // Add success notification or feedback
  };



  return {
    // View state
    activeView,
    setActiveView,

    // Form fields
    selectedAgent,
    setSelectedAgent,
    searchQuery,
    setSearchQuery,
    botName,
    setBotName,
    introMessage,
    setIntroMessage,
    avatarMessage,
    setAvatarMessage,
    selectedModel,
    setSelectedModel,
    selectedModelV2,
    setSelectedModelV2,
    selectedGoal,
    setSelectedGoal,
    brandColor,
    setBrandColor,
    showLeadForm,
    setShowLeadForm,
    responseDelay,
    setResponseDelay,
    webhook,
    setWebhook,
    calendarLink,
    setCalendarLink,
    companyServices,
    setCompanyServices,
    guidelines,
    setGuidelines,
    qualificationQuestions,
    setQualificationQuestions,
    avatarImage,
    setAvatarImage,
    countryCode,
    setCountryCode,
    guidelinesArray,
    setGuidelinesArray,
    setChatType,
    chatType,
    // Chat widget state
    chatMessages,
    setChatMessages,
    userInput,
    setUserInput,

    // Advanced Training state
    activeTrainingTab,
    setActiveTrainingTab,
    scrapedUrls,
    setScrapedUrls,
    websiteUrl,
    setWebsiteUrl,
    singlePageUrl,
    setSinglePageUrl,
    showUrlModal,
    setShowUrlModal,
    showContentModal,
    setShowContentModal,
    modalUrls,
    setModalUrls,
    modalContent,
    setModalContent,
    scrapingUrl,
    setScrapingUrl,
    faqQuestion,
    setFaqQuestion,
    faqAnswer,
    setFaqAnswer,
    setCrawlJobId,

    // Computed values
    filteredAgents,

    // Crawl state
    crawlJobId,
    crawlStatus,
    isCrawling,
    crawlProgress,
    crawlResults,

    //custom tools instructions
    customToolsInstructions,
    setCustomToolsInstructions,

    // Handlers
    handleSendMessage,
    handleFileUpload,
    uploadFileToSupabase,
    handleApplyChanges,
    handleSelectAgent,

    handleAddUrl,
    handleAddToAiBrain,
    handleAddFaq,
    handleBulkAddFaqs,
    handlePdfUpload,
    handleApplyContentChanges,
    checkCrawlStatus,
    dataFetched: dataFetchedRef.current,

    channelConfigs,
    setChannelConfigs,
    facebookPages,
    instagramAccounts,
    whatsappAccounts,
    isLoadingPages,
    isLoadingAccounts,
    isLoadingExtensions,
    isLoadingIntegrations,
    connectedExtensions,
    setConnectedExtensions,
  };
};
