import { ENDPOINTS } from '../../config/endpoints.js';
import apiGatewayAxiosInstance, { logError } from '../../config/apiGatewayAxiosInstance.js';

// Import types
import '../../types/instagram.types.js';

/**
 * Instagram service for handling Instagram API operations.
 * This service provides methods for interacting with Instagram's platform through the Meta Graph API,
 * including accessing Instagram Business accounts, profiles, media, messages, and managing thread control.
 */
class InstagramService {
    /**
     * Get Instagram Business Accounts connected to a Facebook page.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} pageId - The Facebook page ID
     * @returns {Promise<import('../../types/instagram.types').InstagramAccountsResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The Instagram accounts response or an error response
     */
    async getAccounts(accessToken, pageId) {
        try {
            // Validate required fields
            if (!accessToken || !pageId) {
                console.error("Error: accessToken and pageId are required for getting Instagram accounts");
                return {
                    success: false,
                    message: "Access token and page ID are required"
                };
            }

            const RequestUrl = `${ENDPOINTS.SOCIAL.META.INSTAGRAM.GET_ACCOUNTS}?accessToken=${encodeURIComponent(accessToken)}&pageId=${pageId}`
            const response = await apiGatewayAxiosInstance.get(
                RequestUrl
            );

            //console.log("Instagram accounts retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Instagram accounts:", error);

            return {
                success: false,
                message: "Failed to get Instagram accounts",
                details: error.message
            };
        }
    }

    /**
     * Get profile information for an Instagram Business Account.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} instagramBusinessAccountId - The Instagram Business Account ID
     * @returns {Promise<import('../../types/instagram.types').InstagramProfileResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The Instagram profile response or an error response
     */
    async getProfile(accessToken, instagramBusinessAccountId) {
        try {
            // Validate required fields
            if (!accessToken || !instagramBusinessAccountId) {
                console.error("Error: accessToken and instagramBusinessAccountId are required for getting Instagram profile");
                return {
                    success: false,
                    message: "Access token and Instagram Business Account ID are required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.INSTAGRAM.GET_PROFILE}?accessToken=${encodeURIComponent(accessToken)}&instagramBusinessAccountId=${encodeURIComponent(instagramBusinessAccountId)}`
            );

            //console.log("Instagram profile retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Instagram profile:", error);

            return {
                success: false,
                message: "Failed to get Instagram profile",
                details: error.message
            };
        }
    }

    /**
     * Get media items (posts) for an Instagram Business Account.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} instagramBusinessAccountId - The Instagram Business Account ID
     * @returns {Promise<import('../../types/instagram.types').InstagramMediaResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The Instagram media response or an error response
     */
    async getMedia(accessToken, instagramBusinessAccountId) {
        try {
            // Validate required fields
            if (!accessToken || !instagramBusinessAccountId) {
                console.error("Error: accessToken and instagramBusinessAccountId are required for getting Instagram media");
                return {
                    success: false,
                    message: "Access token and Instagram Business Account ID are required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.INSTAGRAM.GET_IG_MEDIA}?accessToken=${encodeURIComponent(accessToken)}&instagramBusinessAccountId=${encodeURIComponent(instagramBusinessAccountId)}`
            );

            //console.log("Instagram media retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Instagram media:", error);

            return {
                success: false,
                message: "Failed to get Instagram media",
                details: error.message
            };
        }
    }

    /**
     * Get messages from an Instagram conversation.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} conversationId - The Instagram conversation ID
     * @returns {Promise<import('../../types/instagram.types').InstagramMessagesResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The Instagram messages response or an error response
     */
    async getMessages(accessToken, conversationId) {
        try {
            // Validate required fields
            if (!accessToken || !conversationId) {
                console.error("Error: accessToken and conversationId are required for getting Instagram messages");
                return {
                    success: false,
                    message: "Access token and conversation ID are required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.INSTAGRAM.GET_MESSAGES_BY_CONVERSATION_ID}?accessToken=${encodeURIComponent(accessToken)}&conversationId=${encodeURIComponent(conversationId)}`
            );

            //console.log("Instagram messages retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Instagram messages:", error);

            return {
                success: false,
                message: "Failed to get Instagram messages",
                details: error.message
            };
        }
    }

    /**
     * Get information about an Instagram message sender.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} userId - The Instagram user ID
     * @returns {Promise<import('../../types/instagram.types').InstagramUserResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The Instagram user response or an error response
     */
    async getMessageSender(accessToken, userId) {
        try {
            // Validate required fields
            if (!accessToken || !userId) {
                console.error("Error: accessToken and userId are required for getting Instagram message sender");
                return {
                    success: false,
                    message: "Access token and user ID are required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.INSTAGRAM.GET_MESSAGES_SENDER_PROFILE}?accessToken=${encodeURIComponent(accessToken)}&userId=${encodeURIComponent(userId)}`
            );

            //console.log("Instagram message sender retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Instagram message sender:", error);

            return {
                success: false,
                message: "Failed to get Instagram message sender",
                details: error.message
            };
        }
    }

    /**
     * Take control of an Instagram Messenger conversation thread.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} instagramBusinessAccountId - The Instagram Business Account ID
     * @param {string} userId - The Instagram user ID
     * @returns {Promise<import('../../types/instagram.types').InstagramThreadControlResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The thread control response or an error response
     */
    async takeThreadControl(accessToken, instagramBusinessAccountId, userId) {
        try {
            // Validate required fields
            if (!accessToken || !instagramBusinessAccountId || !userId) {
                console.error("Error: accessToken, instagramBusinessAccountId, and userId are required for taking thread control");
                return {
                    success: false,
                    message: "Access token, Instagram Business Account ID, and user ID are required"
                };
            }

            const threadControlData = {
                accessToken,
                instagramBusinessAccountId,
                userId
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.INSTAGRAM.TAKE_THREAD_CONTROL,
                threadControlData
            );

            //console.log("Instagram thread control taken successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error taking Instagram thread control:", error);

            return {
                success: false,
                message: "Failed to take thread control",
                details: error.message
            };
        }
    }

    /**
     * Take control of an Instagram Messenger conversation thread and send a message.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} instagramBusinessAccountId - The Instagram Business Account ID
     * @param {string} userId - The Instagram user ID
     * @param {string} message - The message to send
     * @returns {Promise<import('../../types/instagram.types').InstagramMessageResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The message response or an error response
     */
    async takeThreadControlAndSendMessage(accessToken, instagramBusinessAccountId, userId, message) {
        try {
            // Validate required fields
            if (!accessToken || !instagramBusinessAccountId || !userId || !message) {
                console.error("Error: accessToken, instagramBusinessAccountId, userId, and message are required for taking thread control and sending a message");
                return {
                    success: false,
                    message: "Access token, Instagram Business Account ID, user ID, and message are required"
                };
            }

            const messageData = {
                accessToken,
                instagramBusinessAccountId,
                userId,
                message
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.INSTAGRAM.CREATE_MESSAGE,
                messageData
            );

            //console.log("Instagram message sent successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error sending Instagram message:", error);

            return {
                success: false,
                message: "Failed to send message",
                details: error.message
            };
        }
    }

    /**
     * Send a message with an attachment to an Instagram conversation.
     * 
     * @param {string} accessToken - The Facebook access token
     * @param {string} instagramBusinessAccountId - The Instagram Business Account ID
     * @param {string} recipientId - The recipient user ID
     * @param {import('../../types/instagram.types').InstagramAttachment} attachment - The attachment to send
     * @returns {Promise<import('../../types/instagram.types').InstagramMessageResponse|import('../../types/instagram.types').InstagramErrorResponse>} - The message response or an error response
     */
    async sendAttachment(accessToken, instagramBusinessAccountId, recipientId, attachment) {
        try {
            // Validate required fields
            if (!accessToken || !instagramBusinessAccountId || !recipientId || !attachment) {
                console.error("Error: accessToken, instagramBusinessAccountId, recipientId, and attachment are required for sending an attachment");
                return {
                    success: false,
                    message: "Access token, Instagram Business Account ID, recipient ID, and attachment are required"
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
                instagramBusinessAccountId,
                recipientId,
                attachment
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.INSTAGRAM.CREATE_ATTACHMENT_MESSAGE,
                attachmentData
            );

            //console.log("Instagram attachment sent successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error sending Instagram attachment:", error);

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
                ENDPOINTS.SOCIAL.META.INSTAGRAM.SEND_MESSAGE,
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

export const instagramService = new InstagramService();
