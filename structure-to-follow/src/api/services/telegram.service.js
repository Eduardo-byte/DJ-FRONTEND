import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

class TelegramService {

    //Send an Agent message to Facebook
    async sendMessage(message, agentId, clientId, userId, channelId, channelName, messageId) {
        try {
            // Validate required fields
            if (!message || !agentId || !clientId || !userId) {
                console.error("Error: message, agentId, clientId, and userId are required to send a message");
                return {
                    success: false,
                    message: "message, agentId, clientId, and userId are required"
                };
            }

            const messageData = {
                message,
                agentId,
                clientId,
                userId,
                channelId,
                channelName,
                messageId
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.TELEGRAM.SEND_MESSAGE,
                messageData
            );

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

export const telegramService = new TelegramService();
