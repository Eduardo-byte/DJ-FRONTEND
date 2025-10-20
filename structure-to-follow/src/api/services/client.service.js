import { ENDPOINTS } from '../config/endpoints.js';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';

/**
 * Client API service for handling client operations.
 */
class ClientService {
    /**
     * Fetch client data by authenticated ID.
     * @param {string} audId - The authenticated ID of the client.
     * @returns {Promise<import('../types/client.types').Client|null>} - The client data or null if an error occurs.
     */
    async fetchClientDataByAudId(audId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CLIENTS.READ_BY_AUD_ID.replace(':audId', audId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching client data:", error);
            return null;
        }
    }

    /**
     * Fetch client data by client ID.
     * @param {string} clientId - The unique identifier of the client.
     * @returns {Promise<import('../types/client.types').Client|null>} - The client data or null if an error occurs.
     */
    async fetchClientData(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CLIENTS.READ_BY_CLIENT_ID.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching client data:", error);
            return null;
        }
    }

    /**
     * Fetch all clients.
     * @returns {Promise<import('../types/client.types').Client[]|null>} - An array of client data or null if an error occurs.
     */
    async fetchAllClients() {
        try {
            const response = await apiGatewayAxiosInstance.get(ENDPOINTS.CLIENTS.READ_ALL_CLIENTS);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching client data:", error);
            return null;
        }
    }

    /**
     * Fetch client data by email.
     * @param {string} email - The email address of the client.
     * @returns {Promise<import('../types/client.types').ClientByEmailResponse|null>} - The client data response or null if an error occurs.
     */
    async fetchClientDataByEmail(email) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.CLIENTS.READ_BY_CLIENT_EMAIL.replace(':email', encodeURIComponent(email))
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching client data by email:", error);
            return null;
        }
    }

    /**
     * Update client information.
     * @param {string} client_id - The unique identifier of the client to update.
     * @param {import('../types/client.types').UpdateClientPayload} updatedData - The data to update the client with.
     * @returns {Promise<import('../types/client.types').Client|null|{error: any}>} - The updated client data, or an error object if the update fails.
     */
    async updateClientInfo(client_id, updatedData) {
        try {
            const response = await apiGatewayAxiosInstance.patch(
                ENDPOINTS.CLIENTS.UPDATE_CLIENT.replace(":clientId", client_id),
                updatedData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating client information:", error);
            return { error: error };
        }
    }

    /**
     * Create a client by email and password (registration).
     * @param {Object} payload - The client creation payload (should include email, password, and client info).
     * @returns {Promise<import('../types/client.types').Client|null|{error: any}>}
     */
    async createClientByEmailAndPassword(payload) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.CLIENTS.CREATE_CLIENT_BY_EMAIL_PASSWORD,
                payload
            );
            return response.data.data;
        } catch (error) {
            console.error("Error creating client by email and password:", error);
            return { error };
        }
    }

    /**
     * Insert a client record directly (OAuth registration).
     * @param {import('../types/client.types').CreateClientPayload} payload - The client data to insert.
     * @returns {Promise<import('../types/client.types').Client|null|{error: any}>}
     */
    async insertClient(payload) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.CLIENTS.INSERT_CLIENT,
                payload
            );
            return response.data.data;
        } catch (error) {
            console.error("Error inserting client:", error);
            return { error };
        }
    }
}

export const clientService = new ClientService();
