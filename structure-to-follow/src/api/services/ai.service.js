import { ENDPOINTS } from '../config/endpoints.js';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';

/**
 * AI API service for handling AI operations.
 */
class AIService {
    /**
     * Send a message to the AI API and get a response.
     * 
     * @param {string} chatId - The unique identifier for the chat session
     * @param {string} userInput - The user's message
     * @param {string} chatHistory - The history of the conversation
     * @returns {Promise<import('../types/ai.types').AIResponse|null>} - The API response or null if an error occurs
     */
    async sendMessage(chatId, userInput, chatHistory = '') {
        try {
            if (!chatId || !userInput) {
                console.error('Missing required parameters: chatId or userInput');
                return null;
            }

            const payload = {
                chatId: chatId,
                userInput: userInput,
                chatHistory: chatHistory
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.AI.API_V1.GET_AI_V1_RESPONSE,
                payload
            );

            return response.data;
        } catch (error) {
            console.error('Error sending message to AI API:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            return null;
        }
    }
    /**
     * Send a message to the AI API V2 and get a response.
     * 
     * @param {string} agentId - The unique identifier for the agent (optional)
     * @param {string} modelName - The AI model to use (required)
     * @param {Array} messages - Array of message objects with role and content (required)
     * @returns {Promise<import('../types/ai.types').AIResponse|null>} - The API response or null if an error occurs
     */
    async sendMessageV2(agentId, modelName, messages) {
        try {
            if (!modelName) {
                console.error('Missing required parameter: modelName');
                return null;
            }

            if (!messages || !Array.isArray(messages) || messages.length === 0) {
                console.error('Valid messages array is required');
                return null;
            }
            
            const payload = {
                model: modelName,
                messages: messages,
                options: agentId ? { agentId: agentId } : {}
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.AI.API_V1.GET_AI_V2_RESPONSE,
                payload
            );

            return response.data;
        } catch (error) {
            console.error('Error sending message to AI API:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            return null;
        }
    }
}

export const aiService = new AIService();
