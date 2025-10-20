import { useState, useEffect, useContext } from "react";
import { UserDataContext } from "../../../context/UserDataContext";
import { chatService, clientExtensionService, facebookService, instagramService, integrationService } from "../../../api";


/**
 * Custom hook to fetch client extensions, integrations, Facebook pages, and Instagram accounts.
 * Returns lists and loading flags, plus channelConfigs state.
 */
export const useChannelIntegrations = (agentId, selectedAgent) => {
    const { userData } = useContext(UserDataContext);
    const clientId = userData?.client_id;

    const [existingIntegrations, setExistingIntegrations] = useState([]);
    const [allIntegrations, setAllIntegrations] = useState([]);
    const [isLoadingExtensions, setIsLoadingExtensions] = useState(false);
    const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);

    const [facebookPages, setFacebookPages] = useState([]);
    const [isLoadingPages, setIsLoadingPages] = useState(false);

    const [instagramAccounts, setInstagramAccounts] = useState([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    const [connectedExtensions, setConnectedExtensions] = useState([]);
    const [detailsChat, setDetailsChat] = useState([]);

    const [whatsappAccounts, setWhatsappAccounts] = useState([]);

    // initial channelConfigs state
    const initialConfigs = {
        facebook: {
            status: false,
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
                    { day: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" },
                ]
            }
        },
        instagram: {
            status: false,
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
                    { day: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" },
                ]
            }
        },
        whatsapp: {
            status: false,
            account_id: "",
            waba_name: "",
            business_name: "",
            phone_number: "",
            phone_number_id: "",
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
                    { day: "Sunday", enabled: false, start_time: "09:00", end_time: "17:00" },
                ]
            }
        },
        widget: {
            status: false,
            widget_position: "bottom-right",
            widget_color: "#6366F1",
            widget_title: "Chat with us",
            widget_subtitle: "We usually respond in a few minutes",
            widget_icon: "default",
            widget_type: "classic",
            auto_open: false,
            auto_open_delay: 5000,
            show_branding: true
        },
        telegram: {
            status: false,
            channel: "",
            ref_code_telegram: "",
            verified: false,
            channelId: ""
        },
    };

    const [channelConfigs, setChannelConfigs] = useState(initialConfigs);

    useEffect(() => {
        if (!clientId || !selectedAgent?.id) return;

        //I had to comment this because of the bug when changed chat-widget style(type) would show the loading thing
        // setIsLoadingExtensions(true);
        // setIsLoadingIntegrations(true);

        const fetch = async () => {
            // load only connected client-wide extensions
            try {
                const exts = await clientExtensionService.getClientExtensionsByClientId(clientId);
                setConnectedExtensions(exts.filter(e => e.is_connected));
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingExtensions(false);
            }

            // load _all_ integrations for the client, then narrow to this agent
            try {
                const ints = await integrationService.getIntegrationsByClientId(clientId);
                setAllIntegrations(ints);
                // <<< only keep the ones whose chat_id matches the selectedAgent
                const agentInts = ints.filter(i => i.chat_id === selectedAgent.id);
                // console.log("agentInts", agentInts);
                setExistingIntegrations(agentInts);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoadingIntegrations(false);
            }

            try {
                const chatDetails = await chatService.fetchChatbyId(selectedAgent.id)
                setDetailsChat(chatDetails)
                // console.log("chatDetails", chatDetails);
            } catch (error) {
                console.error(error);
            }
        };

        fetch();
    }, [clientId, selectedAgent]);


    // inside your hook, *after* you’ve declared allIntegrations, existingIntegrations, selectedAgent
    const pageUsedByThisAgent = id =>
        allIntegrations.some(
            i => i.page_id === id && i.status && i.chat_id === selectedAgent.id
        );

    const pageUsedByOtherAgents = id =>
        allIntegrations.some(
            i => i.page_id === id && i.status && i.chat_id !== selectedAgent.id
        );

    // similarly for Instagram accounts
    const accountUsedByThisAgent = id =>
        allIntegrations.some(
            i => i.integration_details?.account_id === id
                && i.status
                && i.chat_id === selectedAgent.id
        );

    const accountUsedByOtherAgents = id =>
        allIntegrations.some(
            i => i.integration_details?.account_id === id
                && i.status
                && i.chat_id !== selectedAgent.id
        );

    // inside your hook, *after* you’ve declared allIntegrations, existingIntegrations, selectedAgent
    const whatsappUsedByThisAgent = id =>
        allIntegrations.some(
            i => i.integration_details.phone_number === id && i.status && i.chat_id === selectedAgent.id
        );

    const whatsappUsedByOtherAgents = id =>
        allIntegrations.some(
            i => i.integration_details.phone_number === id && i.status && i.chat_id !== selectedAgent.id
        );

    // Fetch Facebook pages
    useEffect(() => {
        if (!clientId) return;
        setIsLoadingPages(true);

        const fbExt = connectedExtensions.find(e =>
            e.extension_id === '9e9de118-8aa5-408a-960c-74074c66cd8e'
        );
        if (!fbExt) {
            setIsLoadingPages(false);
            return;
        }

        // map your existing page_ids array instead of calling facebookService
        // const pages = (fbExt.page_ids || []).map(p => ({
        //     id: p.id,
        //     name: p.name,
        //     inUse: pageInUse(p.id)
        // }));
        const pages = (fbExt.page_ids || []).map(p => ({
            id: p.id,
            name: p.name,
            usedByThis: pageUsedByThisAgent(p.id),
            usedByOther: pageUsedByOtherAgents(p.id)
        }));
        setFacebookPages(pages);
        setIsLoadingPages(false);
    }, [clientId, connectedExtensions, existingIntegrations, agentId, selectedAgent]);


    // Fetch Instagram accounts
    // Fetch Instagram accounts (using the page_ids array on the Instagram extension)
    useEffect(() => {
        if (!clientId) return;
        setIsLoadingAccounts(true);
        // console.log("connectedExtensions", connectedExtensions);
        // Find the IG extension by its well-known UUID
        const igExt = connectedExtensions.find(
            e => e.extension_id === "c32aeec7-50d7-4469-99a5-4235870d16a7"
        );

        if (!igExt) {
            setIsLoadingAccounts(false);
            return;
        }

        // igExt.page_ids already contains { id, name, username }
        // const accounts = (igExt.page_ids || []).map(acc => ({
        //     id: acc.id,
        //     account_name: acc.username,
        //     pageName: acc.name,           // the FB page this IG account lives under
        //     inUse: accountInUse(acc.id)
        // }));

        const accounts = (igExt.page_ids || []).map(acc => ({
            id: acc.id,
            pageName: acc.name,
            account_name: acc.username,
            usedByThis: accountUsedByThisAgent(acc.id),
            usedByOther: accountUsedByOtherAgents(acc.id)
        }));

        setInstagramAccounts(accounts);
        setIsLoadingAccounts(false);
    }, [clientId, connectedExtensions, existingIntegrations, agentId, selectedAgent]);

    // Fetch Whatsapp phone numbers
    useEffect(() => {
        if (!clientId) return;
        setIsLoadingPages(true);

        const wtExt = connectedExtensions.find(e =>
            e.extension_id === 'a2a83703-8c62-4216-b94d-9ecfdfc32438'
        );
        if (!wtExt) {
            setIsLoadingPages(false);
            return;
        }

        const pages = (wtExt.page_ids || []).map(p => ({
            id: p.phone_number,
            waba_name: p.waba_name,
            business_name: p.business_name,
            phone_number_id: p.phone_number_id,
            account_id: p.business_account_id,
            usedByThis: whatsappUsedByThisAgent(p.phone_number),
            usedByOther: whatsappUsedByOtherAgents(p.phone_number)
        }));
        setWhatsappAccounts(pages);
        setIsLoadingPages(false);
    }, [clientId, connectedExtensions, existingIntegrations, agentId, selectedAgent]);


    useEffect(() => {
        // whenever agent changes, start fresh
        if (!agentId) {
            setChannelConfigs(initialConfigs)
            return
        }

        // find this agent’s integrations
        const fbInt = existingIntegrations.find(i =>
            i.chat_id === agentId && i.integration_type?.some(t => t.type === "facebook")
        )
        const igInt = existingIntegrations.find(i =>
            i.chat_id === agentId && i.integration_type?.some(t => t.type === "instagram")
        )

        const widgetInt = existingIntegrations.find(i =>
            i.chat_id === agentId && i.integration_type?.some(t => t.type === "chat-widget")
        )

        const tgInt = existingIntegrations.find(i =>
            i.integration_type?.some(t => t.type === 'telegram'));

        const wtInt = existingIntegrations.find(i =>
            i.integration_type?.some(t => t.type === 'whatsapp'));

        setChannelConfigs({
            // if we found one, map its fields, otherwise go back to default
            facebook: fbInt
                ? {
                    ...initialConfigs.facebook,
                    status: fbInt.status,
                    page_id: fbInt.page_id,
                    page_name: fbInt.integration_details?.page_name ?? initialConfigs.facebook.page_name,
                    auto_response: fbInt.integration_details?.auto_response ?? initialConfigs.facebook.auto_response,
                    notification_email: fbInt.integration_details?.notification_email ?? initialConfigs.facebook.notification_email,
                    availability: fbInt.integration_details?.availability ?? initialConfigs.facebook.availability,
                }
                : { ...initialConfigs.facebook },

            instagram: igInt
                ? {
                    ...initialConfigs.instagram,
                    status: igInt.status,
                    account_id: igInt.integration_details?.account_id,
                    account_name: igInt.integration_details?.account_name ?? initialConfigs.instagram.account_name,
                    auto_response: igInt.integration_details?.auto_response ?? initialConfigs.instagram.auto_response,
                    notification_email: igInt.integration_details?.notification_email ?? initialConfigs.instagram.notification_email,
                    availability: igInt.integration_details?.availability ?? initialConfigs.instagram.availability,
                }
                : { ...initialConfigs.instagram },

            whatsapp: wtInt
                ? {
                    ...initialConfigs.whatsapp,
                    status: wtInt.status,
                    account_id: wtInt.integration_details?.account_id,
                    phone_number: wtInt.integration_details?.phone_number ?? initialConfigs.whatsapp.phone_number,
                    waba_name: wtInt.integration_details?.waba_name ?? initialConfigs.whatsapp.waba_name,
                    business_name: wtInt.integration_details?.business_name ?? initialConfigs.whatsapp.business_name,
                    phone_number_id: wtInt.integration_details?.phone_number_id ?? initialConfigs.whatsapp.phone_number_id,
                    auto_response: wtInt.integration_details?.auto_response ?? initialConfigs.whatsapp.auto_response,
                    notification_email: wtInt.integration_details?.notification_email ?? initialConfigs.whatsapp.notification_email,
                    availability: wtInt.integration_details?.availability ?? initialConfigs.whatsapp.availability,
                }
                : { ...initialConfigs.whatsapp },

            widget: widgetInt
                ? {
                    ...initialConfigs.widget,
                    status: widgetInt.status,
                    widget_type: detailsChat?.chat_type
                }
                : { ...initialConfigs.instagram },

            telegram: tgInt
                ? {
                    status: tgInt.is_active,
                    channel: tgInt.integration_details?.Chat_name || "",
                    ref_code_telegram: `@olivia ${tgInt?.ref_code_telegram}` || "",
                    verified: tgInt.status,
                    channelId: tgInt.page_id
                }
                : { ...initialConfigs.telegram },
        })
        // console.log("channelConfigs:", channelConfigs);
        // console.log("tgInt.integration_details?.ref_code_telegram:", tgInt.integration_details?.ref_code_telegram);
    }, [agentId, existingIntegrations, selectedAgent])

    return {
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
        setConnectedExtensions
    };
};