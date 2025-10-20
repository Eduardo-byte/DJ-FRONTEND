import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

/**
 * API Key service for handling API key operations.
 */
class ApiKeyService {
    /**
     * Fetch all API keys for a given client.
     * @param {string} clientId - The client identifier.
     * @returns {Promise<import('../types/apikey.types').ApiKey[] | null>} A promise that resolves to an array of API keys or null if an error occurs.
     */
    async fetchAllApiKeys(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS.READ_ALL_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            console.log("API Keys Response:", response.data.data);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching API keys:", error);
            return null;
        }
    }

    /**
     * Fetch API key by ID.
     * @param {string} apiKeyId - The API key identifier.
     * @returns {Promise<import('../types/apikey.types').ApiKey[] | null>} A promise that resolves to an array of API keys or null if an error occurs.
     */
    async fetchApiKeyById(apiKeyId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS.READ_BY_APIKEY_ID.replace(':apiKeyId', apiKeyId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching API key by ID:", error);
            return null;
        }
    }

    /**
     * Generate a new API key for a client.
     * @param {import('../types/apikey.types').CreateApiKeyPayload} keyData - The API key creation data.
     * @returns {Promise<import('../types/apikey.types').ApiKey | null>} A promise that resolves to the created API key or null if an error occurs.
     */
    async generateApiKey(keyData) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.API_KEYS.CREATE_API_KEY,
                keyData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error generating API key:", error);
            return null;
        }
    }

    /**
     * Update an API key by ID.
     * @param {string} keyId - The unique identifier of the API key.
     * @param {import('../types/apikey.types').UpdateApiKeyPayload} updateData - The update data for the API key.
     * @returns {Promise<import('../types/apikey.types').ApiKey | null>} A promise that resolves to the updated API key data or null if an error occurs.
     */
    async updateApiKey(keyId, updateData) {
        try {
            const response = await apiGatewayAxiosInstance.patch(
                ENDPOINTS.API_KEYS.UPDATE_API_KEY.replace(':apiKeyId', keyId),
                updateData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating API key:", error);
            return null;
        }
    }

    /**
     * Delete an API key by ID (soft delete by default).
     * @param {string} keyId - The unique identifier of the API key.
     * @param {boolean} [hardDelete=false] - If true, performs hard delete (permanent removal). Default is false (soft delete/deactivation).
     * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful or false if an error occurs.
     */
    async deleteApiKey(keyId, hardDelete = false) {
        try {
            const url = ENDPOINTS.API_KEYS.DELETE_API_KEY.replace(':apiKeyId', keyId);
            const params = hardDelete ? { hard: 'true' } : { hard: 'false' };
            
            await apiGatewayAxiosInstance.delete(url, { params });
            return true;
        } catch (error) {
            console.error("Error deleting API key:", error);
            return false;
        }
    }

    /**
     * Regenerate an existing API key.
     * @param {string} keyId - The unique identifier of the API key.
     * @returns {Promise<import('../types/apikey.types').ApiKey | null>} A promise that resolves to the regenerated API key or null if an error occurs.
     */
    async regenerateApiKey(keyId) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.API_KEYS.REGENERATE_API_KEY.replace(':apiKeyId', keyId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error regenerating API key:", error);
            return null;
        }
    }
}

export const apiKeyService = new ApiKeyService();
