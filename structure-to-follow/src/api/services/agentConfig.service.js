import { ENDPOINTS, API_URL_KEY } from '../config/endpoints.js';
import axios from 'axios';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';

/**
 * Chat API service for handling chat operations.
 */
class AgentConfigService {
    /**
 * Fetches all chat configuration records for a given client ID.
 *
 * @param {string} clientId - The unique identifier of the client.
 * @returns {Promise<import('../types/agentConfig.types').agentConfig[] | null>}
 * Returns an array of chat config objects, or null if an error occurs.
 */
    async fetchAgentConfigByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.AGENTCONFIG.READ_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching chat configs:", error);
            return null;
        }
    }


    /**
     * Update an agent by its chat ID
     * 
     * @param {string} Id - The unique identifier of the chat/agent to update
     * @param {Object} updateData - Object containing the fields to update
     * @param {string} [updateData.chat_info] - The client ID
     * @param {Object} [updateData.bot_config] - Chat configuration
     * @param {Object} [updateData.lead_details] - AI configuration
     * @param {string} [updateData.company_details] - Location of training data
     * @returns {Promise<Object|null>} - The updated agent data or null if an error occurs
     */
    async updateAgentConfig(Id, updateData) {
        //console.log("Id", Id);
        //console.log("updateData", updateData);
        if (!Id) {
            console.error("Missing required parameter: chatId");
            return null;
        }

        try {

            const response = await apiGatewayAxiosInstance.patch(
                ENDPOINTS.AGENTCONFIG.UPDATE_AGENT_CONFIG.replace(':id', Id),
                updateData
            );

            if (response.data.statusCode === 200) {
                return response.data.data;
            } else {
                console.error("Unexpected status code:", response.data.statusCode);
                return null;
            }
        } catch (error) {
            console.error("Error updating agent:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
            }
            return null;
        }
    }
}

export const agentConfigService = new AgentConfigService();
