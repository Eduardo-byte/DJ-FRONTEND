import React, { useState, useEffect, useMemo } from "react";
import { facebookService, instagramService } from "../api/services/meta";
import {
    Accordion,
    AccordionItem,
    Checkbox,
    CheckboxGroup,
    Input,
    Textarea,
    Switch,
    cn,
    RadioGroup,
    useRadio,
    VisuallyHidden,
    Button
} from "@heroui/react";
import {
    Globe,
    Facebook,
    Instagram,
    Send as Telegram,
    Linkedin,
    Mail,
    MessageSquare,
    Users,
    Clock,
    ClipboardIcon
} from "lucide-react";
import XLogo from "./icons/XLogo";
import { toast } from "sonner";
import { integrationService } from "../api";
import { copyToClipboard, generateTelegramRefCode, normalizeTelegramRef, verifyTelegram } from "./telegramUtils/utils";

//this is just to go live 
//delete after scheduling is completed
//and check the comments under => renderChannelConfigForm
export const CustomRadio = (props) => {
    const {
        Component,
        children,
        isSelected,
        description,
        getBaseProps,
        getWrapperProps,
        getInputProps,
        getLabelProps,
        getLabelWrapperProps,
        getControlProps,
    } = useRadio(props);

    return (
        <div className="border-2 border-default rounded-lg p-2 flex flex-col justify-center items-center">
            <Component
                {...getBaseProps()}
                className={cn(
                    "group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse tap-highlight-transparent",
                    "max-w-[200px] cursor-pointer gap-4 p-2",
                    "data-[selected=true]:border-primary"
                )}
            >
                <div className="flex flex-col justify-center items-center gap-2">
                    <img
                        src={props.img_path}
                        alt="widget image"
                        style={{
                            width: "100px",
                            height: "100px",
                            display: "block",
                        }}
                    />
                    <div className="group inline-flex items-center hover:opacity-70 active:opacity-50 justify-between flex-row-reverse gap-4">
                        <VisuallyHidden>
                            <input {...getInputProps()} />
                        </VisuallyHidden>
                        <span {...getWrapperProps()}>
                            <span {...getControlProps()} />
                        </span>
                        <div {...getLabelWrapperProps()}>
                            {children && <span {...getLabelProps()}>{children}</span>}
                            {description && (
                                <span className="text-small text-foreground opacity-70">
                                    {description}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Component>
        </div>
    );
};

// Custom Channel Checkbox component
const CustomChannelCheckbox = ({ channel, value }) => {
    return (
        <Checkbox
            aria-label={channel.name}
            classNames={{
                base: cn(
                    "inline-flex max-w-md w-full bg-content1 m-0",
                    "hover:bg-content2 items-center justify-start",
                    "cursor-pointer rounded-lg gap-2 p-4 border-1 border-solid border-black/20",
                    "data-[selected=true]:border-brand ",
                    !channel.available && "opacity-60 cursor-not-allowed"
                ),
                label: "w-full",
            }}
            value={value}
            isDisabled={!channel.available}
        >
            <div className="w-full flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand/10">
                    {channel.icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                    {!channel.available && channel.comingSoon && (
                        <p className="text-xs text-gray-500">Coming Soon</p>
                    )}
                    {!channel.available && channel.notConnected && (
                        <p className="text-xs text-yellow-600">Not Connected</p>
                    )}
                </div>
            </div>
        </Checkbox>
    );
};

const DeploymentWizard = ({
    agent,
    onChannelsSelected,
    selectedChannels,
    setSelectedChannels,
    currentStep,
    setCurrentStep,
    onConfigChange,
    setChatType,
    chatType,
    connectedExtensions = [],
    existingIntegrations = [],
    isLoadingIntegrations = false
}) => {
    // State for channel configurations and API data
    const [channelConfigs, setChannelConfigs] = useState({
        "chat-widget": {
            widget_style: "classic", // classic, modern, popup
            widget_position: "bottom-right",
            position_offset: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0
            },
            notification_email: "",
            availability: {
                is_24_7: true,
                schedule: [
                    { day: "Monday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Tuesday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Wednesday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Thursday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Friday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Saturday", enabled: false, start_time: "09:00", end_time: "17:00" },
                    { day: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" }
                ]
            }
        },
        "facebook": {
            page_id: "",
            page_name: "",
            welcome_message: "Hi there! How can I help you today?",
            auto_response: true,
            notification_email: "",
            availability: {
                is_24_7: true,
                schedule: [
                    { day: "Monday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Tuesday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Wednesday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Thursday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Friday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Saturday", enabled: false, start_time: "09:00", end_time: "17:00" },
                    { day: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" }
                ]
            }
        },
        "instagram": {
            account_id: "",
            account_name: "",
            welcome_message: "Thanks for reaching out! How can I assist you?",
            auto_response: true,
            notification_email: "",
            availability: {
                is_24_7: true,
                schedule: [
                    { day: "Monday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Tuesday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Wednesday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Thursday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Friday", enabled: true, start_time: "09:00", end_time: "17:00" },
                    { day: "Saturday", enabled: false, start_time: "09:00", end_time: "17:00" },
                    { day: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" }
                ]
            }
        },
        "telegram": {
            channel: "",
            verified: false
        },
    });

    // State for Facebook pages and Instagram accounts
    const [facebookPages, setFacebookPages] = useState([]);
    const [instagramAccounts, setInstagramAccounts] = useState([]);
    const [isLoadingPages, setIsLoadingPages] = useState(false);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    const [telegramRef, setTelegramRef] = useState(agent.ref_code_telegram || "");
    const [isVerified, setIsVerified] = useState(false);
    const [telegramError, setTelegramError] = useState("");

    const handleGenerateTelegramCode = async () => {
        try {
            const code = await generateTelegramRefCode(agent);
            setTelegramRef(code);
            setIsVerified(false);
        } catch (err) {
            toast.error("Could not generate telegram code");
            console.error(err);
        }
    };

    const handleCopyTelegramCode = () => {
        copyToClipboard(telegramRef, () => toast.success("refcode copied to clipboard"));
    };

    const handleVerifyTelegram = async () => {
        try {
            const cleanCode = normalizeTelegramRef(telegramRef);
            const verified = await verifyTelegram(cleanCode);
            if (verified) {
                setIsVerified(verified.verified)
                handleConfigChange("telegram", "verified", verified.verified);
                handleConfigChange("telegram", "channel", verified.pageId)
            } else {
                setIsVerified(false)
                setTelegramError("Verification failed — please try again, we cannot verify your channel.");
            }
        } catch (error) {
            console.log(error);
            setIsVerified(false)
            setTelegramError("Verification failed — please try again, we cannot verify your channel.");
        }
    }

    // Update parent component when configurations change
    useEffect(() => {
        if (onConfigChange) {
            onConfigChange(channelConfigs);
        }
    }, [channelConfigs, onConfigChange]);

    // Handle input change for a specific channel and field
    const handleConfigChange = (channel, field, value) => {
        setChannelConfigs(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                [field]: value
            }
        }));
    };

    // Handle availability change for a specific channel
    const handleAvailabilityChange = (channel, is24_7) => {
        setChannelConfigs(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                availability: {
                    ...prev[channel].availability,
                    is_24_7: is24_7
                }
            }
        }));
    };

    // Handle schedule change for a specific channel and day
    const handleScheduleChange = (channel, dayIndex, field, value) => {
        setChannelConfigs(prev => {
            const newSchedule = [...prev[channel].availability.schedule];
            newSchedule[dayIndex] = {
                ...newSchedule[dayIndex],
                [field]: value
            };

            return {
                ...prev,
                [channel]: {
                    ...prev[channel],
                    availability: {
                        ...prev[channel].availability,
                        schedule: newSchedule
                    }
                }
            };
        });
    };

    // Helper function to check if a page/account is already in use by another agent
    const isPageInUse = (pageId) => {
        if (!existingIntegrations || existingIntegrations.length === 0) return false;

        // Check if there's an active integration with this page_id
        return existingIntegrations.some(integration =>
            integration.page_id === pageId &&
            integration.status === true &&
            (agent ? integration.chat_id !== agent.id : true) // Exclude current agent if editing
        );
    };

    // Helper function to check if an account is already in use by another agent
    const isAccountInUse = (accountId) => {
        if (!existingIntegrations || existingIntegrations.length === 0) return false;

        // Check if there's an active integration with this account_id in integration_details
        return existingIntegrations.some(integration => {
            try {
                const details = integration.integration_details;
                return details &&
                    details.account_id === accountId &&
                    integration.status === true &&
                    (agent ? integration.chat_id !== agent.id : true); // Exclude current agent if editing
            } catch (e) {
                return false;
            }
        });
    };

    // Fetch Facebook pages when Facebook is selected
    useEffect(() => {
        const fetchFacebookPages = async () => {
            //uncomment this if you want to fetch  only after user selects the channels
            if (!selectedChannels.includes("facebook")) return;

            // Find Facebook extension
            const facebookExtension = connectedExtensions.find(ext =>
                ext.extension_name?.toLowerCase() === "facebook" ||
                ext.extension_id === "9e9de118-8aa5-408a-960c-74074c66cd8e"
            );

            if (!facebookExtension || !facebookExtension.long_lived_token) {
                console.error("Facebook extension not found or missing token");
                return;
            }

            setIsLoadingPages(true);
            try {
                const response = await facebookService.getPages(facebookExtension.long_lived_token);

                if (response.success && response.pages && response.pages.length > 0) {
                    //console.log("Facebook pages:", response.pages);

                    // Add a flag to indicate if the page is already in use
                    const pagesWithUsageInfo = response.pages.map(page => ({
                        ...page,
                        inUse: isPageInUse(page.id)
                    }));

                    setFacebookPages(pagesWithUsageInfo);

                    // Filter available pages 
                    const availablePages = pagesWithUsageInfo.filter(page => !page.inUse);

                    // If there are available pages and no page is selected yet, select the first one
                    if (availablePages.length > 0 &&
                        (!channelConfigs.facebook?.page_id || channelConfigs.facebook.page_id === "")) {
                        handleConfigChange("facebook", "page_id", availablePages[0].id);
                        handleConfigChange("facebook", "page_name", availablePages[0].name);
                    }
                } else {
                    console.error("Error fetching Facebook pages:", response);
                }
            } catch (error) {
                console.error("Error fetching Facebook pages:", error);
            } finally {
                setIsLoadingPages(false);
            }
        };

        fetchFacebookPages();
    }, [selectedChannels, connectedExtensions, existingIntegrations, agent]);

    // Fetch Instagram accounts when Instagram is selected
    useEffect(() => {
        const fetchInstagramAccounts = async () => {
            //uncomment this if you want to fetch  only after user selects the channels
            if (!selectedChannels.includes("instagram")) return;

            // Find Instagram extension
            //here
            const instagramExtension = connectedExtensions.find(ext =>
                ext.extension_name?.toLowerCase() === "instagram" ||
                ext.extension_id === "c32aeec7-50d7-4469-99a5-4235870d16a7"
            );

            if (!instagramExtension || !instagramExtension.long_lived_token) {
                console.error("Instagram extension not found or missing token");
                return;
            }

            setIsLoadingAccounts(true);
            try {
                // First get Facebook pages
                const pagesResponse = await facebookService.getPages(instagramExtension.long_lived_token);

                if (!pagesResponse.success || !pagesResponse.pages || pagesResponse.pages.length === 0) {
                    console.error("No Facebook pages found for Instagram accounts");
                    setIsLoadingAccounts(false);
                    return;
                }

                // Check all pages for Instagram accounts
                let allAccounts = [];

                for (const page of pagesResponse.pages) {
                    try {
                        const accountsResponse = await instagramService.getAccounts(
                            instagramExtension.long_lived_token,
                            page.id
                        );
                        // console.log("accountsResponse:", accountsResponse);
                        if (accountsResponse.success &&
                            accountsResponse.instagramAccounts &&
                            accountsResponse.instagramAccounts.length > 0) {
                            // Add page info to each account for reference
                            const accountsWithPageInfo = accountsResponse.instagramAccounts.map(account => ({
                                ...account,
                                pageId: page.id,
                                pageName: page.name,
                                inUse: isAccountInUse(account.id)
                            }));

                            allAccounts = [...allAccounts, ...accountsWithPageInfo];
                        }
                    } catch (err) {
                        console.error(`Error checking Instagram accounts for page ${page.name}:`, err);
                    }
                }

                if (allAccounts.length > 0) {
                    // console.log("Instagram accounts:", allAccounts);
                    setInstagramAccounts(allAccounts);

                    // Filter available accounts 
                    const availableAccounts = allAccounts.filter(account => !account.inUse);

                    // If there are available accounts and no account is selected yet, select the first one
                    if (availableAccounts.length > 0 &&
                        (!channelConfigs.instagram?.account_id || channelConfigs.instagram.account_id === "")) {
                        handleConfigChange("instagram", "account_id", availableAccounts[0].id);
                        handleConfigChange("instagram", "account_name", availableAccounts[0].username);
                    }
                } else {
                    console.error("No Instagram accounts found");
                }
            } catch (error) {
                console.error("Error fetching Instagram accounts:", error);
            } finally {
                setIsLoadingAccounts(false);
            }
        };

        fetchInstagramAccounts();
    }, [selectedChannels, connectedExtensions, existingIntegrations, agent]);

    // Fetch Telegram refCode when telegram is selected
    useEffect(() => {
        const fetchTelegramRefCode = async () => {
            //uncomment this if you want to fetch  only after user selects the channels
            if (!selectedChannels.includes("telegram")) return;

            // Find Instagram extension
            //here
            const telegramExtension = connectedExtensions.find(ext =>
                ext.extension_name?.toLowerCase() === "telegram" ||
                ext.extension_id === "3c375262-ff82-45b5-b72b-ec05c215e36f"
            );

            if (!telegramExtension || !telegramExtension.is_connected) {
                console.error("Telegram extension not found or is  not active");
                return;
            }

            setIsLoadingAccounts(true);
            try {
                // First get Facebook pages
                const FetchTelegramIntegrationsByAgentId = await integrationService.getIntegrationsByAgentId(agent.id);
                const telegramIntegration = FetchTelegramIntegrationsByAgentId.find(
                    integ => integ.integration_type[0]?.type === "telegram"
                );
                if (telegramIntegration && telegramIntegration.ref_code_telegram && !telegramIntegration.page_id) {
                    setTelegramRef(`@olivia ${telegramIntegration.ref_code_telegram}`)
                } else if (telegramIntegration && telegramIntegration.page_id) {
                    setIsVerified(true)
                }
            } catch (error) {
                console.error("Error fetching Instagram accounts:", error);
            } finally {
                setIsLoadingAccounts(false);
            }
        };

        fetchTelegramRefCode();
    }, [selectedChannels, connectedExtensions, existingIntegrations, agent]);

    // Helper function to check if a channel is connected via extensions -> this is not in use
    const isChannelConnected = (channelId) => {
        // Chat widget is always available
        if (channelId === "chat-widget") return true;

        // Get extension ID based on channel ID
        const getExtensionId = (channelId) => {
            switch (channelId.toLowerCase()) {
                case 'facebook':
                    return '9e9de118-8aa5-408a-960c-74074c66cd8e';
                case 'instagram':
                    return 'c32aeec7-50d7-4469-99a5-4235870d16a7';
                case 'widget':
                case 'chat-widget':
                    return '38b88988-58ce-4f49-b2ca-412bd8fa4b0f';
                default:
                    return null;
            }
        };

        const extensionId = getExtensionId(channelId);
        return connectedExtensions.some(ext =>
            (ext.extension_name?.toLowerCase() === channelId.toLowerCase()) ||
            (ext.extension_id === extensionId)
        );
    };

    // All available channels with their status (available or coming soon)
    //here to make true or false on the checkboxes
    // const channels = [
    //   { id: "chat-widget", name: "Chat Widget", icon: <MessageSquare className="w-5 h-5" />, available: true },
    //   { id: "facebook", name: "Facebook", icon: <Facebook className="w-5 h-5" />, available: true, comingSoon: false },
    //   { id: "instagram", name: "Instagram", icon: <Instagram className="w-5 h-5" />, available: true, comingSoon: true },
    //   { id: "x", name: "X", icon: <XLogo className="w-5 h-5" />, available: false, comingSoon: true },
    //   { id: "telegram", name: "Telegram", icon: <Telegram className="w-5 h-5" />, available: false, comingSoon: true },
    //   { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, available: false, comingSoon: true },
    //   { id: "email", name: "Email", icon: <Mail className="w-5 h-5" />, available: false, comingSoon: true },
    //   { id: "sms", name: "SMS", icon: <MessageSquare className="w-5 h-5" />, available: false, comingSoon: true },
    //   { id: "team", name: "Add to a team", icon: <Users className="w-5 h-5" />, available: false, comingSoon: true },
    // ];

    //here
    // First, build a Set of all normalized extension names:
    // const connectedNames = useMemo(
    //   () =>
    //     new Set(
    //       connectedExtensions.map(ext =>
    //         ext.extension_name?.toLowerCase() ||
    //         (ext.extension_id === '9e9de118-8aa5-408a-960c-74074c66cd8e'
    //           ? 'facebook'
    //           : ext.extension_id === 'c32aeec7-50d7-4469-99a5-4235870d16a7'
    //             ? 'instagram'
    //             : '')
    //       )
    //     ),
    //   [connectedExtensions]
    // );

    const connectedNames = useMemo(
        () =>
            new Set(
                connectedExtensions.map(ext =>
                    ext.extension_name?.toLowerCase() ||
                    (ext.extension_id === '9e9de118-8aa5-408a-960c-74074c66cd8e'
                        ? 'facebook'
                        : ext.extension_id === 'c32aeec7-50d7-4469-99a5-4235870d16a7'
                            ? 'instagram'
                            : ext.extension_id === '3c375262-ff82-45b5-b72b-ec05c215e36f'
                                ? 'telegram'
                                : '')
                )
            ),
        [connectedExtensions]
    );

    // Then map your base channel list, flipping `available` if that name is present:
    const channels = useMemo(
        () =>
            [
                { id: "chat-widget", name: "Chat Widget", icon: <MessageSquare className="w-5 h-5" />, available: true },
                { id: "facebook", name: "Facebook", icon: <Facebook className="w-5 h-5" />, available: false, comingSoon: false },
                { id: "instagram", name: "Instagram", icon: <Instagram className="w-5 h-5" />, available: false, comingSoon: false },
                { id: "x", name: "X", icon: <XLogo className="w-5 h-5" />, available: false, comingSoon: true },
                { id: "telegram", name: "Telegram", icon: <Telegram className="w-5 h-5" />, available: false, comingSoon: false },
                { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, available: false, comingSoon: true },
                { id: "email", name: "Email", icon: <Mail className="w-5 h-5" />, available: false, comingSoon: true },
                { id: "sms", name: "SMS", icon: <MessageSquare className="w-5 h-5" />, available: false, comingSoon: true },
                { id: "team", name: "Add to a team", icon: <Users className="w-5 h-5" />, available: false, comingSoon: true },
            ].map(channel => ({
                ...channel,
                // override available only for Facebook & Instagram
                available:
                    channel.id === 'facebook' ||
                        channel.id === 'instagram' ||
                        channel.id === 'telegram'
                        ? connectedNames.has(channel.id)
                        : channel.available
            })),
        [connectedNames]
    );

    // Handle checkbox selection
    const handleSelectionChange = (values) => {
        setSelectedChannels(values);
    };

    // Render step 1: Channel selection
    const renderChannelSelection = () => {
        return (
            <div className="space-y-4">
                {/* <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Only the Chat Widget is available by default. To deploy to other channels like Facebook or Instagram, you need to connect them first in the <a href="/extensions" className="text-brand underline">Extensions page</a>.
          </p>
        </div> */}

                <CheckboxGroup
                    label={
                        <>
                            <strong className="">Channels</strong>
                            <p className="text-sm text-gray-600 mb-2">
                                Select one or more channels where you want to deploy your agent. You can configure each channel in the next step.
                            </p>
                        </>

                    }
                    value={selectedChannels}
                    onChange={handleSelectionChange}
                >
                    <div className="grid grid-cols-3 gap-4">
                        {channels.map((channel) => (
                            <CustomChannelCheckbox
                                key={channel.id}
                                channel={channel}
                                value={channel.id}
                            />
                        ))}
                    </div>
                </CheckboxGroup>
            </div>
        );
    };

    // Render step 2: Channel configuration
    const renderChannelConfiguration = () => {
        const selectedChannelObjects = channels.filter(channel =>
            selectedChannels.includes(channel.id) && channel.available
        );

        if (selectedChannelObjects.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-600">Please select at least one available channel to continue.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                    Configure each selected channel before deployment. You can customize settings for each platform.
                </p>

                <Accordion
                    variant="bordered"
                    className="bg-white border border-gray-100"
                    defaultExpandedKeys={[selectedChannelObjects[0]?.id]}
                >
                    {selectedChannelObjects.map((channel) => (
                        <AccordionItem
                            key={channel.id}
                            aria-label={`${channel.name} Configuration`}
                            title={
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-brand/10">
                                        {channel.icon}
                                    </div>
                                    <span className="text-base font-semibold text-gray-900">{channel.name}</span>
                                </div>
                            }
                        >
                            <div className="px-0 py-2 space-y-4">
                                {renderChannelConfigForm(channel.id)}
                            </div>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        );
    };

    // Render configuration form for each channel
    const renderChannelConfigForm = (channelId) => {
        switch (channelId) {
            case "chat-widget":
                return (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Chat Widget Settings</h3>

                        <div className="space-y-4">
                            {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Widget Style</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={channelConfigs["chat-widget"].widget_style}
                  onChange={(e) => handleConfigChange("chat-widget", "widget_style", e.target.value)}
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="popup">Pop-up</option>
                </select>
                <p className="text-xs text-gray-500">The visual style of the chat widget</p>
              </div> */}
                            <div className="flex justify-start items-center gap-4 mt-4">
                                <RadioGroup
                                    defaultValue={chatType}
                                    orientation="horizontal"
                                    className="flex flex-row"
                                    onChange={(e) => setChatType(e.target.value)}
                                >
                                    <CustomRadio
                                        description=""
                                        value="classic"
                                        img_path="/chat-widget.svg"
                                    >
                                        <div>
                                            <p>Chat Widget</p>
                                        </div>
                                    </CustomRadio>
                                    <CustomRadio
                                        description=""
                                        value="pop-up"
                                        img_path="/pop-up-widget.svg"
                                    >
                                        <div>
                                            <p>Pop-up Widget</p>
                                        </div>
                                    </CustomRadio>
                                </RadioGroup>
                            </div>
                            {/* <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Widget Position</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={channelConfigs["chat-widget"].widget_position}
                  onChange={(e) => handleConfigChange("chat-widget", "widget_position", e.target.value)}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="right-center">Right Center</option>
                  <option value="top-center">Top Center</option>
                  <option value="left-center">Left Center</option>
                </select>
                <p className="text-xs text-gray-500">The position of the chat widget on your website</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Position Offset (px)</label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Top"
                    type="number"
                    min="0"
                    value={channelConfigs["chat-widget"].position_offset.top}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setChannelConfigs(prev => ({
                        ...prev,
                        "chat-widget": {
                          ...prev["chat-widget"],
                          position_offset: {
                            ...prev["chat-widget"].position_offset,
                            top: value
                          }
                        }
                      }));
                    }}
                  />
                  <Input
                    label="Bottom"
                    type="number"
                    min="0"
                    value={channelConfigs["chat-widget"].position_offset.bottom}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setChannelConfigs(prev => ({
                        ...prev,
                        "chat-widget": {
                          ...prev["chat-widget"],
                          position_offset: {
                            ...prev["chat-widget"].position_offset,
                            bottom: value
                          }
                        }
                      }));
                    }}
                  />
                  <Input
                    label="Left"
                    type="number"
                    min="0"
                    value={channelConfigs["chat-widget"].position_offset.left}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setChannelConfigs(prev => ({
                        ...prev,
                        "chat-widget": {
                          ...prev["chat-widget"],
                          position_offset: {
                            ...prev["chat-widget"].position_offset,
                            left: value
                          }
                        }
                      }));
                    }}
                  />
                  <Input
                    label="Right"
                    type="number"
                    min="0"
                    value={channelConfigs["chat-widget"].position_offset.right}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setChannelConfigs(prev => ({
                        ...prev,
                        "chat-widget": {
                          ...prev["chat-widget"],
                          position_offset: {
                            ...prev["chat-widget"].position_offset,
                            right: value
                          }
                        }
                      }));
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">Fine-tune the widget position with custom offsets</p>
              </div> */}
                        </div>

                        {/* <Input
              label="Notification Email"
              type="email"
              placeholder="notifications@example.com"
              value={channelConfigs["chat-widget"].notification_email}
              onChange={(e) => handleConfigChange("chat-widget", "notification_email", e.target.value)}
              description="Email to receive notifications about new messages"
            />

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-base font-semibold text-gray-800 mb-3">Agent Availability</h4>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Available 24/7</p>
                  <p className="text-xs text-gray-500">Agent will respond at all times</p>
                </div>
                <Switch
                  isSelected={channelConfigs["chat-widget"].availability.is_24_7}
                  onValueChange={(value) => handleAvailabilityChange("chat-widget", value)}
                />
              </div>

              {!channelConfigs["chat-widget"].availability.is_24_7 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Custom Schedule</p>
                  <p className="text-xs text-gray-500 mb-3">Set specific hours when the agent will be active</p>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Day
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Active
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Time
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {channelConfigs["chat-widget"].availability.schedule.map((day, index) => (
                          <tr key={day.day}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {day.day}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              <Switch
                                size="sm"
                                isSelected={day.enabled}
                                onValueChange={(value) => handleScheduleChange("chat-widget", index, "enabled", value)}
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              <Input
                                type="time"
                                size="sm"
                                value={day.start_time}
                                onChange={(e) => handleScheduleChange("chat-widget", index, "start_time", e.target.value)}
                                disabled={!day.enabled}
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              <Input
                                type="time"
                                size="sm"
                                value={day.end_time}
                                onChange={(e) => handleScheduleChange("chat-widget", index, "end_time", e.target.value)}
                                disabled={!day.enabled}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div> */}
                    </div>
                );

            case "facebook":
                return (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Facebook Messenger Settings</h3>

                        {isLoadingPages ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div>
                            </div>
                        ) : facebookPages.length > 0 ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Facebook Page</label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        value={channelConfigs["facebook"]?.page_id || ""}
                                        onChange={(e) => {
                                            const selectedPage = facebookPages.find(page => page.id === e.target.value);
                                            if (selectedPage) {
                                                //console.log("Selected Facebook page:", selectedPage);
                                                handleConfigChange("facebook", "page_id", selectedPage.id);
                                                handleConfigChange("facebook", "page_name", selectedPage.name);

                                                // Log the updated channelConfigs
                                                // setTimeout(() => {
                                                //   console.log("Updated Facebook channelConfigs:", channelConfigs.facebook);
                                                // }, 100);
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select a page</option>
                                        {facebookPages.map(page => (
                                            <option
                                                key={page.id}
                                                value={page.id}
                                                disabled={page.inUse}
                                            >
                                                {page.name} {page.inUse ? '(In use by another agent)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500">The Facebook page where your agent will respond to messages</p>
                                </div>

                                {facebookPages.every(page => page.inUse) && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Note:</strong> All your Facebook pages are currently in use by other agents.
                                            To deploy to a page that's in use, you need to first set the other agent to draft status.
                                        </p>
                                    </div>
                                )}

                                {/* {channelConfigs["facebook"]?.page_id && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Selected Page:</strong> {channelConfigs["facebook"].page_name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      ID: {channelConfigs["facebook"].page_id}
                    </p>
                  </div>
                )} */}
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700">
                                    No Facebook pages found. Please make sure you have at least one Facebook page connected to your account.
                                </p>
                            </div>
                        )}


                        {/* <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto Response</p>
                <p className="text-xs text-gray-500">Automatically respond to new messages</p>
              </div>
              <Switch
                isSelected={channelConfigs["facebook"].auto_response}
                onValueChange={(value) => handleConfigChange("facebook", "auto_response", value)}
              />
            </div> */}

                        <Input
                            label="Notification Email"
                            type="email"
                            placeholder="notifications@example.com"
                            value={channelConfigs["facebook"].notification_email}
                            onChange={(e) => handleConfigChange("facebook", "notification_email", e.target.value)}
                            description="Email to receive notifications about new messages"
                        />

                        {/* Availability Schedule */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="text-base font-semibold text-gray-800 mb-3">Agent Availability</h4>

                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Available 24/7</p>
                                    <p className="text-xs text-gray-500">Agent will respond at all times</p>
                                </div>
                                <Switch
                                    isSelected={channelConfigs["facebook"].availability.is_24_7}
                                    onValueChange={(value) => handleAvailabilityChange("facebook", value)}
                                />
                            </div>

                            {!channelConfigs["facebook"].availability.is_24_7 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Custom Schedule</p>
                                    <p className="text-xs text-gray-500 mb-3">Set specific hours when the agent will be active</p>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Day
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Active
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Start Time
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        End Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {channelConfigs["facebook"].availability.schedule.map((day, index) => (
                                                    <tr key={day.day}>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {day.day}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Switch
                                                                size="sm"
                                                                isSelected={day.enabled}
                                                                onValueChange={(value) => handleScheduleChange("facebook", index, "enabled", value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Input
                                                                type="time"
                                                                size="sm"
                                                                value={day.start_time}
                                                                onChange={(e) => handleScheduleChange("facebook", index, "start_time", e.target.value)}
                                                                disabled={!day.enabled}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Input
                                                                type="time"
                                                                size="sm"
                                                                value={day.end_time}
                                                                onChange={(e) => handleScheduleChange("facebook", index, "end_time", e.target.value)}
                                                                disabled={!day.enabled}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "instagram":
                return (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Instagram Settings</h3>

                        {isLoadingAccounts ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div>
                            </div>
                        ) : instagramAccounts.length > 0 ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Select Instagram Account</label>
                                    <select
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                        value={channelConfigs["instagram"]?.account_id || ""}
                                        onChange={(e) => {
                                            const selectedAccount = instagramAccounts.find(account => account.id === e.target.value);
                                            if (selectedAccount) {
                                                //console.log("Selected Instagram account:", selectedAccount);
                                                handleConfigChange("instagram", "account_id", selectedAccount.id);
                                                handleConfigChange("instagram", "account_name", selectedAccount.username);

                                                // Log the updated channelConfigs
                                                // setTimeout(() => {
                                                //   console.log("Updated Instagram channelConfigs:", channelConfigs.instagram);
                                                // }, 100);
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Select an account</option>
                                        {instagramAccounts.map(account => (
                                            <option
                                                key={account.id}
                                                value={account.id}
                                                disabled={account.inUse}
                                            >
                                                {account.username} (connected to {account.pageName}) {account.inUse ? '(In use by another agent)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500">The Instagram account where your agent will respond to messages</p>
                                </div>

                                {instagramAccounts.every(account => account.inUse) && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Note:</strong> All your Instagram accounts are currently in use by other agents.
                                            To deploy to an account that's in use, you need to first set the other agent to draft status.
                                        </p>
                                    </div>
                                )}

                                {channelConfigs["instagram"]?.account_id && (
                                    <div className="p-3 bg-pink-50 border border-pink-100 rounded-md">
                                        <p className="text-sm text-pink-800">
                                            <strong>Selected Account:</strong> {channelConfigs["instagram"].account_name}
                                        </p>
                                        <p className="text-xs text-pink-600 mt-1">
                                            ID: {channelConfigs["instagram"].account_id}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-700">
                                    No Instagram accounts found. Please make sure you have an Instagram Business account connected to one of your Facebook pages.
                                </p>
                            </div>
                        )}


                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Auto Response</p>
                                <p className="text-xs text-gray-500">Automatically respond to new messages</p>
                            </div>
                            <Switch
                                isSelected={channelConfigs["instagram"].auto_response}
                                onValueChange={(value) => handleConfigChange("instagram", "auto_response", value)}
                            />
                        </div>

                        <Input
                            label="Notification Email"
                            type="email"
                            placeholder="notifications@example.com"
                            value={channelConfigs["instagram"].notification_email}
                            onChange={(e) => handleConfigChange("instagram", "notification_email", e.target.value)}
                            description="Email to receive notifications about new messages"
                        />

                        {/* Availability Schedule */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="text-base font-semibold text-gray-800 mb-3">Agent Availability</h4>

                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Available 24/7</p>
                                    <p className="text-xs text-gray-500">Agent will respond at all times</p>
                                </div>
                                <Switch
                                    isSelected={channelConfigs["instagram"].availability.is_24_7}
                                    onValueChange={(value) => handleAvailabilityChange("instagram", value)}
                                />
                            </div>

                            {!channelConfigs["instagram"].availability.is_24_7 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Custom Schedule</p>
                                    <p className="text-xs text-gray-500 mb-3">Set specific hours when the agent will be active</p>

                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Day
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Active
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Start Time
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        End Time
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {channelConfigs["instagram"].availability.schedule.map((day, index) => (
                                                    <tr key={day.day}>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {day.day}
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Switch
                                                                size="sm"
                                                                isSelected={day.enabled}
                                                                onValueChange={(value) => handleScheduleChange("instagram", index, "enabled", value)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Input
                                                                type="time"
                                                                size="sm"
                                                                value={day.start_time}
                                                                onChange={(e) => handleScheduleChange("instagram", index, "start_time", e.target.value)}
                                                                disabled={!day.enabled}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                                            <Input
                                                                type="time"
                                                                size="sm"
                                                                value={day.end_time}
                                                                onChange={(e) => handleScheduleChange("instagram", index, "end_time", e.target.value)}
                                                                disabled={!day.enabled}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "telegram":
                return (
                    <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Telegram Verification</h3>
                        {!telegramRef ? (
                            <Button onClick={handleGenerateTelegramCode}>Generate Verification Code</Button>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Your Verification Code</label>
                                <div className="flex items-center gap-2">
                                    <div className="cursor-pointer inline-block">
                                        <Input
                                            onClick={handleCopyTelegramCode}
                                            value={telegramRef}
                                            readOnly
                                            classNames={{ input: 'cursor-pointer' }}
                                        />
                                    </div>
                                    <Button onClick={handleCopyTelegramCode} aria-label="Copy code" className="bg-brand">
                                        <ClipboardIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Copy this code and send it to your Telegram chat so we can connect your agent with your channel.
                                </p>
                                <p className="text-xs text-gray-500">
                                    Return here after and click the button bellow to verify the conection
                                </p>
                                <p className="text-xs text-red-500">
                                    IMPORTANT: Only click Deploy after you successfully verify your telegram or your agent can have issues interacting with your channel
                                </p>
                                <Button
                                    isDisabled={!telegramRef || isVerified}
                                    onPress={handleVerifyTelegram}
                                    className="bg-brand"
                                >
                                    {isVerified ? "Verified" : "Verify"}
                                </Button>

                                {isVerified && (
                                    <p className="text-sm text-green-600">Telegram successfully verified!</p>
                                )}


                                {!isVerified && telegramError && (
                                    <p className="text-sm text-red-500 mt-1">{telegramError}</p>
                                )}
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="rounded-lg">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">Configuration</h3>
                        <p className="text-sm text-gray-600">
                            Configuration settings for this channel will be available soon.
                        </p>
                    </div>
                );
        }
    };

    // Render the current step
    return currentStep === 1 ? renderChannelSelection() : renderChannelConfiguration();
};

export default DeploymentWizard;
