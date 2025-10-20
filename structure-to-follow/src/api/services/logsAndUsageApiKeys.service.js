import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

/**
 * Logs and Usage service for handling API key logs and usage analytics operations.
 */
class LogsAndUsageApiKeysService {
    // ========== GET METHODS ==========
    
    /**
     * Fetch all logs with optional pagination.
     * @param {Object} params - Query parameters for pagination.
     * @param {number} [params.page=1] - Page number.
     * @param {number} [params.limit=100] - Number of logs per page.
     * @returns {Promise<Object | null>} A promise that resolves to logs data or null if an error occurs.
     */
    async getAllLogs(params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_ALL_LOGS,
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching all logs:", error);
            return null;
        }
    }

    /**
     * Fetch a specific log entry by ID.
     * @param {string} logId - The log entry identifier.
     * @returns {Promise<Object | null>} A promise that resolves to the log entry or null if an error occurs.
     */
    async getLogById(logId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOG_BY_ID.replace(':id', logId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching log by ID:", error);
            return null;
        }
    }

    /**
     * Fetch logs for a specific API key.
     * @param {string} apiKeyId - The API key identifier.
     * @param {Object} params - Query parameters for pagination.
     * @param {number} [params.page=1] - Page number.
     * @param {number} [params.limit=100] - Number of logs per page.
     * @returns {Promise<Object | null>} A promise that resolves to API key logs or null if an error occurs.
     */
    async getLogsByApiKey(apiKeyId, params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_API_KEY.replace(':apiKeyId', apiKeyId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by API key:", error);
            return null;
        }
    }

    /**
     * Fetch logs for a specific client.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters for pagination.
     * @param {number} [params.page=1] - Page number.
     * @param {number} [params.limit=100] - Number of logs per page.
     * @returns {Promise<Object | null>} A promise that resolves to client logs or null if an error occurs.
     */
    async getLogsByClient(clientId, params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_CLIENT.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by client:", error);
            return null;
        }
    }

    /**
     * Fetch logs for a specific client in a simple format.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters for pagination.
     * @param {number} [params.page=1] - Page number.
     * @param {number} [params.limit=100] - Number of logs per page.
     * @returns {Promise<Object | null>} A promise that resolves to client logs or null if an error occurs.
     */
    async getLogsByClientSimple(clientId, params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_CLIENT_SIMPLE.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by client simple:", error);
            return null;
        }
    }

    /**
     * Fetch analytics for a specific client.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters for pagination.
     * @returns {Promise<Object | null>} A promise that resolves to analytics data or null if an error occurs.
     */
    async getAnalyticsByClient(clientId, params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_ANALYTICS_BY_CLIENT.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching analytics by client:", error);
            return null;
        }
    }

    /**
     * Fetch logs for a specific endpoint.
     * @param {string} endpoint - The endpoint URL.
     * @param {string} clientId - The client identifier.
     * @returns {Promise<Object | null>} A promise that resolves to endpoint logs or null if an error occurs.
     */
    async getLogsByEndpoint(endpoint, clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_ENDPOINT
                    .replace(':endpoint', encodeURIComponent(endpoint))
                    .replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by endpoint:", error);
            return null;
        }
    }

    /**
     * Fetch logs by status code.
     * @param {number} statusCode - The HTTP status code.
     * @param {string} clientId - The client identifier.
     * @returns {Promise<Object | null>} A promise that resolves to status code logs or null if an error occurs.
     */
    async getLogsByStatus(statusCode, clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_STATUS
                    .replace(':statusCode', statusCode.toString())
                    .replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by status:", error);
            return null;
        }
    }

    /**
     * Fetch logs by IP address.
     * @param {string} ipAddress - The IP address.
     * @returns {Promise<Object | null>} A promise that resolves to IP address logs or null if an error occurs.
     */
    async getLogsByIp(ipAddress) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_IP.replace(':ipAddress', ipAddress)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by IP:", error);
            return null;
        }
    }

    /**
     * Fetch logs within a date range.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters.
     * @param {string} params.startDate - Start date in ISO format.
     * @param {string} params.endDate - End date in ISO format.
     * @param {string} [params.apiKeyId] - Optional API key ID to filter by.
     * @returns {Promise<Object | null>} A promise that resolves to date range logs or null if an error occurs.
     */
    async getLogsByDateRange(clientId, params) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_LOGS_BY_DATE_RANGE.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching logs by date range:", error);
            return null;
        }
    }

    /**
     * Fetch error logs (status codes >= 400).
     * @param {string} clientId - The client identifier.
     * @returns {Promise<Object | null>} A promise that resolves to error logs or null if an error occurs.
     */
    async getErrorLogs(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_ERROR_LOGS.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching error logs:", error);
            return null;
        }
    }

    /**
     * Fetch successful logs (status codes < 400).
     * @param {string} clientId - The client identifier.
     * @returns {Promise<Object | null>} A promise that resolves to successful logs or null if an error occurs.
     */
    async getSuccessfulLogs(clientId) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_SUCCESSFUL_LOGS.replace(':clientId', clientId)
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching successful logs:", error);
            return null;
        }
    }

    /**
     * Fetch usage analytics for a specific time period.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters.
     * @param {string} params.startDate - Start date in ISO format.
     * @param {string} params.endDate - End date in ISO format.
     * @param {string} [params.groupBy='day'] - Group by 'day' or 'hour'.
     * @returns {Promise<Object | null>} A promise that resolves to usage analytics or null if an error occurs.
     */
    async getUsageAnalytics(clientId, params) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_USAGE_ANALYTICS.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching usage analytics:", error);
            return null;
        }
    }

    /**
     * Fetch top API keys by usage.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters.
     * @param {string} params.startDate - Start date in ISO format.
     * @param {string} params.endDate - End date in ISO format.
     * @param {number} [params.limit=10] - Number of top API keys to return.
     * @returns {Promise<Object | null>} A promise that resolves to top API keys or null if an error occurs.
     */
    async getTopApiKeys(clientId, params) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_TOP_API_KEYS.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching top API keys:", error);
            return null;
        }
    }

    /**
     * Fetch error rate analysis for API keys.
     * @param {string} clientId - The client identifier.
     * @param {Object} params - Query parameters.
     * @param {string} params.startDate - Start date in ISO format.
     * @param {string} params.endDate - End date in ISO format.
     * @returns {Promise<Object | null>} A promise that resolves to error rate analysis or null if an error occurs.
     */
    async getErrorRateAnalysis(clientId, params) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_ERROR_RATE_ANALYSIS.replace(':clientId', clientId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching error rate analysis:", error);
            return null;
        }
    }

    /**
     * Fetch usage statistics for a specific API key.
     * @param {string} apiKeyId - The API key identifier.
     * @param {Object} [params] - Query parameters.
     * @param {string} [params.startDate] - Start date in ISO format.
     * @param {string} [params.endDate] - End date in ISO format.
     * @returns {Promise<Object | null>} A promise that resolves to usage statistics or null if an error occurs.
     */
    async getUsageStats(apiKeyId, params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_USAGE_STATS.replace(':apiKeyId', apiKeyId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching usage stats:", error);
            return null;
        }
    }

    /**
     * Fetch daily usage count for a specific API key.
     * @param {string} apiKeyId - The API key identifier.
     * @param {Object} params - Query parameters.
     * @param {string} params.date - Date in YYYY-MM-DD format.
     * @returns {Promise<Object | null>} A promise that resolves to daily usage count or null if an error occurs.
     */
    async getDailyUsage(apiKeyId, params) {
        try {
            const response = await apiGatewayAxiosInstance.get(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.GET_DAILY_USAGE.replace(':apiKeyId', apiKeyId),
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error fetching daily usage:", error);
            return null;
        }
    }

    // ========== POST METHODS ==========

    /**
     * Create a new log entry.
     * @param {Object} logData - The log entry data.
     * @param {string} logData.api_key_id - API key ID.
     * @param {string} logData.endpoint - Endpoint URL.
     * @param {string} logData.method - HTTP method.
     * @param {number} logData.status_code - HTTP status code.
     * @param {string} logData.ip_address - Client IP address.
     * @param {string} [logData.user_agent] - User agent string.
     * @param {Object} [logData.body] - Request body in JSON format.
     * @param {Object} [logData.response] - Response body in JSON format.
     * @returns {Promise<Object | null>} A promise that resolves to the created log entry or null if an error occurs.
     */
    async createLog(logData) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.CREATE_LOG,
                logData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error creating log:", error);
            return null;
        }
    }

    // ========== PUT METHODS ==========

    /**
     * Update a log entry.
     * @param {string} logId - The log entry identifier.
     * @param {Object} updateData - The update data for the log entry.
     * @param {number} [updateData.status_code] - HTTP status code.
     * @param {string} [updateData.user_agent] - User agent string.
     * @param {Object} [updateData.body] - Request/response body in JSON format.
     * @returns {Promise<Object | null>} A promise that resolves to the updated log entry or null if an error occurs.
     */
    async updateLog(logId, updateData) {
        try {
            const response = await apiGatewayAxiosInstance.put(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.UPDATE_LOG.replace(':id', logId),
                updateData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating log:", error);
            return null;
        }
    }

    // ========== DELETE METHODS ==========

    /**
     * Delete a log entry.
     * @param {string} logId - The log entry identifier.
     * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful or false if an error occurs.
     */
    async deleteLog(logId) {
        try {
            await apiGatewayAxiosInstance.delete(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.DELETE_LOG.replace(':id', logId)
            );
            return true;
        } catch (error) {
            console.error("Error deleting log:", error);
            return false;
        }
    }

    /**
     * Delete old logs (maintenance operation).
     * @param {Object} [params] - Query parameters.
     * @param {number} [params.daysOld=90] - Delete logs older than specified days.
     * @returns {Promise<Object | null>} A promise that resolves to cleanup result or null if an error occurs.
     */
    async cleanupOldLogs(params = {}) {
        try {
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.CLEANUP_OLD_LOGS,
                { params }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error cleaning up old logs:", error);
            return null;
        }
    }

    /**
     * Delete all logs for a specific API key.
     * @param {string} apiKeyId - The API key identifier.
     * @returns {Promise<boolean>} A promise that resolves to true if deletion was successful or false if an error occurs.
     */
    async cleanupApiKeyLogs(apiKeyId) {
        try {
            await apiGatewayAxiosInstance.delete(
                ENDPOINTS.API_KEYS_USAGE_AND_LOGS.LOGS.CLEANUP_API_KEY_LOGS.replace(':apiKeyId', apiKeyId)
            );
            return true;
        } catch (error) {
            console.error("Error cleaning up API key logs:", error);
            return false;
        }
    }
}

export const logsAndUsageApiKeysService = new LogsAndUsageApiKeysService();
