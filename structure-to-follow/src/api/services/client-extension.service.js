import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

// Import types
import '../types/client-extension.types.js';

/**
 * Client Extension service for handling client extension operations.
 * This service provides methods for creating, reading, updating, and deleting client extensions,
 * which link clients to available extensions.
 */
class ClientExtensionService {
    /**
     * Get all client extensions for a specific client.
     * 
     * @param {string} clientId - The client ID
     * @returns {Promise<import('../types/client-extension.types').ClientExtensionsResponse|import('../types/client-extension.types').ClientExtensionErrorResponse>} - The client extensions response or an error response
     */
    async getClientExtensionsByClientId(clientId) {
        try {
            // Validate required fields
            if (!clientId) {
                console.error("Error: clientId is required for getting client extensions");
                return {
                    status: "error",
                    code: 400,
                    message: "Client ID is required"
                };
            }

            // Check if the ID looks like a UUID (basic validation)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(clientId)) {
                console.error(`Error: Invalid client ID format: ${clientId}`);
                return {
                    status: "error",
                    code: 400,
                    message: "Invalid client ID format"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.META.CLIENT_EXTENSIONS.GET_CLIENT_EXTENSION_BY_CLIENT_ID.replace(':clientId', clientId)
            );

            //console.log("Client extensions retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving client extensions:", error);

            return {
                status: "error",
                code: 500,
                message: "Failed to get client extensions by client ID",
                details: error.message
            };
        }
    }

    /**
     * Get a specific client extension by its ID.
     * 
     * @param {string} id - The client extension ID
     * @returns {Promise<import('../types/client-extension.types').ClientExtensionResponse|import('../types/client-extension.types').ClientExtensionErrorResponse>} - The client extension response or an error response
     */
    async getClientExtensionById(id) {
        try {
            // Validate required fields
            if (!id) {
                console.error("Error: id is required for getting a client extension");
                return {
                    status: "error",
                    code: 400,
                    message: "Client extension ID is required"
                };
            }

            // Check if the ID looks like a UUID (basic validation)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                console.error(`Error: Invalid client extension ID format: ${id}`);
                return {
                    status: "error",
                    code: 400,
                    message: "Invalid client extension ID format"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.META.CLIENT_EXTENSIONS.GET_CLIENT_EXTENSION_BY_ID.replace(':id', id)
            );

            //console.log("Client extension retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving client extension:", error);

            if (error.response && error.response.status === 404) {
                return {
                    status: "error",
                    code: 404,
                    message: `Client extension with ID ${id} not found`
                };
            }

            return {
                status: "error",
                code: 500,
                message: "Failed to get client extension by ID",
                details: error.message
            };
        }
    }

    /**
     * Create a new client extension.
     * 
     * @param {import('../types/client-extension.types').CreateClientExtensionPayload} clientExtensionData - The client extension data
     * @returns {Promise<import('../types/client-extension.types').ClientExtensionResponse|import('../types/client-extension.types').ClientExtensionErrorResponse>} - The created client extension response or an error response
     */
    async createClientExtension(clientExtensionData) {
        try {
            // Validate required fields
            // client_id is optional for some extension types like widgets
            if (!clientExtensionData.client_id && clientExtensionData.extension_name !== "widget") {
                console.error("Error: client_id is required for creating a client extension");
                return {
                    status: "error",
                    code: 400,
                    message: "client_id is required for non-widget extensions"
                };
            }

            // If client_id is provided, validate it's a UUID
            if (clientExtensionData.client_id) {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(clientExtensionData.client_id)) {
                    console.error(`Error: Invalid client ID format: ${clientExtensionData.client_id}`);
                    return {
                        status: "error",
                        code: 400,
                        message: "Invalid client ID format"
                    };
                }
            }

            if (!clientExtensionData.extension_name) {
                console.error("Error: extension_name is required for creating a client extension");
                return {
                    status: "error",
                    code: 400,
                    message: "extension_name is required"
                };
            }


            // Make sure we're not sending extension_id as it's determined by the server based on extension_name
            const payloadToSend = { ...clientExtensionData };
            delete payloadToSend.extension_id;
            //console.log("\n\nSENDING PAYLOAD: ", payloadToSend)

            //console.log("Creating client extension:", payloadToSend);

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.CLIENT_EXTENSIONS.CREATE_CLIENT_EXTENSION,
                payloadToSend
            );

            //console.log("Client extension created successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error creating client extension:", error);

            if (error.response && error.response.status === 400) {
                return {
                    status: "error",
                    code: 400,
                    message: error.response.data.message || "Invalid client extension data"
                };
            }

            return {
                status: "error",
                code: 500,
                message: "Failed to create client extension",
                details: error.message
            };
        }
    }

    /**
     * Update an existing client extension.
     * 
     * @param {string} id - The client extension ID
     * @param {import('../types/client-extension.types').UpdateClientExtensionPayload} updateData - The update data
     * @returns {Promise<import('../types/client-extension.types').ClientExtensionResponse|import('../types/client-extension.types').ClientExtensionErrorResponse>} - The updated client extension response or an error response
     */
    async updateClientExtension(id, updateData) {
        try {
            // Validate required fields
            if (!id) {
                console.error("Error: id is required for updating a client extension");
                return {
                    status: "error",
                    code: 400,
                    message: "Client extension ID is required"
                };
            }

            // Check if the ID looks like a UUID (basic validation)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                console.error(`Error: Invalid client extension ID format: ${id}`);
                return {
                    status: "error",
                    code: 400,
                    message: "Invalid client extension ID format"
                };
            }

            // Make sure we're not sending extension_id as it's determined by the server
            const payloadToSend = { ...updateData };
            delete payloadToSend.extension_id;

            //console.log("Updating client extension:", id, payloadToSend);

            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.SOCIAL.META.CLIENT_EXTENSIONS.UPDATE_CLIENT_EXTENSION_BY_ID.replace(':id', id),
                payloadToSend
            );

            //console.log("Client extension updated successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error updating client extension:", error);

            if (error.response && error.response.status === 404) {
                return {
                    status: "error",
                    code: 404,
                    message: `Client extension with ID ${id} not found`
                };
            }

            if (error.response && error.response.status === 400) {
                return {
                    status: "error",
                    code: 400,
                    message: error.response.data.message || "Invalid client extension data"
                };
            }

            return {
                status: "error",
                code: 500,
                message: "Failed to update client extension",
                details: error.message
            };
        }
    }

    /**
     * Get the decrypted token for a client extension.
     * 
     * @param {string} id - The client extension ID
     * @returns {Promise<{token: string}|import('../types/client-extension.types').ClientExtensionErrorResponse>} - The decrypted token or an error response
     */
    async getDecryptedToken(id) {
        try {
            // Validate required fields
            if (!id) {
                console.error("Error: id is required for getting a decrypted token");
                return {
                    status: "error",
                    code: 400,
                    message: "Client extension ID is required"
                };
            }

            // Check if the ID looks like a UUID (basic validation)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                console.error(`Error: Invalid client extension ID format: ${id}`);
                return {
                    status: "error",
                    code: 400,
                    message: "Invalid client extension ID format"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.CLIENT_EXTENSIONS.GET_CLIENT_EXTENSION_BY_ID.replace(':id', id)}/token`
            );

            //console.log("Decrypted token retrieved successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving decrypted token:", error);

            if (error.response && error.response.status === 404) {
                return {
                    status: "error",
                    code: 404,
                    message: `Token not found for client extension with ID ${id}`
                };
            }

            return {
                status: "error",
                code: 500,
                message: "Failed to get decrypted token",
                details: error.message
            };
        }
    }

    /**
     * Delete a client extension.
     * 
     * @param {string} id - The client extension ID
     * @returns {Promise<import('../types/client-extension.types').ClientExtensionSuccessResponse|import('../types/client-extension.types').ClientExtensionErrorResponse>} - The success response or an error response
     */
    async deleteClientExtension(id) {
        try {
            // Validate required fields
            if (!id) {
                console.error("Error: id is required for deleting a client extension");
                return {
                    status: "error",
                    code: 400,
                    message: "Client extension ID is required"
                };
            }

            // Check if the ID looks like a UUID (basic validation)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                console.error(`Error: Invalid client extension ID format: ${id}`);
                return {
                    status: "error",
                    code: 400,
                    message: "Invalid client extension ID format"
                };
            }

            //console.log("Deleting client extension:", id);

            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.SOCIAL.META.CLIENT_EXTENSIONS.DELETE_CLIENT_EXTENSION_BY_ID.replace(':id', id)
            );

            //console.log("Client extension deleted successfully");
            return response.data.data;
        } catch (error) {
            console.error("Error deleting client extension:", error);

            if (error.response && error.response.status === 404) {
                return {
                    status: "error",
                    code: 404,
                    message: `Client extension with ID ${id} not found`
                };
            }

            return {
                status: "error",
                code: 500,
                message: "Failed to delete client extension",
                details: error.message
            };
        }
    }
}

export const clientExtensionService = new ClientExtensionService();
