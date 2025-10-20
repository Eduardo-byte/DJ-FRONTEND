import apiGatewayAxiosInstance, { logError } from '../../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../../config/endpoints.js';

// Import types
import '../../types/meta.types.js';

/**
 * Meta authentication service for handling Meta API authentication operations.
 * This service provides methods for retrieving the Meta app ID and exchanging tokens.
 */
class MetaAuthService {
    /**
     * Get the Meta app ID for frontend authentication.
     * 
     * @returns {Promise<import('../../types/meta.types').MetaAppIdResponse|import('../../types/meta.types').MetaErrorResponse>} - The Meta app ID response or an error response
     */
    async getAppId() {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.META.AUTH.GET_APP_ID
            );

            //console.log("Meta app ID retrieved successfully:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("Error retrieving Meta app ID:", error);

            return {
                success: false,
                message: "Failed to get Meta app ID",
                details: error.message
            };
        }
    }

    /**
     * Exchange a short-lived token for a long-lived token.
     * 
     * @param {import('../../types/meta.types').TokenExchangeRequest} tokenData - The token exchange data
     * @returns {Promise<import('../../types/meta.types').TokenExchangeResponse|import('../../types/meta.types').MetaErrorResponse>} - The token exchange response or an error response
     */

    async exchangeToken(tokenData) {
        try {
            // Validate required fields
            if (!tokenData.pageId || !tokenData.pageName || !tokenData.accessToken) {
                console.error("Error: pageId, pageName, and accessToken are required for token exchange");
                return {
                    success: false,
                    message: "Page ID, page name, and access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.AUTH.EXCHANGE_TOKEN,
                tokenData
            );

            //console.log("Token exchanged successfully for page:", tokenData.pageName);
            return response.data.data;
        } catch (error) {
            console.error("Error exchanging token:", error);

            return {
                success: false,
                message: "Failed to exchange token",
                details: error.message
            };
        }
    }

    async subscribePage(longLivedToken, pageId) {
        try {
            // Validate required fields
            if (!longLivedToken || !pageId) {
                console.error("Error: pageId, and accessToken are required for page subscribe");
                return {
                    success: false,
                    message: "Page ID, and access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const payload = {
                pageAccessToken: longLivedToken,
                pageId: pageId
            }
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.AUTH.SUBSCRIBE_PAGE,
                payload
            );

            //console.log("Token exchanged successfully for page:", tokenData.pageName);
            return response.data.data;
        } catch (error) {
            console.error("Error exchanging token:", error);

            return {
                success: false,
                message: "Failed to exchange token",
                details: error.message
            };
        }
    }
    async subscribeInstagramPage(longLivedToken, pageId, facebookPageId) {
        try {
            // Validate required fields
            if (!longLivedToken || !pageId) {
                console.error("Error: pageId, and accessToken are required for page subscribe");
                return {
                    success: false,
                    message: "Page ID, and access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const payload = {
                pageAccessToken: longLivedToken,
                pageId: pageId,
                facebookPageId: facebookPageId
            }
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.AUTH.SUBSCRIBE_INSTAGRAM_PAGE,
                payload
            );

            //console.log("Token exchanged successfully for page:", tokenData.pageName);
            return response.data.data;
        } catch (error) {
            console.error("Error exchanging token:", error);

            return {
                success: false,
                message: "Failed to exchange token",
                details: error.message
            };
        }
    }

    async unsubscribePage(longLivedToken, pageId) {
        try {
            // Validate required fields
            if (!longLivedToken || !pageId) {
                console.error("Error: pageId, and accessToken are required for page subscribe");
                return {
                    success: false,
                    message: "Page ID, and access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const payload = {
                pageAccessToken: longLivedToken,
                pageId: pageId
            }
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.AUTH.UNSUBSCRIBE_PAGE,
                payload
            );

            //console.log("Token exchanged successfully for page:", tokenData.pageName);
            return response.data.data;
        } catch (error) {
            console.error("Error exchanging token:", error);

            return {
                success: false,
                message: "Failed to exchange token",
                details: error.message
            };
        }
    }
}

export const metaAuthService = new MetaAuthService();
