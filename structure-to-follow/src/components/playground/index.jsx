import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DeleteAgentModal from "../../components/DeleteAgentModal";
import { usePlaygroundState } from "./hooks/usePlaygroundState";
import PlaygroundHeader from "./PlaygroundHeader";
import BotIdentity from "./configuration/BotIdentity";
import AIConfiguration from "./configuration/AIConfiguration";
import ContentConfiguration from "./configuration/ContentConfiguration";
import ChatPreview from "./configuration/ChatPreview";
import TrainingTabs from "./advanced-training/TrainingTabs";
import ContentTable from "./advanced-training/ContentTable";
import UrlModal from "./advanced-training/modals/UrlModal";
import ContentModal from "./advanced-training/modals/ContentModal";
import { Button, Tabs, Tab } from "@heroui/react";
import { Bot, MessageSquare, Zap, FileText, Settings, Wrench, ChevronRight, ChevronLeft } from "lucide-react";

import { UserDataContext } from "../../context/UserDataContext";
import ContentTableV2 from "./advanced-training/ContentTableV2";

import useTourController from "../../Demo/utils/useTourController";
import Joyride from 'react-joyride';
import { playgroundSteps } from "../../Demo/Playground/mainPlayground.demo";
import MyCustomTooltip from "../../Demo/CustomTooltip/MyCustomTooltip";
import ChannelsConfig from "./configuration/channels";
import { chatService, clientExtensionService, integrationService } from "../../api";
import AgentTools from "./configuration/AgentTools";



// Sample prompts for testing the agent
const samplePrompts = [
  "What services do you offer?",
  "Tell me about your pricing",
  "How can I contact support?",
  "What are your business hours?",
];


/**
 * Deploy (or update) channel integrations. 1) deactivate any old integration
 * for this agent+channel, 2) upsert the new one.
 */
export async function deployChannelConfigs({ agent, channelConfigs }) {
  // 1) ensure agent is live
  // await chatService.updateAgent(agent.id, { status: true });

  // 2) fetch all existing integrations for this agent
  const existing = await integrationService.getIntegrationsByAgentId(agent.id);

  // 3) for each channel...
  await Promise.all(
    ["facebook", "instagram", "chat-widget", "whatsapp"].map(async (chan) => {
      let cfg
      if (chan == "chat-widget") {
        cfg = channelConfigs["widget"];
      } else {
        cfg = channelConfigs[chan];
      }
      const types = integrationService.createIntegrationTypes(chan);
      const typeStr = types[0]?.type || chan;

      // find any active integration for this agent+channel
      const activeInt = existing.find(i =>
        i.chat_id === agent.id &&
        i.integration_type?.some(t => t.type === typeStr) &&
        i.is_active
      );

      // if the user has switched this channel OFF → just deactivate/delete it
      if (!cfg.status) {
        if (activeInt && chan == "chat-widget") {
          await integrationService.updateIntegration(activeInt.integration_id, { status: false })
        }
        else if (activeInt && chan != "chat-widget") {
          await integrationService.deleteIntegration(activeInt.integration_id);
        }
        return;
      }

      // === channel is ON ===

      // 4) validation
      if (chan === "facebook" && !cfg.page_id) {
        toast.error("Please select a Facebook page before saving.");
        throw new Error("Facebook page missing");
      }
      if (chan === "instagram" && !cfg.account_id) {
        toast.error("Please select a Instagram account before saving.");
        throw new Error("Instagram account missing");
      }
      if (chan === "whatsapp" && !cfg.account_id) {
        toast.error("Please select a whatsapp phone number before saving.");
        throw new Error("Whatsapp account missing");
      }

      // 5) only delete the old integration if its target differs from the new one
      if (activeInt) {
        if (chan === "facebook") {
          // Facebook → compare page_id
          if (activeInt.page_id !== cfg.page_id) {
            await integrationService.deleteIntegration(activeInt.integration_id);
          }
        }
        else if (chan === "instagram") {
          // Instagram → compare integration_details.account_id
          const oldAccountId = activeInt.integration_details?.account_id;
          if (oldAccountId !== cfg.account_id) {
            await integrationService.deleteIntegration(activeInt.integration_id);
          }
        }
        else if (chan === "whatsapp") {
          // Instagram → compare integration_details.account_id
          const oldAccountId = activeInt.integration_details?.account_id;
          if (oldAccountId !== cfg.account_id) {
            await integrationService.deleteIntegration(activeInt.integration_id);
          }
        }
        else if (chan === "chat-widget") {
          await integrationService.updateIntegration(activeInt.integration_id, { status: true })
        }
      }


      // 6) see if there’s already a record for exactly this page/account
      const match = existing.find(i => {
        const sameType = i.integration_type?.some(t => t.type === typeStr);
        if (chan === "facebook") return sameType && i.page_id === cfg.page_id;
        if (chan === "instagram") return sameType && i.integration_details?.account_id === cfg.account_id;
        if (chan === "whatsapp") return sameType && i.integration_details?.account_id === cfg.account_id;
        return sameType;
      });

      // 7) build the upsert payload
      const payload = {
        integration_details: cfg,
        status: true,
        is_active: true,
        page_id:
          chan === "facebook"
            ? cfg.page_id
            : chan === "whatsapp"
              ? cfg.phone_number
              : cfg.account_id,
      };

      // 8) update or create
      if (match) {
        return integrationService.updateIntegration(match.integration_id, payload);
      } else {
        return integrationService.createIntegration({
          chat_id: agent.id,
          client_id: agent.client_id || agent.user_id,
          integration_type: types,
          ...payload,
        });
      }
    })
  );
}

const Playground = ({ agentId }) => {
  const navigate = useNavigate();
  //this usePlaygroundState is the index.js inside usePlaygroundState folder
  const playgroundState = usePlaygroundState();
  const { loggedInUser, userData } = useContext(UserDataContext);
  const isLoading = !playgroundState.dataFetched;

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("playground", loggedInUser);


  // Make playgroundState available globally for the goal selection
  window.playgroundState = playgroundState;


  // Load agent data when agentId is provided or default to first agent
  useEffect(() => {
    if (!playgroundState.dataFetched) return; // Wait until data fetch is complete

    if (playgroundState.filteredAgents.length > 0) {
      if (agentId) {
        const agent = playgroundState.filteredAgents.find(
          (agent) => agent.id === agentId
        );
        if (agent) {
          if (
            !playgroundState.selectedAgent ||
            playgroundState.selectedAgent.id !== agent.id
          ) {
            playgroundState.handleSelectAgent(agent);
          }
        } else {
          const firstAgent = playgroundState.filteredAgents[0];
          if (!playgroundState.selectedAgent) {
            playgroundState.handleSelectAgent(firstAgent);
          }
          navigate(`/playground/${firstAgent.id}`, { replace: true });
        }
      } else if (!playgroundState.selectedAgent) {
        const firstAgent = playgroundState.filteredAgents[0];
        playgroundState.handleSelectAgent(firstAgent);
        navigate(`/playground/${firstAgent.id}`, { replace: true });
      }
    } else {
      navigate("/agents");
    }
  }, [
    agentId,
    playgroundState.dataFetched,
    playgroundState.filteredAgents,
    playgroundState.selectedAgent,
    navigate,
  ]);


  const [lastChangedSection, setLastChangedSection] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const [crawlJobInProgress, setCrawlJobInProgress] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [customTools, setCustomTools] = useState([]);


  // When tab changes, auto-collapse chat if switching to training tab
  useEffect(() => {
    if (activeTab === "training" || activeTab == "channels") {
      setIsChatExpanded(false);
    } else {
      setIsChatExpanded(true);
    }
  }, [activeTab]);


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
  } = playgroundState;

  const agentHasAnyChannel =
    channelConfigs.facebook.status || channelConfigs.instagram.status;

  // check if we have either FB or IG extension connected
  const hasMessagingExtensions = connectedExtensions.some(ext =>
    // Facebook UUID
    ext.extension_id === '9e9de118-8aa5-408a-960c-74074c66cd8e' ||
    // Instagram UUID
    ext.extension_id === 'c32aeec7-50d7-4469-99a5-4235870d16a7' ||
    //Telegram UUID
    ext.extension_id === '3c375262-ff82-45b5-b72b-ec05c215e36f' ||
    //Whatsapp UUID
    ext.extension_id === 'a2a83703-8c62-4216-b94d-9ecfdfc32438' ||
    //chat widget UUID
    ext.extension_id === '38b88988-58ce-4f49-b2ca-412bd8fa4b0f'
  );

  // Toggle function for the chat preview
  const toggleChatPreview = () => {
    setIsChatExpanded(!isChatExpanded);
  };

  // Function to save changes
  const handleTestChange = async (section) => {
    setLastChangedSection(section);
    setShowFeedback(true);

    playgroundState.handleApplyChanges()
    // Hide feedback after 3 seconds
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  // Function to insert a sample prompt
  const insertSamplePrompt = (prompt) => {
    playgroundState.setUserInput(prompt);
  };

  return (
    isLoading ? (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="p-3 rounded-full bg-gray-100 mb-4">
          <Bot className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Agents...</h3>
      </div>) : (
      <div className="h-full min-h-[calc(100vh-6rem)] space-y-6">
        {/* Joyride component at the top level */}
        <Joyride
          showProgress={true}
          disableCloseOnEsc={true}
          disableOverlayClose={true}
          steps={playgroundSteps}
          run={runTour}
          scrollOffset={300}
          continuous={true}
          showSkipButton={true}
          tooltipComponent={MyCustomTooltip}
          callback={handleJoyrideCallback}
          styles={{
            options: {
              zIndex: 10000,
            },
          }}
        />
        {/* Header */}
        <div className="playground-header">
          <div className="deploy-agent">
            <PlaygroundHeader
              selectedAgent={playgroundState.selectedAgent}
              setSelectedAgent={playgroundState.setSelectedAgent}
              filteredAgents={playgroundState.filteredAgents}
              searchQuery={playgroundState.searchQuery}
              setSearchQuery={playgroundState.setSearchQuery}
              handleSelectAgent={playgroundState.handleSelectAgent}
              setChatType={playgroundState.setChatType}
              chatType={playgroundState.chatType}
              handleApplyChanges={playgroundState.handleApplyChanges}  // pass it here
            />
          </div>


          {/* Main content - Fixed layout with responsive behavior */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column - Configuration (always 3 columns, but expands when chat is collapsed) */}
            <div className={`lg:col-span-3 ${(activeTab === "training" || activeTab === "channels") && !isChatExpanded ? "lg:col-span-5" : ""} space-y-6 transition-all duration-300 z-50`}>
              <div className="space-y-6">
                {/* Configuration Tabs */}
                <Tabs
                  aria-label="Configuration Options"
                  variant="underlined"
                  defaultSelectedKey="identity"
                  selectedKey={activeTab}
                  onSelectionChange={setActiveTab}
                  classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-200",
                    cursor: "w-full bg-brand",
                    tab: "max-w-fit px-0 h-12",
                    tabContent: "group-data-[selected=true]:text-gray-900"
                  }}
                >
                  <Tab
                    key="identity"
                    title={
                      <div className="flex items-center gap-2">
                        <Bot size={18} />
                        <span>Agent Identity</span>
                      </div>
                    }
                  >
                    <div className="py-0">
                      <div className="relative agent-welcome">
                        {showFeedback && lastChangedSection === 'identity' && (
                          <div className="absolute -top-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium animate-pulse">
                            Changes applied! Test in the chat →
                          </div>
                        )}
                        <BotIdentity
                          botName={playgroundState.botName}
                          setBotName={playgroundState.setBotName}
                          introMessage={playgroundState.introMessage}
                          setIntroMessage={playgroundState.setIntroMessage}
                          avatarMessage={playgroundState.avatarMessage}
                          setAvatarMessage={playgroundState.setAvatarMessage}
                          avatarImage={playgroundState.avatarImage}
                          handleFileUpload={playgroundState.handleFileUpload}
                        />
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            className="bg-brand text-gray-900 save-changes"
                            startContent={<Zap size={14} />}
                            onPress={() => handleTestChange('identity')}
                            aria-label="Save Changes"
                          >
                            Save changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    key="ai-config"
                    title={
                      <div className="flex items-center gap-2">
                        <Settings size={18} />
                        <span>AI Configuration</span>
                      </div>
                    }
                  >
                    <div className="py-0">
                      <div className="relative">
                        {showFeedback && lastChangedSection === 'ai-config' && (
                          <div className="absolute -top-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium animate-pulse">
                            AI settings updated! Test in the chat →
                          </div>
                        )}
                        <AIConfiguration
                          selectedModel={playgroundState.selectedModel}
                          setSelectedModel={playgroundState.setSelectedModel}
                          selectedModelV2={playgroundState.selectedModelV2}
                          setSelectedModelV2={playgroundState.setSelectedModelV2}
                          selectedGoal={playgroundState.selectedGoal}
                          setSelectedGoal={playgroundState.setSelectedGoal}
                          brandColor={playgroundState.brandColor}
                          setBrandColor={playgroundState.setBrandColor}
                          showLeadForm={playgroundState.showLeadForm}
                          setShowLeadForm={playgroundState.setShowLeadForm}
                          responseDelay={playgroundState.responseDelay}
                          setResponseDelay={playgroundState.setResponseDelay}
                          webhook={playgroundState.webhook}
                          setWebhook={playgroundState.setWebhook}
                          calendarLink={playgroundState.calendarLink}
                          setCalendarLink={playgroundState.setCalendarLink}
                          countryCode={playgroundState.countryCode}
                          setCountryCode={playgroundState.setCountryCode}
                          onDeleteAgent={() => {
                            if (playgroundState.selectedAgent) {
                              setIsDeleteOpen(true);
                            }
                          }}
                        />
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            className="bg-brand text-gray-900"
                            startContent={<Zap size={14} />}
                            onPress={() => handleTestChange('ai-config')}
                            aria-label="Save Changes"
                          >
                            Save changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Tab>
                  {loggedInUser.role === 'God Mode' &&
                    <Tab
                      key="agent-tools"
                      title={
                        <div className="flex items-center gap-2">
                          <Wrench size={18} />
                          <span>Agent Tools</span>
                        </div>
                      }
                    >
                      <div className="py-0">
                        <div className="relative">
                          {showFeedback && lastChangedSection === 'agent-tools' && (
                            <div className="absolute -top-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium animate-pulse">
                              Tools updated! Test in the chat →
                            </div>
                          )}
                          <AgentTools
                            setSelectedAgent={playgroundState.setSelectedAgent}
                            selectedAgent={playgroundState.selectedAgent}
                            webSearchEnabled={webSearchEnabled}
                            setWebSearchEnabled={setWebSearchEnabled}
                            customTools={customTools}
                            setCustomTools={setCustomTools}
                            customToolsInstructions={playgroundState.customToolsInstructions}
                            setCustomToolsInstructions={playgroundState.setCustomToolsInstructions}
                          />
                          <div className="mt-4 flex justify-end">
                            <Button
                              size="sm"
                              className="bg-brand text-gray-900"
                              startContent={<Zap size={14} />}
                              onPress={() => handleTestChange('agent-tools')}
                              aria-label="Save Changes"
                            >
                              Save changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Tab>
                  }
                  <Tab
                    key="content"
                    title={
                      <div className="flex items-center gap-2">
                        <MessageSquare size={18} />
                        <span>Content Guidelines</span>
                      </div>
                    }
                  >
                    <div className="py-0">
                      <div className="relative">
                        {showFeedback && lastChangedSection === 'content' && (
                          <div className="absolute -top-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium animate-pulse">
                            Guidelines updated! Test in the chat →
                          </div>
                        )}
                        <ContentConfiguration
                          companyServices={playgroundState.companyServices}
                          setCompanyServices={playgroundState.setCompanyServices}
                          guidelines={playgroundState.guidelines}
                          guidelinesArray={playgroundState.guidelinesArray}
                          setGuidelinesArray={playgroundState.setGuidelinesArray}
                          setGuidelines={playgroundState.setGuidelines}
                          selectedGoal={playgroundState.selectedGoal}
                          selectedAgent={playgroundState.selectedAgent}
                          qualificationQuestions={playgroundState.qualificationQuestions}
                          setQualificationQuestions={playgroundState.setQualificationQuestions}
                          handleApplyChanges={playgroundState.handleApplyChanges}
                          setSelectedAgent={playgroundState.setSelectedAgent}
                        />
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            className="save-btn bg-brand text-gray-900"
                            startContent={<Zap size={14} />}
                            onPress={() => handleTestChange('content')}
                            aria-label="Save Changes"
                          >
                            Save changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    key="training"
                    title={
                      <div className="flex items-center gap-2">
                        <FileText size={18} />
                        <span>Training Data</span>
                      </div>
                    }
                  >
                    <div className="py-0">
                      <div className="relative">
                        {showFeedback && lastChangedSection === 'training' && (
                          <div className="absolute -top-2 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-md text-xs font-medium animate-pulse">
                            Training data added! Test in the chat →
                          </div>
                        )}
                        <TrainingTabs
                          activeTrainingTab={playgroundState.activeTrainingTab}
                          setActiveTrainingTab={playgroundState.setActiveTrainingTab}
                          websiteUrl={playgroundState.websiteUrl}
                          setWebsiteUrl={playgroundState.setWebsiteUrl}
                          singlePageUrl={playgroundState.singlePageUrl}
                          setSinglePageUrl={playgroundState.setSinglePageUrl}
                          faqQuestion={playgroundState.faqQuestion}
                          setFaqQuestion={playgroundState.setFaqQuestion}
                          faqAnswer={playgroundState.faqAnswer}
                          setFaqAnswer={playgroundState.setFaqAnswer}
                          handleAddUrl={playgroundState.handleAddUrl}
                          handleAddFaq={playgroundState.handleAddFaq}
                          handleBulkAddFaqs={playgroundState.handleBulkAddFaqs}
                          handlePdfUpload={playgroundState.handlePdfUpload}
                          selectedAgent={playgroundState.selectedAgent}
                          setCrawlJobInProgress={setCrawlJobInProgress}
                          crawlJobInProgress={crawlJobInProgress}
                          setCrawlJobId={playgroundState.setCrawlJobId}
                        />
                        <div className="mt-4">
                          <ContentTableV2
                            scrapedUrls={playgroundState.scrapedUrls}
                            handleApplyContentChanges={() => handleTestChange('training')}
                            selectedAgent={playgroundState.selectedAgent}
                            setSelectedAgent={playgroundState.setSelectedAgent}
                            setScrapedUrls={playgroundState.setScrapedUrls}
                            crawlJobInProgress={crawlJobInProgress}
                            setCrawlJobInProgress={setCrawlJobInProgress}
                            crawlJobId={playgroundState.crawlJobId}
                          />
                        </div>
                      </div>
                    </div>
                  </Tab>
                  {playgroundState.selectedAgent?.originalData.status &&
                    hasMessagingExtensions &&
                    < Tab
                      key="channels"
                      title={
                        <div className="flex items-center gap-2">
                          <FileText size={18} />
                          <span> Channels</span>
                        </div>
                      }>
                      <div className="py-0 relative">
                        {(isLoadingExtensions || isLoadingIntegrations) ? (
                          <div className="flex justify-center p-8">
                            <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-brand rounded-full" />
                          </div>
                        ) : (
                          <div className="relative">
                            <ChannelsConfig
                              connectedExtensions={connectedExtensions}
                              channelConfigs={channelConfigs}
                              facebookPages={facebookPages}
                              instagramAccounts={instagramAccounts}
                              whatsappAccounts={whatsappAccounts}
                              isLoadingPages={isLoadingPages}
                              isLoadingAccounts={isLoadingAccounts}
                              onConfigChange={setChannelConfigs}
                              setChatType={playgroundState.setChatType}
                              chatType={playgroundState.chatType}
                              agent={playgroundState.selectedAgent}
                            />
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <Button
                            size="sm"
                            className="bg-brand text-gray-900"
                            startContent={<Zap size={14} />}
                            onPress={() => handleTestChange('channels')}
                          >
                            Save channels
                          </Button>
                        </div>
                      </div>
                    </Tab>
                  }
                </Tabs>
              </div>
            </div>

            {/* Right column - Chat Widget Preview with toggle */}
            <div className={`lg:col-span-2 ${(activeTab === "training" || activeTab === "channels") && !isChatExpanded ? "lg:hidden" : ""} transition-all duration-300 ease-in-out`}>
              <div className="sticky top-0 flex z-40">
                {/* Toggle button to collapse chat - only show when in training tab and chat is expanded */}
                {(activeTab === "training" || activeTab === "channels") && isChatExpanded && (
                  <button
                    onClick={toggleChatPreview}
                    className="h-full bg-brand hover:bg-brand/90 p-2 mt-[154px] rounded-l-md flex items-center justify-center text-gray-900"
                    aria-label="Collapse chat"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
                <div className="space-y-4 flex-1 mt-20 test-agent">
                  <ChatPreview
                    selectedAgent={playgroundState.selectedAgent}
                    botName={playgroundState.botName}
                    avatarImage={playgroundState.avatarImage}
                    chatMessages={playgroundState.chatMessages}
                    userInput={playgroundState.userInput}
                    setUserInput={playgroundState.setUserInput}
                    handleSendMessage={playgroundState.handleSendMessage}
                    setChatMessages={playgroundState.setChatMessages}
                    introMessage={playgroundState.introMessage}
                    isTyping={playgroundState.isTyping}
                  />

                  {/* Sample prompts */}
                  {/* <div className="bg-white border border-gray-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sample prompts to test your Agent</h3>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((prompt, index) => (
                    <Chip
                      key={index}
                      variant="flat"
                      color="primary"
                      className="cursor-pointer"
                      onClick={() => insertSamplePrompt(prompt)}
                    >
                      {prompt}
                    </Chip>
                  ))}
                </div>
              </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle button for collapsed chat - only visible in training tab */}
          {(activeTab === "training" || activeTab === "channels") && !isChatExpanded && (
            <button
              onClick={toggleChatPreview}
              className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-brand hover:bg-brand/90 p-2 rounded-l-md flex items-center justify-center z-10 text-gray-900"
              aria-label="Expand chat"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Modals */}
          <ContentModal
            isOpen={playgroundState.showContentModal}
            onClose={() => playgroundState.setShowContentModal(false)}
            scrapingUrl={playgroundState.scrapingUrl}
            modalContent={playgroundState.modalContent}
            handleAddToAiBrain={playgroundState.handleAddToAiBrain}
          />

          {/* Delete Agent Modal */}
          <DeleteAgentModal
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            agent={playgroundState.selectedAgent}
            onDelete={(agent) => {
              // Show success toast
              toast.success(`${agent.name} has been successfully deleted.`);
              // Navigate back to agents page
              navigate('/agents');
            }}
          />
        </div>
      </div >
    )
  );
};

export default Playground;
