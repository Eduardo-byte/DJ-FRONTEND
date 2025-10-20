import { ENDPOINTS, API_URL_KEY } from '../config/endpoints.js';
import axios from 'axios';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';

/**
 * Chat API service for handling chat operations.
 */
class WebhookService {

    /**
    * Fetches all chat configuration records for a given client ID.
    *
    * @param {string} clientId - The unique identifier of the client.
    * @returns {Promise<import('../types/webhook.types').Webhook[] | null>}
    * Returns an array of chat config objects, or null if an error occurs.
    */
    async createWebhook(webhookData) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBHOOK.CREATE_WEBHOOK,
                webhookData
            );

            return response.data.data;
        } catch (error) {
            console.error("Error fetching chat configs:", error);
            return null;
        }
    }

    /**
    * Fetches all chat configuration records for a given client ID.
    *
    * @param {string} clientId - The unique identifier of the client.
    * @returns {Promise<import('../types/webhook.types').Webhook[] | null>}
    * Returns an array of chat config objects, or null if an error occurs.
    */
    async fetchWebhookByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.WEBHOOK.READ_ALL_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching chat configs:", error);
            return null;
        }
    }


    /**
    * Updates a webhook by its ID.
    * 
    * @param {string} Id - The unique identifier of the webhook to update.
    * @param {UpdateWebhookPayload} updateData - Object containing the fields to update.
    * @returns {Promise<Webhook|null>} - The updated webhook data or null if an error occurs.
    */
    async updateWebhook(Id, updateData) {
        // console.log("Id", Id);
        // console.log("updateData", updateData);
        if (!Id) {
            console.error("Missing required parameter: chatId");
            return null;
        }

        try {

            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.WEBHOOK.UPDATE_WEBHOOK.replace(':id', Id),
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

export const webhookService = new WebhookService();
