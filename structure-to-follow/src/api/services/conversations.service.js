import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

/**
 * Conversation API service for handling message and conversation operations.
 */
class ConversationService {
    /**
     * Get agent status by message ID.
     * @param {string} messageId - The unique identifier of the message.
     * @returns {Promise<any>} A promise that resolves to the agent status data.
     */
    async getAgentStatusByMessageId(messageId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CONVERSATIONS.READ_AGENT_STATUS_BY_MESSAGE_ID.replace(':messageId', messageId)
            );
            if (response.data.statusCode !== 200) {
                console.error('Failed to fetch content');
                return;
            }

            // console.log('Content fetched', response.data);
            return response.data.data;
        } catch (error) {
            console.error('Error fetching message based on the ID provided:', error);
        }
    }

    /**
     * Update conversation data in Supabase.
     * @param {string} messageId - The unique identifier of the message.
     * @param {import('../types/message.types').UpdateMessagePayload} contentUpdate - The update payload for the message.
     * @returns {Promise<void>} A promise that resolves when the update is complete.
     */
    async updateConversationInSupabase(messageId, contentUpdate) {
        try {
            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.CONVERSATIONS.UPDATE_CONVERSATION.replace(':messageId', messageId),
                contentUpdate
            );
            if (response.data.statusCode !== 200) {
                console.error('Failed to update message');
                return;
            } else {
                return response.data.data
            }
            // console.log('Update successful', response.data);
        } catch (error) {
            console.error('Error updating conversation:', error);
        }
    }

    /**
     * Update the isLiveAgent flag in Supabase.
     * @param {string} messageId - The unique identifier of the message.
     * @param {boolean} isLiveAgentStatus - The new status for isLiveAgent.
     * @returns {Promise<void>} A promise that resolves when the update is complete.
     */
    async updateIsLiveAgentInSupabase(messageId, isLiveAgentStatus) {
        try {
            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.CONVERSATIONS.UPDATE_IS_LIVE_AGENT.replace(':messageId', messageId),
                { isLiveAgent: isLiveAgentStatus }
            );
            if (response.data.statusCode !== 200) {
                console.error('Failed to update message');
                return;
            } else {
                return response.data.data
            }
            // console.log('Update successful', response.data);
        } catch (error) {
            console.error('Error updating isLiveAgent:', error);
        }
    }

    /**
     * Fetch all messages associated with a client.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {Promise<import('../types/message.types').Message[]|null>} A promise that resolves to an array of messages or null if an error occurs.
     */
    async fetchAllMessagesByClient(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CONVERSATIONS.GET_ALL_MESSAGES_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return null;
        }
    }

    /**
     * Fetch paginated conversation metadata with server-side filtering.
     * @param {string} clientId - The unique identifier of the client.
     * @param {Object} options - Query options
     * @param {number} options.page - Page number (0-based)
     * @param {number} options.limit - Number of records per page (default: 20)
     * @param {string} options.searchQuery - Search term for user names/emails
     * @param {string} options.selectedChannel - Channel filter 
     * @param {string} options.selectedChatId - Chat ID filter
     * @param {Object} options.dateRange - Date range filter {start, end}
     * @param {string} options.sortBy - Sort order: 'newest', 'oldest', 'name'
     * @returns {Promise<{data: Array, totalCount: number, hasMore: boolean}|null>} Paginated results with metadata
     */
    async fetchConversationsPaginated(clientId, options = {}) {
        try {
            const {
                page = 0,
                limit = 20,
                searchQuery = '',
                selectedChannel = 'all',
                selectedChatId = null,
                dateRange = null,
                sortBy = 'newest'
            } = options;

            // Build query parameters for the backend API
            const params = new URLSearchParams({
                clientId,
                page: page.toString(),
                limit: limit.toString(),
                sortBy
            });

            // Add optional parameters
            if (searchQuery) {
                params.append('searchQuery', searchQuery);
            }
            
            if (selectedChannel && selectedChannel !== 'all') {
                params.append('selectedChannel', selectedChannel);
            }
            
            if (selectedChatId) {
                params.append('selectedChatId', selectedChatId);
            }
            
            if (dateRange?.start && dateRange?.end) {
                params.append('dateStart', dateRange.start);
                params.append('dateEnd', dateRange.end);
            }

            // Make the API call to our backend
            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.CONVERSATIONS.GET_CONVERSATIONS_PAGINATED}?${params.toString()}`
            );

            if (response.status !== 200 || !response.data) {
                console.error('Backend API call failed:', response);
                return null;
            }

            // The backend already returns the optimized format we need
            return response.data.data;
        } catch (error) {
            console.error("Error fetching paginated conversations from backend:", error);
            
            // If backend fails, you could add a fallback to the old Supabase method
            // console.log('Falling back to direct Supabase query...');
            // return this.fetchConversationsPaginatedFallback(clientId, options);
            
            return null;
        }
    }

    /**
     * Legacy method - kept for backward compatibility.
     * @deprecated Use fetchConversationsPaginated instead
     */
    async fetchConversationMetadata(clientId) {
        const result = await this.fetchConversationsPaginated(clientId, { page: 0, limit: 50 });
        return result ? result.data : null;
    }

    /**
     * Fetch full message content for a specific conversation (lazy loading).
     * Now calls the optimized backend API for full conversation content.
     * @param {string} conversationId - The unique identifier of the conversation.
     * @returns {Promise<any|null>} A promise that resolves to the full conversation content or null if an error occurs.
     */
    async fetchConversationById(conversationId) {
        try {
            //console.log('Frontend - Fetching full conversation:', conversationId);

            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CONVERSATIONS.GET_FULL_CONVERSATION.replace(':messageId', conversationId)
            );


            if (response.status !== 200 || !response.data) {
                console.error('Failed to fetch full conversation content');
                return null;
            }

            return response.data.data;
        } catch (error) {
            console.error('Error fetching full conversation by ID:', error);
            
            // Fallback to old method if new endpoint fails
            console.log('Falling back to old conversation fetch method...');
            try {
                const response = await apiGatewayAxiosInstance.get(
                    ENDPOINTS.CONVERSATIONS.READ_AGENT_STATUS_BY_MESSAGE_ID.replace(':messageId', conversationId)
                );
                if (response.data.statusCode === 200) {
                    return response.data.data;
                }
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
            }
            
            return null;
        }
    }
    
    async fetchAllMessagesByUserId(userId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CONVERSATIONS.GET_ALL_MESSAGES_BY_USER_ID.replace(':userId', userId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching messages:", error);
            return null;
        }
    }
}

export const conversationService = new ConversationService();
