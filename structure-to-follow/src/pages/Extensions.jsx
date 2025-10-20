import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button } from "@heroui/react";
import {
  Facebook,
  Instagram,
  Send,
  MessageCircle,
  Users2,
  Bell,
  X,
  Bot,
  Globe,
  LayoutGrid,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import XLogo from "../components/icons/XLogo";
import { useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { clientExtensionService, facebookService, integrationService, metaAuthService } from "../api/index.js";
import { UserDataContext } from "../context/UserDataContext";

// Import custom components
import PlatformCard from "../components/extensions/PlatformCard";
import WidgetExtension from "../components/extensions/WidgetExtension";
import FacebookExtension from "../components/extensions/FacebookExtension";
import InstagramExtension from "../components/extensions/InstagramExtension";
import RequestIntegrationModal from "../components/extensions/RequestIntegrationModal";
import Joyride from 'react-joyride';
import useTourController from '../Demo/utils/useTourController';
import { extensionsSteps } from '../Demo/Extensions/extensions.demo';
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip';
import TelegramExtension from "../components/extensions/TelegramExtension.jsx";
import WhatsAppLogo from "../components/icons/WhatsappLogo.jsx";
import WhatsappExtension from "../components/extensions/WhatsappExtension.jsx";
import { whatsappService } from "../api/services/meta/whatsapp.service.js";
import RequestEmailAndSmsIntegrationModal from "../components/extensions/EmailAndSmsRequestModal.jsx";

export default function Extensions() {
  // Get user data from context
  const { loggedInUser, userData } = useContext(UserDataContext);

  // State management
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRequestSmsAndEmailModalOpen, setIsRequestSmsAndEmailModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedPlatformRequest, setSelectedPlatformRequest] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientExtensions, setClientExtensions] = useState([]);

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("extensions", loggedInUser);


  // Platform data
  //here
  const [platforms, setPlatforms] = useState([
    {
      name: "Widget",
      icon: LayoutGrid,
      isConnected: true, // Widget is connected by default
      color: "#6366F1", // Indigo color
      features: [
        { name: "Chat Interface", icon: MessageCircle, available: true },
        { name: "User Tracking", icon: Users2, available: true },
        { name: "Website Integration", icon: Globe, available: true },
        { name: "Customization", icon: Bot, available: true },
      ],
      description: "Add a customizable AI chat widget to your website for customer support and engagement",
      connectedDescription: "Your Widget is active grab the embed code and add it to your website"
    },
    {
      name: "Facebook",
      icon: Facebook,
      isConnected: false, //here
      color: "#1877F2",
      // comingSoon: loggedInUser?.role == "God Mode" || loggedInUser?.role == "Tester" ? false : true, // Mark as coming soon
      comingSoon: false, // Mark as coming soon
      features: [
        { name: "Read Messages", icon: MessageCircle, available: true },
        { name: "Send Messages", icon: Send, available: true },
        { name: "User Information", icon: Users2, available: true },
        { name: "Notifications", icon: Bell, available: true },
      ],
      description: "Connect to Facebook Messenger to manage customer conversations directly from this platform",
      connectedDescription: "Your Facebook is connected. Go to Agents to deploy on Facebook",
      scopes: [
        "pages_messaging",
        "pages_read_engagement",
        "pages_manage_metadata",
        "pages_show_list",
        "business_management",
      ],
      // authUrl: `https://www.facebook.com/v14.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=pages_messaging,pages_read_engagement,pages_manage_metadata,pages_show_list&response_type=token`,
      authUrl: `https://www.facebook.com/v14.0/dialog/oauth?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=pages_messaging,pages_manage_metadata,pages_show_list&response_type=token`,
    },
    {
      name: "Instagram",
      icon: Instagram,
      isConnected: false,
      color: "#E4405F",
      // comingSoon: loggedInUser?.role == "God Mode" || loggedInUser?.role == "Tester" ? false : true, // Mark as coming soon
      comingSoon: false, // Mark as coming soon
      features: [
        { name: "Direct Messages", icon: MessageCircle, available: true },
        { name: "User Profile", icon: Users2, available: true },
        { name: "Notifications", icon: Bell, available: true },
      ],
      description: "Integrate with Instagram DMs to handle customer inquiries and messages in one place",
      connectedDescription: "Your Instagram is connected. Go to Agents to deploy on Instagram",
      scopes: [
        "instagram_basic",
        "instagram_manage_messages",
        "pages_messaging",
        "pages_manage_metadata",
        "pages_show_list",
        "business_management",
        "pages_read_engagement"
        // "instagram_manage_comments",
      ],
      authUrl: `https://api.instagram.com/oauth/authorize?client_id=YOUR_INSTAGRAM_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=instagram_basic,instagram_manage_messages,instagram_manage_comments&response_type=code`,
    },
    {
      name: "Whatsapp",
      icon: WhatsAppLogo,
      isConnected: false,
      color: "#32AB25",
      // comingSoon: loggedInUser?.role == "God Mode" || loggedInUser?.role == "Tester" ? false : true, // Mark as coming soon
      comingSoon: false, // Mark as coming soon
      features: [
        { name: "Direct Messages", icon: MessageCircle, available: true },
        { name: "User Profile", icon: Users2, available: true },
        { name: "Notifications", icon: Bell, available: true },
      ],
      description: "Integrate with Whatsapp DMs to handle customer inquiries and messages in one place",
      // description: this.comingSoon == false ? "Integrate with Whatsapp DMs to handle customer inquiries and messages in one place" : "hello mate",
      connectedDescription: "Your Whatsapp is connected. Go to Agents to deploy on Whatsapp",
      scopes: [
        "whatsapp_business_messaging",
        "whatsapp_business_management",
        "business_management"
      ],
      authUrl: `https://api.facebook.com/oauth/authorize?client_id=YOUR_INSTAGRAM_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=whatsapp_business_messaging,whatsapp_business_management,business_management&response_type=code`,
    },
    {
      name: "X",
      icon: XLogo,
      isConnected: false,
      color: "#000000",
      comingSoon: true,
      description: "Connect to X (formerly Twitter) to manage customer conversations and mentions",
    },
    {
      name: "Telegram",
      icon: Send,
      isConnected: false,
      color: "#0088cc",
      // comingSoon: false,
      // comingSoon: loggedInUser?.role == "God Mode" || loggedInUser?.role == "Tester" ? false : true,
      comingSoon: false,
      description: "Integrate with Telegram to handle customer inquiries and messages",
      connectedDescription: "Your Telegram is connected. Go to Agents to deploy on Telegram",
    },
    {
      name: "LinkedIn",
      icon: Users2,
      isConnected: false,
      color: "#0077b5",
      comingSoon: true,
      description: "Connect to LinkedIn to manage professional communications and leads",
    },
    {
      name: "Email",
      icon: MessageCircle,
      isConnected: false,
      color: "#D44638",
      comingSoon: true,
      description: "Integrate with email services to manage customer communications",
    },
    {
      name: "SMS",
      icon: MessageCircle,
      isConnected: false,
      color: "#4CAF50",
      comingSoon: true,
      description: "Connect SMS services to handle text message communications",
    }
  ]);

  // Fetch client extensions when component mounts
  useEffect(() => {
    // Fetch client extensions
    const fetchClientExtensions = async () => {
      if (!userData?.client_id) return;

      setIsLoading(true);
      try {
        const response = await clientExtensionService.getClientExtensionsByClientId(userData.client_id);

        if (response && !response.status) { // Check if response is successful (not an error)
          // console.log("Client extensions:", response);
          setClientExtensions(response);

          // If no client extensions exist, create one for widget
          if (response.length === 0) {
            //console.log("No client extensions found. Creating widget extension...");
            await createWidgetExtension(userData.client_id);
          } else {
            // Update platforms based on client extensions
            updatePlatformsConnectionStatus(response);
          }
        } else {
          console.error("Error fetching client extensions:", response);
          toast.error("Failed to fetch extensions");
        }
      } catch (error) {
        console.error("Error fetching client extensions:", error);
        toast.error("Failed to fetch extensions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientExtensions();

    // Check if there's a token in sessionStorage from the auth callback
    const checkForAuthToken = async () => {
      const token = sessionStorage.getItem('metaAuthToken');
      const platform = sessionStorage.getItem('metaAuthPlatform') || 'facebook';

      if (token && userData?.client_id) {
        //console.log('Found auth token in sessionStorage');
        toast.info(`Processing ${platform} authentication...`);

        // Clear the tokens from sessionStorage
        sessionStorage.removeItem('metaAuthToken');
        sessionStorage.removeItem('metaAuthPlatform');

        // Refresh client extensions to show the updated connection status
        await fetchClientExtensions();
      }
    };

    checkForAuthToken();
  }, [userData?.client_id, userData]);

  useEffect(() => {
    if (!loggedInUser && !userData) return;

    setPlatforms(prev =>
      prev.map(plat => {
        // only re-compute comingSoon for FB and IG
        // if (["Facebook", "Instagram", "Telegram"].includes(plat.name)) {
        if (["Whatsapp"].includes(plat.name)) {
          return {
            ...plat,
            // comingSoon: !["Tester", "God Mode"].includes(loggedInUser.role) && loggedInUser.client_id != "edd02a7c-a48b-46b5-a321-9efb400edb43",
            // comingSoon: !["Tester", "God Mode"].includes(loggedInUser.role),
            comingSoon: !["Tester", "God Mode"].includes(loggedInUser.role) && !["enterprise", "advanced"].includes(loggedInUser.account_type),
            // comingSoon: false,
          };
        }
        // everything else stays exactly as you initialized it
        return plat;
      })
    );
  }, [loggedInUser, userData]);


  // Create or update client extension for a platform -> NOT IN USE????????
  //NOTE: verify why not in use and if actually not in use Delete to clean  the code
  const createOrUpdateExtension = async (platformName, token) => {
    if (!userData?.client_id) {
      console.error('Client ID is required to create/update extension');
      return;
    }

    try {
      // First check if an extension already exists for this platform
      const existingExtension = clientExtensions.find(ext =>
        ext.extension_name?.toLowerCase() === platformName.toLowerCase()
      );

      if (existingExtension) {
        // Update the existing extension
        const updateData = {
          is_connected: true,
          connected_at: new Date().toISOString(),
          long_lived_token: token,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
        };

        const response = await clientExtensionService.updateClientExtension(
          existingExtension.client_extension_id,
          updateData
        );

        if (response && !response.status) {
          //console.log(`${platformName} extension updated:`, response);

          // Update client extensions state
          setClientExtensions(prev => {
            return prev.map(ext => {
              if (ext.client_extension_id === existingExtension.client_extension_id) {
                return response;
              }
              return ext;
            });
          });

          // Update platforms state
          setPlatforms(prevPlatforms =>
            prevPlatforms.map(p =>
              p.name.toLowerCase() === platformName.toLowerCase() ?
                { ...p, isConnected: true, extensionId: response.client_extension_id } :
                p
            )
          );

          return response;
        } else {
          throw new Error(response.message || `Failed to update ${platformName} extension`);
        }
      } else {
        // Create a new extension
        const extensionData = {
          client_id: userData.client_id,
          extension_name: platformName.toLowerCase(),
          extension_id: getExtensionId(platformName), // Use the fixed extension ID
          is_connected: true,
          connected_at: new Date().toISOString(),
          long_lived_token: token,
          token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
        };

        const response = await clientExtensionService.createClientExtension(extensionData);

        if (response && !response.status) {
          //console.log(`${platformName} extension created:`, response);

          // Add the new extension to the state
          setClientExtensions(prev => [...prev, response]);

          // Update platforms state
          setPlatforms(prevPlatforms =>
            prevPlatforms.map(p =>
              p.name.toLowerCase() === platformName.toLowerCase() ?
                { ...p, isConnected: true, extensionId: response.client_extension_id } :
                p
            )
          );

          return response;
        } else {
          throw new Error(response.message || `Failed to create ${platformName} extension`);
        }
      }
    } catch (error) {
      console.error(`Error creating/updating ${platformName} extension:`, error);
      toast.error(`Error connecting ${platformName}: ${error.message}`);
      throw error;
    }
  };

  // Create widget extension if it doesn't exist
  const createWidgetExtension = async (clientId) => {
    try {
      // For widgets, client_id is optional
      const widgetExtensionData = {
        extension_name: "widget",
        extension_id: getExtensionId("widget"), // Use the fixed extension ID
        is_connected: true,
        connected_at: new Date().toISOString()
      };

      // Add client_id if available
      if (clientId) {
        widgetExtensionData.client_id = clientId;
      }

      const response = await clientExtensionService.createClientExtension(widgetExtensionData);

      if (response && !response.status) { // Check if response is successful (not an error)
        //console.log("Widget extension created:", response);
        toast.success("Widget extension connected successfully");

        // Add the new extension to the state
        setClientExtensions(prev => [...prev, response]);

        // Update platforms to show widget as connected
        updatePlatformsConnectionStatus([response]);
      } else {
        console.error("Error creating widget extension:", response);
        toast.error("Failed to connect widget extension");
      }
    } catch (error) {
      console.error("Error creating widget extension:", error);
      toast.error("Failed to connect widget extension");
    }
  };

  // Get extension ID based on platform name
  const getExtensionId = (platformName) => {
    switch (platformName.toLowerCase()) {
      case 'facebook':
        return '9e9de118-8aa5-408a-960c-74074c66cd8e';
      case 'instagram':
        return 'c32aeec7-50d7-4469-99a5-4235870d16a7';
      case 'widget':
        return '38b88988-58ce-4f49-b2ca-412bd8fa4b0f';
      case 'telegram':
        return '3c375262-ff82-45b5-b72b-ec05c215e36f';
      case 'whatsapp':
        return 'a2a83703-8c62-4216-b94d-9ecfdfc32438';
      default:
        return null;
    }
  };

  // Update platforms connection status based on client extensions
  //here
  // const updatePlatformsConnectionStatus = (extensions) => {
  //   setPlatforms(prevPlatforms => {
  //     return prevPlatforms.map(platform => {
  //       // Get the expected extension ID for this platform
  //       const expectedExtensionId = getExtensionId(platform.name);

  //       // Find if there's a matching extension for this platform
  //       const matchingExtension = extensions.find(ext =>
  //         (ext.extension_name?.toLowerCase() === platform.name.toLowerCase()) ||
  //         (ext.extension_id === expectedExtensionId)
  //       );

  //       // Update the connection status if a matching extension is found
  //       if (matchingExtension) {
  //         console.log(`Found matching extension for ${platform.name}:`, matchingExtension);
  //         return {
  //           ...platform,
  //           isConnected: matchingExtension.is_connected === true, // Ensure boolean value
  //           extensionId: matchingExtension.client_extension_id, // This is the client_extension_id, not the client_id
  //         };
  //       }

  //       return platform;
  //     });
  //   });
  // };

  const updatePlatformsConnectionStatus = (extensions) => {
    setPlatforms(prevPlatforms => {
      return prevPlatforms.map(platform => {
        const expectedExtensionId = getExtensionId(platform.name);

        const matchingExtension = extensions.find(ext =>
          (ext.extension_name?.toLowerCase() === platform.name.toLowerCase()) ||
          (ext.extension_id === expectedExtensionId)
        );

        if (matchingExtension) {
          return {
            ...platform,
            isConnected: matchingExtension.is_connected === true,
            extensionId: matchingExtension.client_extension_id,
          };
        }

        // If not found, ensure it's disconnected
        return {
          ...platform,
          isConnected: false,
          extensionId: null,
        };
      });
    });
  };


  // Event handlers
  const handleConnectClick = (platform) => {
    const selectedPlatform = platforms.find((p) => p.name === platform);
    // Allow Widget to be connected
    if (selectedPlatform && selectedPlatform.name === "Widget") {
      setSelectedPlatform(selectedPlatform);
      setCurrentStep(1);
      setIsDrawerOpen(true);
    } else if (selectedPlatform && !selectedPlatform.comingSoon) {
      // For other platforms, only allow if not coming soon
      setSelectedPlatform(selectedPlatform);
      setCurrentStep(1);
      setIsDrawerOpen(true);
    }
  };

  const handleCardClick = (platform) => {
    // Allow clicking on Widget even when connected
    if (platform.name === "Widget") {
      setSelectedPlatform(platform);
      setCurrentStep(1);
      setIsDrawerOpen(true);
    } else if (!platform.comingSoon && !platform.isConnected) {
      // For other platforms, only allow if not coming soon and not connected
      setSelectedPlatform(platform);
      setCurrentStep(1);
      setIsDrawerOpen(true);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Handle successful authentication from MetaAuthComponent
  const handleAuthSuccess = (response) => {
    //console.log(`${response.extension_name} extension created/updated:`, response);
    toast.success(`${response.extension_name} connected successfully`);

    // Update or add the extension to the state
    setClientExtensions(prev => {
      // Check if this extension already exists in our state
      const existingIndex = prev.findIndex(ext =>
        ext.client_extension_id === response.client_extension_id
      );

      if (existingIndex >= 0) {
        // Update existing extension
        const newExtensions = [...prev];
        newExtensions[existingIndex] = response;
        return newExtensions;
      } else {
        // Add new extension
        return [...prev, response];
      }
    });

    // Update platforms state
    setPlatforms(prevPlatforms =>
      prevPlatforms.map(p =>
        p.name.toLowerCase() === response.extension_name?.toLowerCase() ?
          { ...p, isConnected: response.is_connected === true, extensionId: response.client_extension_id } :
          p
      )
    );

    // Close the drawer after a short delay
    setTimeout(() => {
      setIsDrawerOpen(false);
    }, 2000);
  };

  // Handle authentication failure from MetaAuthComponent
  const handleAuthFailure = (error) => {
    console.error(`Authentication failed:`, error);
    toast.error(`Failed to connect: ${error}`);
  };

  const handleFinalConnect = async () => {
    if (selectedPlatform?.name === "Widget") {
      // For widget, create or update the widget extension
      if (userData?.client_id) {
        const widgetPlatform = platforms.find(p => p.name === "Widget");

        if (widgetPlatform && widgetPlatform.extensionId) {
          // Update existing widget extension
          const updateData = {
            is_connected: true,
            connected_at: new Date().toISOString()
          };

          const response = await clientExtensionService.updateClientExtension(widgetPlatform.extensionId, updateData);

          if (response && !response.status) {
            //console.log("Widget extension updated:", response);
            toast.success("Widget extension updated successfully");

            // Update platforms state
            setPlatforms(prevPlatforms =>
              prevPlatforms.map(p =>
                p.name === "Widget" ? { ...p, isConnected: true } : p
              )
            );
          } else {
            console.error("Error updating widget extension:", response);
            toast.error("Failed to update widget extension");
          }
        } else {
          // Create new widget extension
          await createWidgetExtension(userData.client_id);
        }
      }

      closeDrawer();
    } else {
      // For Facebook and Instagram, the authentication is handled by the MetaAuthComponent
      // in the respective extension components, so we don't need to do anything here
      // The drawer will be closed after successful authentication by the handleAuthSuccess callback
    }
  };

  const handleRefresh = async (platformName) => {
    try {
      // Find the platform and its extension ID
      const platform = platforms.find(p => p.name === platformName);
      if (!platform || !platform.extensionId) {
        toast.error(`Cannot refresh ${platformName}: Extension not found`);
        return;
      }

      //console.log(`Refreshing token for ${platformName} with extension ID: ${platform.extensionId}`);

      // Update the extension with a new token expiry date (60 days from now)
      const updateData = {
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days from now
      };

      const response = await clientExtensionService.updateClientExtension(platform.extensionId, updateData);

      if (response && !response.status) { // Check if response is successful (not an error)
        //console.log(`${platformName} token refreshed:`, response);
        toast.success(`${platformName} token refreshed successfully!`);
      } else {
        console.error(`Failed to refresh ${platformName} token:`, response);
        toast.error(`Failed to refresh ${platformName} token`);
      }
    } catch (error) {
      console.error(`Error refreshing token for ${platformName}:`, error);
      toast.error(`Error refreshing token for ${platformName}`);
    }
  };

  const handleDisconnect = async (platformName) => {
    //console.log("I'm  disconnecting");
    //console.log(platformName);
    try {
      // Find the platform and its extension ID
      const platform = platforms.find(p => p.name === platformName);
      if (!platform || !platform.extensionId) {
        toast.error(`Cannot disconnect ${platformName}: Extension not found`);
        return;
      }

      //console.log(`Disconnecting ${platformName} with extension ID: ${platform.extensionId}`);

      // For the widget, we just update it to disconnected instead of deleting
      if (platformName === "Widget") {
        const updateData = {
          is_connected: false,
          connected_at: null
        };

        const response = await clientExtensionService.updateClientExtension(platform.extensionId, updateData);

        if (response && !response.status) { // Check if response is successful (not an error)
          //console.log(`${platformName} disconnected:`, response);
          toast.success(`${platformName} disconnected successfully`);

          // Update platforms state
          setPlatforms(prevPlatforms =>
            prevPlatforms.map(p =>
              p.name === platformName ? { ...p, isConnected: false } : p
            )
          );

          // Update client extensions state
          setClientExtensions(prev => {
            return prev.map(ext => {
              if (ext.client_extension_id === platform.extensionId) {
                return { ...ext, is_connected: false };
              }
              return ext;
            });
          });
        } else {
          console.error(`Failed to disconnect ${platformName}:`, response);
          toast.error(`Failed to disconnect ${platformName}`);
        }
      } else {
        // For Facebook and Instagram, we update to disconnected instead of deleting
        const updateData = {
          is_connected: false,
          connected_at: null,
          long_lived_token: null,
          token_expires_at: null
        };
        let longLivedTokenToUnsubscribe
        let pagesIds
        try {
          const clientExtensions = await clientExtensionService.getClientExtensionsByClientId(userData.client_id)
          if (platformName == "Facebook") {
            const faceExtension = clientExtensions.find(extension =>
              extension.extension_id === '9e9de118-8aa5-408a-960c-74074c66cd8e'
            );
            longLivedTokenToUnsubscribe = faceExtension.long_lived_token
            pagesIds = faceExtension.page_ids
          } else if (platformName == "Instagram") {
            const instaExtension = clientExtensions.find(extension =>
              extension.extension_id === 'c32aeec7-50d7-4469-99a5-4235870d16a7'
            );
            longLivedTokenToUnsubscribe = instaExtension.long_lived_token
            pagesIds = instaExtension.page_ids
          } else if (platformName == "Whatsapp") {
            const whatsappExtension = clientExtensions.find(extension =>
              extension.extension_id === 'a2a83703-8c62-4216-b94d-9ecfdfc32438'
            );
            longLivedTokenToUnsubscribe = whatsappExtension.long_lived_token
            pagesIds = whatsappExtension.page_ids
          }
        } catch (error) {
          console.log("Failed to fetch client extensions: ", error);
        }
        const response = await clientExtensionService.updateClientExtension(platform.extensionId, updateData);
        if (response && !response.status) { // Check if response is successful (not an error)
          //console.log(`${platformName} disconnected:`, response);
          toast.success(`${platformName} disconnected successfully`);

          // Update platforms state
          setPlatforms(prevPlatforms =>
            prevPlatforms.map(p =>
              p.name === platformName ? { ...p, isConnected: false } : p
            )
          );

          // Update client extensions state
          setClientExtensions(prev => {
            return prev.map(ext => {
              if (ext.client_extension_id === platform.extensionId) {
                return { ...ext, is_connected: false, long_lived_token: null, token_expires_at: null };
              }
              return ext;
            });
          });
        } else {
          console.error(`Failed to disconnect ${platformName}:`, response);
          toast.error(`Failed to disconnect ${platformName}`);
        }

        //here
        try {
          if (platformName == "Facebook") {
            //here 
            for (const page of pagesIds) {
              try {
                const pageUnsub = await metaAuthService.unsubscribePage(longLivedTokenToUnsubscribe, page.id);
                console.log(`Unsubscribed page ${page.id} successfully`);
              } catch (error) {
                console.error(`Failed to unsubscribe page ${page.id}:`, error);
              }
            }
            //unsubscribe
            const clientIntegration = await integrationService.getIntegrationsByClientId(userData.client_id)
            //console.log("clientIntegration", clientIntegration);
            // find the first integration whose `integration_type` array contains { type: 'facebook' }
            const fbIntegration = clientIntegration.filter(integration =>
              integration.integration_type.some(t => t.type === 'facebook')
            );

            if (!fbIntegration) {
              console.log('No Facebook integration found for this client.');
            } else {
              //console.log(`Found ${fbIntegration.length} Facebook integration(s):`, fbIntegration);

              // Option A: sequentially
              for (const integration of fbIntegration) {
                await integrationService.deleteIntegration(integration.integration_id);
                //console.log(`Deleted integration ${integration.integration_id}`);
              }
            }
          } else if (platformName == "Instagram") {
            //here 
            for (const page of pagesIds) {
              try {
                const pageUnsub = await metaAuthService.unsubscribePage(longLivedTokenToUnsubscribe, page.id);
                console.log(`Unsubscribed page ${page.id} successfully`);
              } catch (error) {
                console.error(`Failed to unsubscribe page ${page.id}:`, error);
              }
            }
            //unsubscribe
            const clientIntegration = await integrationService.getIntegrationsByClientId(userData.client_id)
            //console.log("clientIntegration", clientIntegration);
            // find the first integration whose `integration_type` array contains { type: 'facebook' }
            const igIntegration = clientIntegration.filter(integration =>
              integration.integration_type.some(t => t.type === 'instagram')
            );

            if (!igIntegration) {
              console.log('No instagram integration found for this client.');
            } else {
              //console.log(`Found ${igIntegration.length} instagram integration(s):`, igIntegration);

              // Option A: sequentially
              for (const integration of igIntegration) {
                await integrationService.deleteIntegration(integration.integration_id);
                //console.log(`Deleted integration ${integration.integration_id}`);
              }
            }
          } else if (platformName == "Telegram") {
            const clientIntegration = await integrationService.getIntegrationsByClientId(userData.client_id)
            //console.log("clientIntegration", clientIntegration);
            // find the first integration whose `integration_type` array contains { type: 'facebook' }
            const tgIntegration = clientIntegration.filter(integration =>
              integration.integration_type.some(t => t.type === 'telegram')
            );

            if (!tgIntegration) {
              console.log('No telegram integration found for this client.');
            } else {
              //console.log(`Found ${tgIntegration.length} telegram integration(s):`, tgIntegration);

              // Option A: sequentially
              for (const integration of tgIntegration) {
                await integrationService.deleteIntegration(integration.integration_id);
                //console.log(`Deleted integration ${integration.integration_id}`);
              }
            }
          } else if (platformName == "Whatsapp") {
            const clientIntegration = await integrationService.getIntegrationsByClientId(userData.client_id)
            //console.log("clientIntegration", clientIntegration);
            // find the first integration whose `integration_type` array contains { type: 'facebook' }
            const wtIntegration = clientIntegration.filter(integration =>
              integration.integration_type.some(t => t.type === 'whatsapp')
            );

            if (!wtIntegration) {
              console.log('No whatsapp integration found for this client.');
            } else {
              //console.log(`Found ${wtIntegration.length} whatsapp integration(s):`, wtIntegration);

              // Option A: sequentially
              for (const integration of wtIntegration) {
                await integrationService.deleteIntegration(integration.integration_id);
                //console.log(`Deleted integration ${integration.integration_id}`);
              }
              for (const page of pagesIds) {
                try {
                  const pageUnsub = await whatsappService.unsubscribeWhatsappNumber(longLivedTokenToUnsubscribe, page.business_account_id);
                  //console.log(`Unsubscribed page ${page.id} successfully`);
                } catch (error) {
                  console.error(`Failed to unsubscribe page ${page.id}:`, error);
                }
              }
            }
          }
        } catch (error) {

        }
      }
    } catch (error) {
      console.error(`Error disconnecting ${platformName}:`, error);
      toast.error(`Error disconnecting ${platformName}`);
    }
  };

  // Render platform cards
  const renderPlatformCards = () => {
    return platforms.map((platform) => (
      <PlatformCard
        key={platform.name}
        platform={platform}
        onCardClick={handleCardClick}
        onConnectClick={handleConnectClick}
        onRefreshClick={handleRefresh}
        onDisconnectClick={handleDisconnect}
        setIsRequestModalOpen={setIsRequestModalOpen}
        setSelectedPlatformRequest={setSelectedPlatformRequest}
        setIsRequestSmsAndEmailModalOpen={setIsRequestSmsAndEmailModalOpen}
      />
    ));
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={extensionsSteps}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
        <div className="welcome">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Integrations
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your social media accounts and add widgets to your website
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-brand/10 border border-brand/20 rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-brand rounded-full"></span>
            <span className="text-sm font-medium text-gray-900">
              {platforms.filter((p) => p.isConnected).length} of{" "}
              {platforms.length} Connected
            </span>
          </div>
        </div>
      </div>

      {/* Integration Request Banner */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Bot className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Need a custom integration?</h3>
            <p className="text-sm text-gray-600">Request a new platform integration for your business needs</p>
          </div>
        </div>
        <Button
          className="bg-green-600 text-white hover:bg-green-700 transition-colors request"
          onPress={() => setIsRequestModalOpen(true)}
        >
          Request Integration
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
        </div>
      ) : (
        /* Platform Cards */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 conect">
          {renderPlatformCards()}
        </div>
      )}

      {/* Integration Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        placement="right"
        size="md"
      >
        <DrawerContent>
          {selectedPlatform && (
            <>
              <DrawerHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${selectedPlatform.color}20` }}
                    >
                      <selectedPlatform.icon
                        className="w-5 h-5"
                        style={{ color: selectedPlatform.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Connect {selectedPlatform.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedPlatform.name === "Widget" || selectedPlatform.name === "Telegram" ? "" : `Step ${currentStep} of 3`}
                      </p>
                    </div>
                  </div>
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={closeDrawer}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </DrawerHeader>

              <DrawerBody className="py-6">
                {selectedPlatform.name === "Widget" ? (
                  <WidgetExtension
                    onAgentSelect={setSelectedAgent}
                  />
                ) : selectedPlatform.name === "Facebook" ? (
                  <FacebookExtension
                    platform={selectedPlatform}
                    currentStep={currentStep}
                    onAuthSuccess={handleAuthSuccess}
                    onAuthFailure={handleAuthFailure}
                  />
                ) : selectedPlatform.name === "Instagram" ? (
                  <InstagramExtension
                    platform={selectedPlatform}
                    currentStep={currentStep}
                    onAuthSuccess={handleAuthSuccess}
                    onAuthFailure={handleAuthFailure}
                  />
                ) : selectedPlatform.name === "Whatsapp" ? (
                  <WhatsappExtension
                    platform={selectedPlatform}
                    currentStep={currentStep}
                    onAuthSuccess={handleAuthSuccess}
                    onAuthFailure={handleAuthFailure}
                  />
                ) : selectedPlatform.name === "Telegram" ? (
                  <TelegramExtension
                    platform={selectedPlatform}
                    onConnected={(newExtensions) => updatePlatformsConnectionStatus(newExtensions)}
                  />)
                  : null}
              </DrawerBody>

              <DrawerFooter className="border-t border-gray-100 px-6 py-4">
                <div className="flex justify-between w-full">
                  {selectedPlatform.name === "Widget" ? (
                    <>
                      <Button
                        variant="light"
                        onPress={closeDrawer}
                      >
                        Close
                      </Button>
                      {selectedAgent && (
                        <Button
                          className="bg-brand text-gray-900"
                          onPress={handleFinalConnect}
                        >
                          Done
                        </Button>
                      )}
                    </>
                  ) : selectedPlatform.name === "Telegram" ? (
                    <>
                      <Button
                        variant="light"
                        onPress={closeDrawer}
                      >
                        Close
                      </Button>

                      <Button
                        className="bg-brand text-gray-900"
                        onPress={closeDrawer}
                      >
                        Done
                      </Button>

                    </>
                  ) : (
                    <>
                      {currentStep > 1 ? (
                        <Button
                          variant="light"
                          onPress={prevStep}
                          startContent={<ArrowLeft className="w-4 h-4" />}
                        >
                          Back
                        </Button>
                      ) : (
                        <Button
                          variant="light"
                          onPress={closeDrawer}
                        >
                          Cancel
                        </Button>
                      )}

                      {currentStep < 3 ? (
                        <Button
                          className="bg-brand text-gray-900"
                          onPress={nextStep}
                          endContent={<ArrowRight className="w-4 h-4" />}
                        >
                          Next
                        </Button>
                      ) : (
                        // <Button
                        //   className="bg-brand text-gray-900"
                        //   onPress={handleFinalConnect}
                        //   endContent={<ArrowRight className="w-4 h-4" />}
                        // >
                        //   Connect
                        // </Button>
                        null
                      )}
                    </>
                  )}
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Request Integration Modal */}
      <RequestIntegrationModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        platforms={platforms}
      />

      <RequestEmailAndSmsIntegrationModal
        isOpen={isRequestSmsAndEmailModalOpen}
        onClose={() => setIsRequestSmsAndEmailModalOpen(false)}
        platforms={platforms}
        selectedPlatform={selectedPlatformRequest}
      />
    </div>
  );
}
