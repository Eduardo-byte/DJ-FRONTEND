export const getInitialState = () => ({
  // State for active view (Configuration or Advanced Training)
  activeView: "configuration",

  // State for storing chat agents from API
  chatAgents: [],

  // State for all form fields
  selectedAgent: null,
  selectedChatConfig: null,
  selectedAgentConfig: null,
  searchQuery: "",
  botName: "Olivia",
  introMessage: "",
  avatarMessage: "Hi There 👋!",
  selectedModel: "gpt-4o-mini",
  selectedModelV2: "gpt-4.1",
  selectedGoal: "customer-support",
  brandColor: "#CCFC01",
  showLeadForm: true,
  responseDelay: 0,
  webhook: "",
  calendarLink: "",
  companyServices: "",
  guidelines: "",
  qualificationQuestions: [],
  avatarImage: null,
  saveAvatarImage: null,
  countryCode: "GB",

  // Chat widget state
  chatMessages: [
    { role: "assistant", content: "Hi there 👋, how can I help you today?" }
  ],
  userInput: "",
  isTyping: false,

  // State for Advanced Training view
  activeTrainingTab: "documents",
  scrapedUrls: [],
  websiteUrl: "",
  singlePageUrl: "",
  showUrlModal: false,
  showContentModal: false,
  modalUrls: [
    { url: "https://olivianetwork.com", selected: false },
    { url: "https://olivianetwork.com/app", selected: false }
  ],
  modalContent: "",
  scrapingUrl: "",
  faqQuestion: "",
  faqAnswer: "",

  // State for web crawling
  crawlJobId: null,
  crawlStatus: null,
  isCrawling: false,
  crawlProgress: 0,
  crawlResults: null,

  // Ref for tracking data fetching
  dataFetchedRef: { current: false },

  chatType: "classic",
  customToolsInstructions: ""
});
