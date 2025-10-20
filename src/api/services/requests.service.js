import axiosInstance from '../config/axiosInstance';
import { ENDPOINTS } from '../config/endpoints';

/**
 * Requests service for handling song request operations
 */
class RequestsService {
  /**
   * Get requests by status
   * @param {string} status - Request status (pending, accepted, completed, declined)
   * @returns {Promise<Array>} - Array of requests
   */
  async getRequestsByStatus(status) {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.REQUESTS.GET_BY_STATUS}?status=${status}`);
      // API returns { requests: [], pagination: {} }
      return response.data?.requests || [];
    } catch (error) {
      console.error(`Error fetching ${status} requests:`, error);
      return [];
    }
  }

  /**
   * Get pending requests
   * @returns {Promise<Array>} - Array of pending requests
   */
  async getPendingRequests() {
    return this.getRequestsByStatus('pending');
  }

  /**
   * Get accepted requests
   * @returns {Promise<Array>} - Array of accepted requests
   */
  async getAcceptedRequests() {
    return this.getRequestsByStatus('accepted');
  }

  /**
   * Accept a song request
   * @param {string} requestId - The request ID
   * @param {string} eta - Estimated time of arrival (ISO string)
   * @returns {Promise<Object>} - The updated request
   */
  async acceptRequest(requestId, eta) {
    try {
      const endpoint = ENDPOINTS.REQUESTS.ACCEPT_REQUEST.replace(':requestId', requestId);
      const response = await axiosInstance.post(endpoint, { eta });
      return response.data.request;
    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  }

  /**
   * Decline a song request
   * @param {string} requestId - The request ID
   * @param {string} reason - Reason for declining (optional)
   * @returns {Promise<Object>} - The response data
   */
  async declineRequest(requestId, reason = '') {
    try {
      const endpoint = ENDPOINTS.REQUESTS.DECLINE_REQUEST.replace(':requestId', requestId);
      const response = await axiosInstance.post(endpoint, { reason });
      return response.data;
    } catch (error) {
      console.error('Error declining request:', error);
      throw error;
    }
  }

  /**
   * Complete a song request
   * @param {string} requestId - The request ID
   * @returns {Promise<Object>} - The response data
   */
  async completeRequest(requestId) {
    try {
      const endpoint = ENDPOINTS.REQUESTS.COMPLETE_REQUEST.replace(':requestId', requestId);
      const response = await axiosInstance.post(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error completing request:', error);
      throw error;
    }
  }

  /**
   * Create a new song request (public endpoint)
   * @param {string} eventId - The event ID
   * @param {Object} requestData - Request data (tier, amount_cents, tip_cents, song_title, greeting, has_image, receipt_email)
   * @returns {Promise<Object>} - The created request with payment details
   */
  async createRequest(eventId, requestData) {
    try {
      const endpoint = ENDPOINTS.PUBLIC.CREATE_REQUEST.replace(':eventId', eventId);
      const response = await axiosInstance.post(endpoint, requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }
}

export const requestsService = new RequestsService();

