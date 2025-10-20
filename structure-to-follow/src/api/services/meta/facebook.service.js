import { ENDPOINTS } from '../../config/endpoints.js';
import apiGatewayAxiosInstance, { logError } from '../../config/apiGatewayAxiosInstance.js';

// Import types
import '../../types/facebook.types.js';

/**
 * Facebook service for handling Facebook API operations.
 * This service provides methods for interacting with Facebook's platform,
 * including accessing user profiles, pages, messages, and managing thread control.
 */
class FacebookService {
    /**
     * Get the Facebook user profile.
     * 
     * @param {string} accessToken - The Facebook access token
     * @returns {Promise<import('../../types/facebook.types').FacebookProfileResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The Facebook profile response or an error response
     */
    async getProfile(accessToken) {
        try {
            // Validate required fields
            if (!accessToken) {
                console.error("Error: accessToken is required for getting Facebook profile");
                return {
                    success: false,
                    message: "Access token is required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.FACEBOOK.GET_PROFILE}?accessToken=${encodeURIComponent(accessToken)}`
            );

            //console.log("Facebook profile retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Facebook profile:", error);

            return {
                success: false,
                message: "Failed to get Facebook profile",
                details: error.message
            };
        }
    }

    /**
     * Get Facebook pages associated with a user.
     * 
     * @param {string} accessToken - The Facebook access token
     * @returns {Promise<import('../../types/facebook.types').FacebookPagesResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The Facebook pages response or an error response
     */
    async getPages(accessToken) {
        try {
            // Validate required fields
            if (!accessToken) {
                console.error("Error: accessToken is required for getting Facebook pages");
                return {
                    success: false,
                    message: "Access token is required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.FACEBOOK.GET_FB_PAGES}?accessToken=${encodeURIComponent(accessToken)}`
            );

            //console.log("Facebook pages retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Facebook pages:", error);

            return {
                success: false,
                message: "Failed to get Facebook pages",
                details: error.message
            };
        }
    }

    async getBusiness(accessToken) {
        try {
            // Validate required fields
            if (!accessToken) {
                console.error("Error: accessToken is required for getting Facebook pages");
                return {
                    success: false,
                    message: "Access token is required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.FACEBOOK.GET_FB_BUSINESS}?accessToken=${encodeURIComponent(accessToken)}`
            );

            //console.log("Facebook pages retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Facebook pages:", error);

            return {
                success: false,
                message: "Failed to get Facebook pages",
                details: error.message
            };
        }
    }

    async getBusinessPages(businessId, accessToken) {
        try {
            // Validate required fields
            if (!accessToken) {
                console.error("Error: accessToken is required for getting Facebook pages");
                return {
                    success: false,
                    message: "Access token is required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.FACEBOOK.GET_FB_BUSINESS_PAGES}?accessToken=${encodeURIComponent(accessToken)}&businessId=${businessId}`
            );

            //console.log("Facebook pages retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Facebook pages:", error);

            return {
                success: false,
                message: "Failed to get Facebook pages",
                details: error.message
            };
        }
    }

    /**
     * Get messages from a Facebook conversation.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} conversationId - The Facebook conversation ID
     * @returns {Promise<import('../../types/facebook.types').FacebookMessagesResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The Facebook messages response or an error response
     */
    async getMessages(accessToken, conversationId) {
        try {
            // Validate required fields
            if (!accessToken || !conversationId) {
                console.error("Error: accessToken and conversationId are required for getting Facebook messages");
                return {
                    success: false,
                    message: "Access token and conversation ID are required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.FACEBOOK.GET_MESSAGES_BY_CONVERSATION_ID}?accessToken=${encodeURIComponent(accessToken)}&conversationId=${encodeURIComponent(conversationId)}`
            );

            //console.log("Facebook messages retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Facebook messages:", error);

            return {
                success: false,
                message: "Failed to get Facebook messages",
                details: error.message
            };
        }
    }

    /**
     * Get information about a Facebook message sender.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} userId - The Facebook user ID
     * @returns {Promise<import('../../types/facebook.types').FacebookUserResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The Facebook user response or an error response
     */
    async getMessageSender(accessToken, userId) {
        try {
            // Validate required fields
            if (!accessToken || !userId) {
                console.error("Error: accessToken and userId are required for getting Facebook message sender");
                return {
                    success: false,
                    message: "Access token and user ID are required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.FACEBOOK.GET_MESSAGES_SENDER_PROFILE}?accessToken=${encodeURIComponent(accessToken)}&userId=${encodeURIComponent(userId)}`
            );

            //console.log("Facebook message sender retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Facebook message sender:", error);

            return {
                success: false,
                message: "Failed to get Facebook message sender",
                details: error.message
            };
        }
    }

    /**
     * Take control of a Facebook Messenger conversation thread.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} pageId - The Facebook page ID
     * @param {string} userId - The Facebook user ID
     * @param {string} [metadata] - Optional metadata about the thread control
     * @returns {Promise<import('../../types/facebook.types').FacebookThreadControlResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The thread control response or an error response
     */
    async takeThreadControl(accessToken, pageId, userId, metadata = "") {
        try {
            // Validate required fields
            if (!accessToken || !pageId || !userId) {
                console.error("Error: accessToken, pageId, and userId are required for taking thread control");
                return {
                    success: false,
                    message: "Access token, page ID, and user ID are required"
                };
            }

            const threadControlData = {
                accessToken,
                pageId,
                userId,
                metadata
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.FACEBOOK.TAKE_THREAD_CONTROL,
                threadControlData
            );

            //console.log("Facebook thread control taken successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error taking Facebook thread control:", error);

            return {
                success: false,
                message: "Failed to take thread control",
                details: error.message
            };
        }
    }

    /**
     * Take control of a Facebook Messenger conversation thread and send a message.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} pageId - The Facebook page ID
     * @param {string} userId - The Facebook user ID
     * @param {string} message - The message to send
     * @returns {Promise<import('../../types/facebook.types').FacebookMessageResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The message response or an error response
     */
    async takeThreadControlAndSendMessage(accessToken, pageId, userId, message) {
        try {
            // Validate required fields
            if (!accessToken || !pageId || !userId || !message) {
                console.error("Error: accessToken, pageId, userId, and message are required for taking thread control and sending a message");
                return {
                    success: false,
                    message: "Access token, page ID, user ID, and message are required"
                };
            }

            const messageData = {
                accessToken,
                pageId,
                userId,
                message
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.FACEBOOK.CREATE_MESSAGE,
                messageData
            );

            //console.log("Facebook message sent successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error sending Facebook message:", error);

            return {
                success: false,
                message: "Failed to send message",
                details: error.message
            };
        }
    }

    /**
     * Send a message with an attachment to a Facebook conversation.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} pageId - The Facebook page ID
     * @param {string} recipientId - The recipient user ID
     * @param {import('../../types/facebook.types').FacebookAttachment} attachment - The attachment to send
     * @returns {Promise<import('../../types/facebook.types').FacebookMessageResponse|import('../../types/facebook.types').FacebookErrorResponse>} - The message response or an error response
     */
    async sendAttachment(accessToken, pageId, recipientId, attachment) {
        try {
            // Validate required fields
            if (!accessToken || !pageId || !recipientId || !attachment) {
                console.error("Error: accessToken, pageId, recipientId, and attachment are required for sending an attachment");
                return {
                    success: false,
                    message: "Access token, page ID, recipient ID, and attachment are required"
                };
            }

            if (!attachment.type || !attachment.url) {
                console.error("Error: attachment must have type and url properties");
                return {
                    success: false,
                    message: "Attachment must have type and url properties"
                };
            }

            const attachmentData = {
                accessToken,
                pageId,
                recipientId,
                attachment
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.FACEBOOK.CREATE_ATTACHMENT_MESSAGE,
                attachmentData
            );

            //console.log("Facebook attachment sent successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error sending Facebook attachment:", error);

            return {
                success: false,
                message: "Failed to send attachment",
                details: error.message
            };
        }
    }

    //Send an Agent message to Facebook
    async sendMessage(message, agentId, clientId, userId, instagram) {
        try {
            // Validate required fields
            if (!message || !agentId || !clientId || !userId) {
                console.error("Error: message, agentId, clientId, and userId are required to send a message");
                return {
                    success: false,
                    message: "message, agentId, clientId, and userId are required"
                };
            }
            const directMode = true
            const messageData = {
                directMode,
                message,
                agentId,
                clientId,
                userId,
                instagram
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.FACEBOOK.SEND_MESSAGE,
                messageData
            );

            //console.log("Facebook attachment sent successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error sending Facebook attachment:", error);

            return {
                success: false,
                message: "Failed to send attachment",
                details: error.message
            };
        }
    }
}

export const facebookService = new FacebookService();
