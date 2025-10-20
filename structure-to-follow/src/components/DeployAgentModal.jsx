import React, { useState, useEffect, useContext } from "react";
import { chatService } from "../api/services/chat.service";
import { integrationService, INTEGRATION_TYPES } from "../api/services/integration.service";
import { clientExtensionService } from "../api/services/client-extension.service";
import { UserDataContext } from "../context/UserDataContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import DeploymentWizard from "./DeploymentWizard";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Info, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DeployAgentModal = ({
  isOpen,
  onClose,
  agent,
  onDeploy,
  setChatType,
  chatType,
  variant = "default", // "default" or "dropdown"
  onDeploySuccess = null // Callback function to update the UI after successful deployment
}) => {
  const navigate = useNavigate();

  // Get user data from context
  const { loggedInUser, userData } = useContext(UserDataContext);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState(["chat-widget"]);
  const [channelConfigs, setChannelConfigs] = useState({});
  const [connectedExtensions, setConnectedExtensions] = useState([]);
  const [isLoadingExtensions, setIsLoadingExtensions] = useState(true);
  const [existingIntegrations, setExistingIntegrations] = useState([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);


  // Fetch connected extensions and existing integrations when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.client_id) return;
      // console.log("agent on  deploy modal:", agent);
      setIsLoadingExtensions(true);
      setIsLoadingIntegrations(true);

      try {
        // Fetch connected extensions
        const extensionsResponse = await clientExtensionService.getClientExtensionsByClientId(userData.client_id);

        if (extensionsResponse && !extensionsResponse.status) { // Check if response is successful (not an error)
          //console.log("Client extensions for deployment:", extensionsResponse);
          // Filter to only include connected extensions
          const connected = extensionsResponse.filter(ext => ext.is_connected === true);
          setConnectedExtensions(connected);

          // Update selected channels to only include connected ones (plus chat-widget which is always available)
          const connectedChannelIds = connected.map(ext => ext.extension_name?.toLowerCase());
          setSelectedChannels(prev =>
            prev.filter(channel =>
              channel === "chat-widget" || connectedChannelIds.includes(channel)
            )
          );
        } else {
          console.error("Error fetching client extensions for deployment:", extensionsResponse);
        }

        // Fetch existing integrations for this client
        const integrationsResponse = await integrationService.getIntegrationsByClientId(userData.client_id);

        if (integrationsResponse) {
          //console.log("Existing integrations:", integrationsResponse);
          setExistingIntegrations(integrationsResponse);
        } else {
          console.error("Error fetching integrations for client");
        }
      } catch (error) {
        console.error("Error fetching client extensions for deployment:", error);
      } finally {
        setIsLoadingExtensions(false);
        setIsLoadingIntegrations(false);
      }
    };

    if (isOpen && userData?.client_id) {
      fetchData();
    }
  }, [isOpen, userData?.client_id]);

  // Handle next step
  const handleNext = () => {
    if (currentStep === 1 && selectedChannels.length > 0) {
      setCurrentStep(2);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  // Handle deploy
  //this is actually the deploy function when deploying the modal
  //here
  const handleDeploy = async () => {
    if (!agent) return;
    // console.log("this is me deploying");
    // Log the current channelConfigs state
    //console.log("Channel configs before deployment:", JSON.stringify(channelConfigs, null, 2));

    // Validate required fields for each selected channel
    let validationError = false;

    // Check Facebook page selection
    if (selectedChannels.includes("facebook")) {
      // console.log(channelConfigs)
      if (!channelConfigs.facebook?.page_id || channelConfigs.facebook.page_id === "") {
        toast.error("Please select a Facebook page before deploying.")
        // alert("Please select a Facebook page before deploying.");
        validationError = true;
        return;
      } else {
        //console.log("Facebook page_id for deployment:", channelConfigs.facebook.page_id);
        //console.log("Facebook page_name for deployment:", channelConfigs.facebook.page_name);
      }
    }

    // Check Instagram account selection
    if (selectedChannels.includes("instagram")) {
      if (!channelConfigs.instagram?.account_id || channelConfigs.instagram.account_id === "") {
        toast.error("Please select an Instagram account before deploying.")
        // alert("Please select an Instagram account before deploying.");
        validationError = true;
        return;
      } else {
        // console.log("Instagram account_id for deployment:", channelConfigs.instagram.account_id);
        // console.log("Instagram account_name for deployment:", channelConfigs.instagram.account_name);
      }
    }

    if (selectedChannels.includes("whatsapp")) {
      if (!channelConfigs.whatsapp?.account_id || channelConfigs.whatsapp.account_id === "") {
        toast.error("Please select an Whatsapp account before deploying.")
        // alert("Please select an Instagram account before deploying.");
        validationError = true;
        return;
      } else {
        // console.log("Instagram account_id for deployment:", channelConfigs.instagram.account_id);
        // console.log("Instagram account_name for deployment:", channelConfigs.instagram.account_name);
      }
    }

    if (selectedChannels.includes("telegram") && !channelConfigs.telegram?.verified) {
      toast.error("Please verify your Telegram channel before deploying.");
      return;
    }

    if (validationError) return;

    try {
      // Update agent status to true (Live)
      const updateData = { status: true };
      const result = await chatService.updateAgent(agent.id, updateData);

      if (result) {
        // Log the agent object to debug
        //console.log("Agent object:", agent);

        // Ensure we have a client_id
        const clientId = agent.clientId || agent.client_id || agent.user_id;

        if (!clientId) {
          console.error("Error: client_id is missing from the agent object", agent);
          alert("Error: client_id is missing. Cannot create integration records.");
          return;
        }

        //console.log("Using client ID:", clientId);

        // First, get existing integrations for this agent
        const existingIntegrations = await integrationService.getIntegrationsByAgentId(agent.id);
        // console.log("Existing integrations:", existingIntegrations);

        // Process each selected channel
        const integrationPromises = selectedChannels.map(async (channel) => {
          // Skip channels that are not available yet (coming soon)
          //here
          const channelInfo = getChannelInfo(channel);
          if (!channelInfo.available) return null;

          // Create integration type in the correct format
          const integrationType = integrationService.createIntegrationTypes(channel);
          const integrationTypeString = integrationType[0]?.type || channel;

          // Use the user-configured settings or fall back to defaults
          const integrationDetails = channelConfigs[channel] || getDefaultIntegrationDetails(channel);

          // Check if an integration already exists for this channel
          const existingIntegration = existingIntegrations?.find(integration => {
            // Check if the integration type matches
            const hasMatchingType = integration.integration_type?.some(
              type => type.type === integrationTypeString
            );

            // For Facebook and Instagram, also check if the page_id or account_id matches
            if (channel === "facebook") {
              return hasMatchingType && integration.page_id === integrationDetails.page_id;
            } else if (channel === "instagram") {
              try {
                const details = integration.integration_details;
                return hasMatchingType && details && details.account_id === integrationDetails.account_id;
              } catch (e) {
                return false;
              }
            } else if (channel === "telegram") {
              return hasMatchingType && integration.is_active
            } else if (channel === "whatsapp") {
              try {
                const details = integration.integration_details;
                return hasMatchingType && details && details.account_id === integrationDetails.account_id;
              } catch (e) {
                return false;
              }
            }

            return hasMatchingType;
          });

          if (existingIntegration) {
            // If integration exists, just update its status to true
            //console.log(`Updating existing ${channel} integration (ID: ${existingIntegration.integration_id})`);

            // Update with new integration details and status
            let updateData
            if (channel == "telegram") {
              updateData = {
                status: true,
                is_active: true
              };
            } else {
              updateData = {
                integration_details: JSON.parse(JSON.stringify(integrationDetails)),
                status: true,
                is_active: true
              };
            }

            // For Facebook, also update the page_id
            if (channel === "facebook" && integrationDetails.page_id) {
              updateData.page_id = integrationDetails.page_id;
            }

            return integrationService.updateIntegration(existingIntegration.integration_id, updateData);
          } else {
            // If no integration exists, create a new one
            //console.log(`Creating new ${channel} integration`);

            const integrationData = {
              chat_id: agent.id,
              client_id: clientId,
              integration_type: integrationType,
              integration_details: JSON.parse(JSON.stringify(integrationDetails)), // Ensure proper serialization
              status: true,
              is_active: true
            };

            // For Facebook, also set the page_id at the top level
            if (channel === "facebook" && integrationDetails.page_id) {
              integrationData.page_id = integrationDetails.page_id;
            } else if (channel === "instagram" && integrationDetails.account_id) {
              integrationData.page_id = integrationDetails.account_id
            } else if (channel === "whatsapp" && integrationDetails.account_id) {
              integrationData.page_id = integrationDetails.phone_number
            }

            // Log the integration data for debugging
            //console.log(`Integration data for ${channel}:`, JSON.stringify(integrationData, null, 2));

            return integrationService.createIntegration(integrationData);
          }
        });

        // Wait for all integration operations to complete
        const integrationResults = await Promise.all(integrationPromises);
        const successfulIntegrations = integrationResults.filter(result => result !== null);

        if (isAgentLive) {
          // For already live agents, show "Saving Changes" alert
          // alert("Saving Changes");
          onDeploy(agent, selectedChannels);
        } else {
          // For agents being deployed for the first time
          if (onDeploy) {
            onDeploy(agent, selectedChannels);
          } else {
            // Default behavior if no onDeploy function is provided
            alert(`Agent deployed to ${selectedChannels.join(", ")} successfully! Created ${successfulIntegrations.length} integration records.`);
          }

          // Update the UI if callback is provided
          if (onDeploySuccess) {
            onDeploySuccess(agent.id);
          }
        }
      } else {
        // alert("Failed to deploy agent. Please try again.");
        toast.warning("Failed to deploy agent. Please try again.");
      }
    } catch (error) {
      console.error("Error deploying agent:", error);
      toast.warning("Failed to deploy agent. Please try again.");
      // alert("An error occurred while deploying the agent. Please try again.");
    }

    // Reset wizard state and close modal
    setCurrentStep(1);
    setSelectedChannels(["chat-widget"]);
    onClose();
  };

  // Helper function to get channel info
  const getChannelInfo = (channelId) => {
    // Get extension ID based on channel ID
    const getExtensionId = (channelId) => {
      switch (channelId.toLowerCase()) {
        case 'facebook':
          return '9e9de118-8aa5-408a-960c-74074c66cd8e';
        case 'instagram':
          return 'c32aeec7-50d7-4469-99a5-4235870d16a7';
        case 'widget':
          return '38b88988-58ce-4f49-b2ca-412bd8fa4b0f';
        case 'chat-widget':
          return '38b88988-58ce-4f49-b2ca-412bd8fa4b0f';
        case "telegram":
          return '3c375262-ff82-45b5-b72b-ec05c215e36f';
        case "whatsapp":
          return 'a2a83703-8c62-4216-b94d-9ecfdfc32438';
        default:
          return null;
      }
    };

    // Check if this channel has a connected extension
    const isConnected = (channelId) => {
      // Chat widget is always available
      if (channelId === "chat-widget") return true;

      const extensionId = getExtensionId(channelId);
      return connectedExtensions.some(ext =>
        (ext.extension_name?.toLowerCase() === channelId.toLowerCase()) ||
        (ext.extension_id === extensionId)
      );
    };

    const channels = [
      { id: "chat-widget", name: "Chat Widget", available: true },
      { id: "facebook", name: "Facebook", available: true },
      { id: "instagram", name: "Instagram", available: true },
      { id: "whatsapp", name: "Whatsapp", available: true },
      { id: "x", name: "X", available: false },
      { id: "telegram", name: "Telegram", available: true },
      { id: "linkedin", name: "LinkedIn", available: false },
      { id: "email", name: "Email", available: false },
      { id: "sms", name: "SMS", available: false },
      { id: "team", name: "Add to a team", available: false },
    ];

    return channels.find(channel => channel.id === channelId) || { id: channelId, name: channelId, available: false };
  };

  // Helper function to get default integration details based on the channel
  const getDefaultIntegrationDetails = (channel) => {
    switch (channel) {
      case "chat-widget":
        return {
          widget_position: "bottom-right",
          widget_color: "#6366F1",
          widget_title: "Chat with us",
          widget_subtitle: "We usually respond in a few minutes",
          widget_icon: "default",
          auto_open: false,
          auto_open_delay: 5000,
          show_branding: true
        };
      case "facebook":
        return {
          page_id: "",
          page_name: "",
          welcome_message: "Hi there! How can I help you today?",
          auto_response: true,
          notification_email: ""
        };
      case "instagram":
        return {
          account_id: "",
          account_name: "",
          welcome_message: "Thanks for reaching out! How can I assist you?",
          auto_response: true,
          notification_email: ""
        };
      case "whatsapp":
        return {
          account_id: "",
          waba_name: "",
          business_name: "",
          phone_number: "",
          phone_number_id: "",
          welcome_message: "Thanks for reaching out! How can I assist you?",
          auto_response: true,
          notification_email: "",
        };
      case "telegram":
        return {
          channel: "",
          verified: false
        };
      default:
        return {};
    }
  };

  // Reset wizard state when modal is closed
  const handleClose = () => {
    setCurrentStep(1);
    setSelectedChannels(["chat-widget"]);
    onClose();
  };

  const isAgentLive = agent?.status === true;
  const buttonText = isAgentLive ? "Save Changes" : "Deploy";

  return (
    <Modal scrollBehavior="inside" isOpen={isOpen} onClose={handleClose} size="4xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900">Deploy Agent</h2>
              <p className="text-sm text-gray-600">
                Deploy this agent to make it available to users
              </p>
            </ModalHeader>
            <ModalBody>
              {isLoadingExtensions ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
                </div>
              ) : (
                <>
                  {/* {connectedExtensions.length === 0 && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> Only the Chat Widget is available by default. To deploy to other channels like Facebook or Instagram, 
                        you need to connect them first in the <a href="/extensions" className="text-brand underline">Extensions page</a>.
                      </p>
                    </div>
                  )} */}

                  {/* Deployment Wizard */}
                  <DeploymentWizard
                    agent={agent}
                    selectedChannels={selectedChannels}
                    setSelectedChannels={setSelectedChannels}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onConfigChange={setChannelConfigs}
                    connectedExtensions={connectedExtensions}
                    existingIntegrations={existingIntegrations}
                    isLoadingIntegrations={isLoadingIntegrations}
                    setChatType={setChatType}
                    chatType={chatType}
                  />
                </>
              )}

              {/* Agent Info */}
              {agent && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{agent.description}</p>
                  {/* Show additional details based on variant */}
                  {variant === "dropdown" && agent.status && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${agent.status === true ? "bg-green-500" : "bg-gray-500"}`}></span>
                      <p className="text-xs text-gray-500 capitalize">Status: {agent.status ? "Live" : "Draft"}</p>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
            <ModalFooter className={` ${currentStep === 1 ? 'justify-end' : 'justify-between'} flex w-full items-center`}>

              {currentStep === 2 && (
                <Button
                  variant="flat"
                  onPress={handlePrevious}
                  className="bg-gray-100"
                >
                  Previous
                </Button>
              )}

              {currentStep === 1 ? (
                <Button
                  className="bg-brand text-gray-900"
                  onPress={handleNext}
                  isDisabled={selectedChannels.length === 0}
                >
                  Next
                </Button>
              ) : (
                <Button
                  className="bg-brand text-gray-900"
                  onPress={handleDeploy}
                >
                  {buttonText}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default DeployAgentModal;
