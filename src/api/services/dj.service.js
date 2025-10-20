import axiosInstance from '../config/axiosInstance';
import { ENDPOINTS } from '../config/endpoints';

/**
 * DJ service for handling DJ profile operations
 */
class DjService {
  /**
   * Get the authenticated DJ's profile
   * @returns {Promise<Object|null>} - The DJ profile data or null if an error occurs
   */
  async getDjProfile() {
    try {
      console.log('🔍 getDjProfile: Starting...');
      
      // The API interceptor will handle attaching the bearer token
      console.log('👤 getDjProfile: Making API request directly...');
      
      // Add a timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000);
      });
      
      const response = await Promise.race([
        axiosInstance.get(ENDPOINTS.DJ.GET_PROFILE),
        timeoutPromise
      ]);
      
      console.log('✅ getDjProfile: Profile fetched successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getDjProfile Error:', error);
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request config:', error.config?.url);
      return null;
    }
  }

  /**
   * Get the DJ's QR link for song requests
   * @returns {Promise<Object|null>} - The QR link data or null if an error occurs
   */
  async getQrLink() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.DJ.GET_QR_LINK);
      return response.data;
    } catch (error) {
      console.error('Error fetching QR link:', error);
      return null;
    }
  }
}

export const djService = new DjService();

