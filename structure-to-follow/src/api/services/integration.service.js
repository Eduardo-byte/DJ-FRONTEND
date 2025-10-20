import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

// Import types
import '../types/integration.types.js';

/**
 * Available integration types
 * @enum {string}
 */
export const INTEGRATION_TYPES = {
    CHAT_WIDGET: 'chat-widget',
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    TWITTER: 'twitter',
    TELEGRAM: 'telegram',
    LINKEDIN: 'linkedin',
    EMAIL: 'email',
    SMS: 'sms',
    TEAM: 'team'
};

/**
 * Integration API service for handling social media integrations.
 * This service provides methods to create, read, update, and delete integration records
 * for various social media platforms.
 */
class IntegrationService {
    /**
     * Create a new integration.
     * 
     * @param {import('../types/integration.types').CreateIntegrationPayload} integrationData - The data for the new integration
     * @returns {Promise<import('../types/integration.types').Integration|null>} - The created integration or null if an error occurs
     */
    async createIntegration(integrationData) {
        try {
            // Validate required fields
            if (!integrationData.client_id) {
                console.error("Error: client_id is required for creating an integration");
                throw new Error("client_id is required");
            }

            if (!integrationData.chat_id) {
                console.error("Error: chat_id is required for creating an integration");
                throw new Error("chat_id is required");
            }

            if (!integrationData.integration_type || !Array.isArray(integrationData.integration_type) || integrationData.integration_type.length === 0) {
                console.error("Error: integration_type must be a non-empty array");
                throw new Error("integration_type must be a non-empty array");
            }

            //console.log("Creating integration with data:", JSON.stringify(integrationData, null, 2));

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.INTEGRATIONS.CREATE_INTEGRATION,
                integrationData
            );

            //console.log("Integration created successfully:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("Error creating integration:", error);
            console.error("Integration creation failed with data:", JSON.stringify(integrationData, null, 2));
            return null;
        }
    }

    /**
     * Get all integrations for a specific agent/chat.
     * 
     * @param {string} agentId - The unique identifier of the agent/chat
     * @returns {Promise<import('../types/integration.types').Integration[]|null>} - Array of integrations or null if an error occurs
     */
    async getIntegrationsByAgentId(agentId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.INTEGRATIONS.GET_INTEGRATIONS_BY_AGENT_ID.replace(':agentId', agentId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integrations by agent ID:", error);
            return null;
        }
    }

    async getIntegrationsByRefCode(refCode) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.INTEGRATIONS.GET_INTEGRATION_BY_REF_CODE.replace(':refCode', refCode)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integrations by agent ID:", error);
            return null;
        }
    }

    async getIntegrationsByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.INTEGRATIONS.GET_INTEGRATIONS_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integrations by agent ID:", error);
            return null;
        }
    }

    /**
     * Get a specific integration by its ID.
     * 
     * @param {string} integrationId - The unique identifier of the integration
     * @returns {Promise<import('../types/integration.types').Integration|null>} - The integration object or null if an error occurs
     */
    async getIntegrationById(integrationId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.INTEGRATIONS.GET_INTEGRATION_BY_ID.replace(':id', integrationId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integration by ID:", error);
            return null;
        }
    }

    /**
     * Update an existing integration.
     * 
     * @param {string} integrationId - The unique identifier of the integration to update
     * @param {import('../types/integration.types').UpdateIntegrationPayload} updateData - The data to update
     * @returns {Promise<import('../types/integration.types').Integration|null>} - The updated integration or null if an error occurs
     */
    async updateIntegration(integrationId, updateData) {
        try {
            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.SOCIAL.INTEGRATIONS.UPDATE_INTEGRATION_BY_ID.replace(':id', integrationId),
                updateData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating integration:", error);
            return null;
        }
    }

    /**
     * Delete a specific integration by its ID.
     * 
     * @param {string} integrationId - The unique identifier of the integration to delete
     * @returns {Promise<Object|null>} - The deletion result or null if an error occurs
     */
    async deleteIntegration(integrationId) {
        try {
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.SOCIAL.INTEGRATIONS.DELETE_INTEGRATION_BY_ID.replace(':id', integrationId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error deleting integration:", error);
            return null;
        }
    }

    /**
     * Delete all integrations for a specific agent/chat.
     * 
     * @param {string} agentId - The unique identifier of the agent/chat
     * @returns {Promise<Object|null>} - The deletion result or null if an error occurs
     */
    async deleteIntegrationsByAgentId(agentId) {
        try {
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.SOCIAL.INTEGRATIONS.DELETE_INTEGRATIONS_BY_AGENT_ID.replace(':agentId', agentId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error deleting integrations by agent ID:", error);
            return null;
        }
    }

    /**
     * Get all integrations for a specific client by querying with a client ID.
     * This uses the query parameter approach mentioned in the documentation.
     * 
     * @param {string} clientId - The unique identifier of the client
     * @returns {Promise<import('../types/integration.types').Integration[]|null>} - Array of integrations or null if an error occurs
     */
    async getIntegrationsByClientId(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.INTEGRATIONS.CREATE_INTEGRATION}?clientId=${clientId}`
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integrations by client ID:", error);
            return null;
        }
    }

    /**
     * Get all integrations for a specific client using the path parameter approach.
     * This is an alternative endpoint mentioned in the documentation.
     * 
     * @param {string} clientId - The unique identifier of the client
     * @returns {Promise<import('../types/integration.types').Integration[]|null>} - Array of integrations or null if an error occurs
     */
    async getIntegrationsByClientIdPath(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.INTEGRATIONS.CREATE_INTEGRATION}/client/${clientId}`
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching integrations by client ID (path):", error);
            return null;
        }
    }

    /**
     * Helper method to create an array of integration types in the correct format.
     * 
     * @param {string|string[]} types - Single integration type or array of integration types
     * @returns {import('../types/integration.types').IntegrationType[]} - Properly formatted array of integration types
     * @example
     * // Returns [{ type: "facebook" }]
     * integrationService.createIntegrationTypes("facebook");
     * 
     * @example
     * // Returns [{ type: "facebook" }, { type: "instagram" }]
     * integrationService.createIntegrationTypes(["facebook", "instagram"]);
     * 
     * @example
     * // Returns [{ type: "facebook" }, { type: "instagram" }]
     * integrationService.createIntegrationTypes([INTEGRATION_TYPES.FACEBOOK, INTEGRATION_TYPES.INSTAGRAM]);
     */
    createIntegrationTypes(types) {
        if (!types) {
            return [];
        }

        if (typeof types === 'string') {
            return [{ type: types }];
        }

        if (Array.isArray(types)) {
            // Check if the array already contains objects with a 'type' property
            if (types.length > 0 && typeof types[0] === 'object' && types[0].type) {
                return types;
            }

            // Otherwise, convert each string to an object with a 'type' property
            return types.map(type => ({ type }));
        }

        // If it's already an object with a 'type' property, wrap it in an array
        if (typeof types === 'object' && types.type) {
            return [types];
        }

        return [];
    }
}

export const integrationService = new IntegrationService();
