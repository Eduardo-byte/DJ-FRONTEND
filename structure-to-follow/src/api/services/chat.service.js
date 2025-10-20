import { ENDPOINTS, API_URL_KEY } from '../config/endpoints.js';
import { getAiConfig, getChatConfig } from '../../utils/chatUtils.js';
import axios from 'axios';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';

/**
 * Chat API service for handling chat operations.
 */
class ChatService {
    constructor() {
        // Demo API configuration
        this.demoApiKey = import.meta.env.VITE_CHAT_DEMO_API_KEY;
        this.demoApiUrl = 'https://make-api.onrender.com/api/v1/chat-widget/generate';
        this.demoAxiosInstance = axios.create({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'apiKey': this.demoApiKey
            }
        });
    }

    /**
     * Fetch chat IDs by client ID.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {Promise<{ unique_ids: string[], chat_ids: import('../types/chat.types').Chat[] }>|null} - Object containing an array of unique chat IDs and an array of chat objects, or null if an error occurs.
     */
    async fetchChatIds(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CHATS.READ_ALL_CHATS_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return {
                unique_ids: response.data.data.map(item => item.chat_id),
                chat_ids: response.data.data
            };
        } catch (error) {
            console.error("Error fetching chat IDs:", error);
            return null;
        }
    }

    /**
     * Generate a chat widget with AI configuration
     * 
     * @param {Object} formData - Form data containing agent configuration
     * @param {string} formData.agentGoal - The goal of the agent (Customer Support, Lead Generation, Appointment Setter)
     * @param {string} formData.botName - The name of the bot
     * @param {string} formData.company_services - Description of company services
     * @param {string} formData.intro_message - Custom introduction message (optional)
     * @param {string} formData.website_url - Company website URL (optional)
     * @param {Array} formData.qualification_questions - Array of qualification questions (for Lead Generation and Appointment Setter)
     * @param {string} clientId - The unique identifier of the client
     * @param {string} companyName - The name of the company
     * @returns {Promise<Object|null>} - The created chat widget configuration or null if an error occurs
     */
    // async generateChatWidget(formData, clientId, companyName) {
    //     // Validate input data
    //     if (!clientId || !companyName) {
    //         console.error("Missing required parameters: clientId or companyName");
    //         return null;
    //     }

    //     const { agentGoal, botName, company_services } = formData;

    //     // Handle different agent goals
    //     if (agentGoal === "Lead Generation" || agentGoal === "Appointment Setter") {
    //         // Convert qualification questions to question objects if they exist
    //         const questionObjects = formData.qualification_questions
    //             ? formData.qualification_questions.map(question => ({ name: question }))
    //             : [];

    //         // Construct the payload for the chat widget
    //         const chatWidgetPayload = {
    //             client_id: clientId,
    //             chat_config: getChatConfig(botName, companyName, formData.intro_message),
    //             ai_config: {},
    //             chat_type: "classic",
    //             is_form_deactivated: false,
    //             model_name: "gpt-4o",
    //             response_delay: 0,
    //             form_fields: "Email",
    //             extra_info: {
    //                 "bot_goal": {
    //                     "name": agentGoal,
    //                 },
    //                 "qualification_questions": questionObjects
    //             }
    //         };

    //         try {
    //             // Create the chat widget
    //             const response = await axiosInstance.post(
    //                 ENDPOINTS.CHATS.CREATE_AGENT,
    //                 chatWidgetPayload
    //             );

    //             if (response.data && response.data[0]?.chat_id) {
    //                 const chatId = response.data[0].chat_id;

    //                 // Define AI config based on agent goal
    //                 const aiConfig = getAiConfig(
    //                     agentGoal,
    //                     botName,
    //                     companyName,
    //                     company_services,
    //                     chatId,
    //                     clientId,
    //                     formData.website_url,
    //                     formData.qualification_questions
    //                 );

    //                 try {
    //                     // Generate AI configuration
    //                     const aiConfigResponse = await axiosInstance.post(
    //                         ENDPOINTS.CHATS.CREATE_AI_CONFIG.replace(':chatId', chatId),
    //                         aiConfig
    //                     );

    //                     if (aiConfigResponse.data) {
    //                         return aiConfigResponse.data;
    //                     }
    //                 } catch (error) {
    //                     console.error("Error in generating AI Config:", error);
    //                     if (error.response) {
    //                         console.error("Response data:", error.response.data);
    //                     }
    //                     return null;
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error in chat generation:", error);
    //             if (error.response) {
    //                 console.error("Response data:", error.response.data);
    //             }
    //             return null;
    //         }
    //     } else if (agentGoal === "Customer Support") {
    //         // Construct the payload for the chat widget
    //         const chatWidgetPayload = {
    //             client_id: clientId,
    //             chat_config: getChatConfig(botName, companyName, formData.intro_message),
    //             ai_config: {},
    //             chat_type: "classic",
    //             is_form_deactivated: false,
    //             model_name: "gpt-4o",
    //             response_delay: 0,
    //             form_fields: "Email",
    //             extra_info: {
    //                 "bot_goal": {
    //                     "name": agentGoal,
    //                 },
    //                 "qualification_questions": []
    //             }
    //         };

    //         try {
    //             // Create the chat widget
    //             const response = await axiosInstance.post(
    //                 ENDPOINTS.CHATS.CREATE_AGENT,
    //                 chatWidgetPayload
    //             );

    //             if (response.data) {
    //                 // Check if response.data is an array or an object with chat_info
    //                 const chatId = response.data[0]?.chat_id || response.data?.chat_info?.chat_id;

    //                 if (!chatId) {
    //                     console.error("No chat_id found in response:", response.data);
    //                     return null;
    //                 }

    //                 // Define AI config based on agent goal
    //                 const aiConfig = getAiConfig(
    //                     agentGoal,
    //                     botName,
    //                     companyName,
    //                     company_services,
    //                     chatId,
    //                     clientId,
    //                     formData.website_url,
    //                     null // Pass null for tableData since it's not needed for Customer Support
    //                 );

    //                 try {
    //                     // Generate AI configuration
    //                     const aiConfigResponse = await axiosInstance.post(
    //                         ENDPOINTS.CHATS.CREATE_AI_CONFIG.replace(':chatId', chatId),
    //                         aiConfig
    //                     );

    //                     if (aiConfigResponse.data) {
    //                         return aiConfigResponse.data;
    //                     }
    //                 } catch (error) {
    //                     console.error("Error in generating AI Config:", error);
    //                     if (error.response) {
    //                         console.error("Response data:", error.response.data);
    //                     }
    //                     return null;
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error in chat generation:", error);
    //             if (error.response) {
    //                 console.error("Response data:", error.response.data);
    //             }
    //             return null;
    //         }
    //     }

    //     return null;
    // }
    async generateChatWidget(formData, client_id, companyName) {
        // Validate input data
        if (!client_id || !companyName) {
            console.error("Missing required parameters: clientId or companyName");
            return null;
        }
        const response = await apiGatewayAxiosInstance.post(
            ENDPOINTS.CHATS.CREATE_AGENT, { formData, client_id, companyName })

        return response.data.data
    }


    /**
     * Delete an agent by its chat ID
     * 
     * @param {string} chatId - The unique identifier of the chat/agent to delete
     * @returns {Promise<boolean>} - True if the agent was successfully deleted, false otherwise
     */
    async deleteAgent(chatId) {
        //console.log(chatId);
        if (!chatId) {
            console.error("Missing required parameter: chatId");
            return false;
        }

        try {
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.CHATS.DELETE_AGENT.replace(':chatId', chatId)
            );
            return response.data.statusCode === 200;
        } catch (error) {
            console.error("Error deleting agent:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);
            }
            return false;
        }
    }

    /**
     * Update an agent by its chat ID
     * 
     * @param {string} chatId - The unique identifier of the chat/agent to update
     * @param {Object} updateData - Object containing the fields to update
     * @param {string} [updateData.client_id] - The client ID
     * @param {Object} [updateData.chat_config] - Chat configuration
     * @param {Object} [updateData.ai_config] - AI configuration
     * @param {string} [updateData.training_data_location] - Location of training data
     * @param {Array} [updateData.training_data] - Array of training data items
     * @param {string} [updateData.last_trained] - Date when the agent was last trained
     * @param {Object} [updateData.extra_info] - Additional information
     * @param {boolean} [updateData.is_form_deactivated] - Whether the form is deactivated
     * @param {string} [updateData.booking_link] - Booking link
     * @param {string} [updateData.model_name] - Model name
     * @param {number} [updateData.response_delay] - Response delay
     * @param {string} [updateData.chat_type] - Type of chat
     * @param {boolean} [updateData.status] - Status of the agent
     * @param {boolean} [updateData.web_search_tool] - Whether web search tool is enabled
     * @param {Object} [updateData.custom_tools] - Custom tools configuration (JSON object)
     * @returns {Promise<Object|null>} - The updated agent data or null if an error occurs
     */
    async updateAgent(chatId, updateData) {
        if (!chatId) {
            console.error("Missing required parameter: chatId");
            return null;
        }
        try {

            const response = await apiGatewayAxiosInstance.patch(
                ENDPOINTS.CHATS.UPDATE_AGENT.replace(':chatId', chatId),
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

    /**
     * Send a message to the chat API and get a response.
     * 
     * @param {string} chatId - The unique identifier for the chat session
     * @param {string} userInput - The user's message
     * @param {string} chatHistory - The history of the conversation
     * @returns {Promise<Object|null>} - The API response or null if an error occurs
     */
    async sendMessage(chatId, userInput, chatHistory = '') {
        try {
            if (!chatId || !userInput) {
                console.error('Missing required parameters: chatId or userInput');
                return null;
            }

            const payload = {
                chat_id: chatId,
                user_input: userInput,
                chat_history: chatHistory
            };

            const response = await this.demoAxiosInstance.post(this.demoApiUrl, payload);

            // Return the response directly, preserving the original structure
            return response.data;
        } catch (error) {
            console.error('Error sending message to chat API:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                if (error.response.data.detail) {
                    const detail = error.response.data.detail;
                    if (Array.isArray(detail) && detail[0]?.msg) {
                        console.error('Error message:', detail[0].msg);
                    }
                }
            }
            return null;
        }
    }

    /**
     * Format chat history into a string format expected by the API.
     * 
     * @param {Array} messages - Array of message objects with role and content
     * @returns {string} - Formatted chat history string
     */
    formatChatHistory(messages, user_input) {
        if (!messages || !Array.isArray(messages)) {
            return '';
        }

        const cleanMessages = messages.map(msg => {
            const role = msg.role === 'user' ? 'User' : 'Bot';
            return `${role}: ${msg.content}`;
        }).join('\n\n');


        return cleanMessages + "\n\n" + `User: ${user_input ? user_input : ""}`
    }

    async fetchChatbyId(chatId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CHATS.READ_CHATS_BY_CHAT_ID.replace(':chatId', chatId)
            );
            return response.data.data
        } catch (error) {
            console.error("Error fetching chat IDs:", error);
            return null;
        }
    }
}

export const chatService = new ChatService();
