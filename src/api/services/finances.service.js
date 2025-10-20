import axiosInstance from '../config/axiosInstance';
import { ENDPOINTS } from '../config/endpoints';

/**
 * Finances service for handling financial operations
 */
class FinancesService {
  /**
   * Get today's financial totals for the authenticated DJ
   * @returns {Promise<Object|null>} - Today's totals or null if an error occurs
   */
  async getTodayTotals() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FINANCES.GET_TODAY_TOTALS);
      return response.data;
    } catch (error) {
      console.error('Error fetching today totals:', error);
      return null;
    }
  }
}

export const financesService = new FinancesService();

