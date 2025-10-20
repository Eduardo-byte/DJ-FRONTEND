import { ENDPOINTS } from '../config/endpoints.js';
import apiGatewayAxiosInstance, { logError } from '../config/apiGatewayAxiosInstance.js';

/**
 * Metrics API service for handling metrics operations.
 */
class MetricsService {
    /**
     * Get message metrics for a specific client.
     * @param {string} clientId - The client ID to get metrics for.
     * @returns {Promise<import('../types/metrics.types').MessageMetrics|null>} - The message metrics or null if an error occurs.
     */
    async getMessageMetricsByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.METRICS.READ_MESSAGES_METRICS_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching message metrics:", error);
            return null;
        }
    }

    /**
     * Get comprehensive metrics for a specific client.
     * @param {string} clientId - The client ID to get metrics for.
     * @returns {Promise<import('../types/metrics.types').ComprehensiveMetrics|null>} - The comprehensive metrics or null if an error occurs.
     */
    async getComprehensiveMetricsByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.METRICS.READ_COMPREHENSIVE_METRICS_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching comprehensive metrics:", error);
            return null;
        }
    }

    /**
     * Get metrics for a specific chat.
     * @param {string} chatId - The chat ID to get metrics for.
     * @returns {Promise<import('../types/metrics.types').ChatMetrics|null>} - The chat metrics or null if an error occurs.
     */
    async getChatMetricsByChatId(chatId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.METRICS.READ_CHAT_METRICS_BY_CHAT_ID.replace(':chatId', chatId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching chat metrics:", error);
            return null;
        }
    }
}

export const metricsService = new MetricsService();
