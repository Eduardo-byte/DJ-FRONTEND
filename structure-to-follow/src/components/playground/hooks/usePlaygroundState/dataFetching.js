import { useEffect } from "react";
import { chatService } from "../../../../api/services/chat.service";
import { agentConfigService } from "../../../../api/services/agentConfig.service";
import { chatConfigService } from "../../../../api/services/chatConfig.service";
import { webhookService } from "../../../../api/services/webhook.service";

export const useDataFetching = (userData, chatAgents, setChatAgents, dataFetchedRef, selectedAgent) => {
  // Fetch chat data only once when component mounts
  useEffect(() => {
    // Skip if we've already fetched data
    // !!!!!!Important !!!!! I had to comment this bellow in order for the GOD-MODE dropdown to fetch the data again !!!!!!Important !!!!!
    // if (dataFetchedRef.current) return;

    const fetchData = async () => {
      try {
        // Fetch chat data directly without logging
        // const chatData = await chatService.fetchChatIds(userData?.client_id);
        const [chatData, chatConfigs, agentConfigs, webhooks] = await Promise.all([
          chatService.fetchChatIds(userData?.client_id),
          chatConfigService.fetchChatConfigByClientId(userData?.client_id),
          agentConfigService.fetchAgentConfigByClientId(userData?.client_id),
          webhookService.fetchWebhookByClientId(userData?.client_id)
        ]);
        // console.log("chatConfigs:", chatConfigs);
        // console.log("agentConfigs:", agentConfigs);
        // console.log("chatData:", chatData);
        if (chatData?.chat_ids) {
          // Transform chat_ids into the format expected by the components
          // originalData is the data from the chat that comes from the DB
          // const transformedAgents = chatData.chat_ids.map(chat => ({
          //   id: chat.chat_id,
          //   user_id: chat.client_id,
          //   clientId: chat.client_id,
          //   name: chat.chat_config?.global_?.businessDetails?.chatConfig?.botName ||
          //     chat.ai_config?.bot_config?.bot_name ||
          //     "Unnamed Agent",
          //   description: chat.ai_config?.bot_config?.bot_role || "No description",
          //   status: chat.status, // Assuming all fetched chats are active
          //   type: chat.extra_info?.bot_goal?.name?.toLowerCase() || "customer-support",
          //   metrics: {
          //     conversations: "0",
          //     users: "0",
          //     responseTime: "0s",
          //     satisfaction: "0%",
          //   },
          //   lastUpdated: chat.updated_at || chat.created_at,
          //   // Store the original chat data for use in other components
          //   originalData: chat,
          // }));
          const transformedAgents = chatData.chat_ids.map((chat) => {
            const chatConfig = chatConfigs.find(cfg => cfg.chat_id === chat.chat_id);
            const agentConfig = agentConfigs.find(cgf => cgf.chat_id === chat.chat_id);
            const webhooksData = webhooks.find(wbh => wbh.chat_id === chat.chat_id)

            return {
              id: chat.chat_id,
              user_id: chat.client_id,
              clientId: chat.client_id,
              name:
                chat.chat_config?.global_?.businessDetails?.chatConfig?.botName ||
                chat.ai_config?.bot_config?.bot_name || chatConfig?.global_?.businessDetails?.chatConfig?.botName ||
                agentConfig?.bot_config?.bot_name ||
                "Unnamed Agent",
              description: chat.ai_config?.bot_config?.bot_role || agentConfig?.bot_config?.bot_role || "No description",
              status: chat.status,
              type: chat.extra_info?.bot_goal?.name?.toLowerCase() || "customer-support",
              metrics: {
                conversations: "0",
                users: "0",
                responseTime: "0s",
                satisfaction: "0%",
              },
              lastUpdated: chat.updated_at || chat.created_at,
              originalData: chat,
              agentConfig,
              chatConfig,
              webhooksData,
            };
          });
          setChatAgents(transformedAgents);

          // Mark that we've fetched data
          dataFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    // Only fetch if we have a user ID
    if (userData?.client_id) {
      fetchData();
    }
  }, [userData?.client_id, selectedAgent?.name]); // Only re-run if the user ID changes
};
