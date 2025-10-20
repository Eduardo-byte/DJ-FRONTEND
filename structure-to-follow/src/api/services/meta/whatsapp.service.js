import { ENDPOINTS } from '../../config/endpoints.js';
import apiGatewayAxiosInstance, { logError } from '../../config/apiGatewayAxiosInstance.js';

class WhatsappService {

    async getAppId() {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.SOCIAL.META.WHATSAPP.GET_APP_ID
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

    async exchangeToken(accessToken) {
        try {
            // Validate required fields
            if (!accessToken) {
                console.error("Error: accessToken are required for token exchange");
                return {
                    success: false,
                    message: "access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.WHATSAPP.EXCHANGE_TOKEN,
                { accessToken }
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

    async getWhatsappBusiness(accessToken) {
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
                `${ENDPOINTS.SOCIAL.META.WHATSAPP.GET_WT_BUSINESS}?accessToken=${encodeURIComponent(accessToken)}`
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

    async getWhatsappTemplates(wabaId, accessToken) {
        try {
            // Validate required fields
            if (!wabaId || !accessToken) {
                console.error("Error: accessToken is required for getting Facebook pages");
                return {
                    success: false,
                    message: "Access token is required"
                };
            }

            const response = await apiGatewayAxiosInstance.get(
                `${ENDPOINTS.SOCIAL.META.WHATSAPP.GET_WT_TEMPLATES}?accessToken=${encodeURIComponent(accessToken)}&wabaId=${wabaId}`
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


    async deleteWhatsappTemplates(wabaId, accessToken, name, language) {
        try {
            // Validate required fields
            if (!wabaId || !accessToken || !name || !language) {
                console.error("Error: accessToken is required for getting Facebook pages");
                return {
                    success: false,
                    message: "Access token is required"
                };
            }

            const response = await apiGatewayAxiosInstance.delete(
                `${ENDPOINTS.SOCIAL.META.WHATSAPP.DELETE_WT_TEMPLATE}?accessToken=${encodeURIComponent(accessToken)}&wabaId=${wabaId}&name=${name}&language=${language}`
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

    async createTemplate({ wabaId, accessToken, name, language, components, category }) {
        if (!wabaId || !accessToken || !name || !language || !components || !category) {
            console.error("Error: accessToken is required for getting Facebook pages");
            return {
                success: false,
                message: "Access token is required"
            };
        }
        try {
            const resp = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.WHATSAPP.CREATE_WT_TEMPLATE,
                { wabaId, accessToken, name, language, components, category }
            );
            return resp.data;
        } catch (err) {
            // pull out the human-readable error
            const errData = err.response?.data || {};
            const msg =
                errData.message ||
                errData.error_user_msg ||
                err.message ||
                "Failed to update WhatsApp template";

            console.error("whatsappService.editTemplate error:", errData);
            return {
                success: false,
                message: msg,
                details: errData,
            };
        }


    }

    // async editTemplate({ templateId, accessToken, components }) {
    //     if (!templateId || !accessToken || !components) {
    //         return { success: false, message: "Missing edit parameters" };
    //     }
    //     const url = ENDPOINTS.SOCIAL.META.WHATSAPP.EDIT_WT_TEMPLATE.replace(
    //         ':templateId',
    //         templateId
    //     );
    //     const resp = await apiGatewayAxiosInstance.put(
    //         url,
    //         { accessToken, components }
    //     );
    //     return resp.data;
    // }

    async editTemplate({ templateId, accessToken, components }) {
        if (!templateId || !accessToken || !components) {
            return { success: false, message: "Missing edit parameters" };
        }

        const url = ENDPOINTS.SOCIAL.META.WHATSAPP.EDIT_WT_TEMPLATE.replace(
            ':templateId',
            templateId
        );

        try {
            const resp = await apiGatewayAxiosInstance.put(
                url,
                { accessToken, components }
            );
            // assuming resp.data is { success: boolean, ... }
            return resp.data;
        } catch (err) {
            // pull out the human-readable error
            const errData = err.response?.data || {};
            const msg =
                errData.message ||
                errData.error_user_msg ||
                err.message ||
                "Failed to update WhatsApp template";

            console.error("whatsappService.editTemplate error:", errData);
            return {
                success: false,
                message: msg,
                details: errData,
            };
        }
    }


    //Send an Agent message to Facebook
    async sendMessage(clientId, userPhoneNumber, phoneNumberId, message, wtMessageId, userId) {
        try {
            // Validate required fields
            if (!clientId || !userPhoneNumber || !phoneNumberId || !message || !wtMessageId || !userId) {
                console.error("Error: clientId, userPhoneNumber, phoneNumberId, message and wtMessageId are required to send a message");
                return {
                    success: false,
                    message: "clientId, userPhoneNumber, phoneNumberId, message and wtMessageId are required"
                };
            }

            const messageData = {
                clientId,
                userPhoneNumber,
                phoneNumberId,
                message,
                wtMessageId,
                userId
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.WHATSAPP.SEND_DIRECT_MESSAGE,
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

    async subscribeWhatsappNumber(token, wabaId) {
        try {
            // Validate required fields
            if (!wabaId || !token) {
                console.error("Error: pageId, and accessToken are required for page subscribe");
                return {
                    success: false,
                    message: "Page ID, and access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const payload = {
                wabaId,
                token
            }
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.WHATSAPP.SUBSCRIBE_WHATSAPP_PAGE,
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

    async verifyPartner(wabaId) {
        try {
            // Validate required fields
            if (!wabaId) {
                console.error("Error: pageId is required for page subscribe");
                return {
                    success: false,
                    message: "Page ID, and access token are required"
                };
            }

            //console.log("Exchanging token for page:", tokenData.pageName);

            const payload = {
                businessId: wabaId,
            }
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.SOCIAL.META.WHATSAPP.VERIFY_PARTNER,
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

    async unsubscribeWhatsappNumber(longLivedToken, pageId) {
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
                ENDPOINTS.SOCIAL.META.WHATSAPP.UNSUBSCRIBE_WHATSAPP_PAGE,
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

export const whatsappService = new WhatsappService();
