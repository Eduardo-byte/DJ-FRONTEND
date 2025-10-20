import axiosInstance from '../config/axiosInstance';
import { ENDPOINTS } from '../config/endpoints';

/**
 * Events service for handling DJ event operations
 */
class EventsService {
  /**
   * Get the DJ's active event
   * @returns {Promise<Object|null>} - The active event or null if no active event
   */
  async getActiveEvent() {
    try {
      const response = await axiosInstance.get(ENDPOINTS.EVENTS.GET_ACTIVE);
      // API returns the event directly, not wrapped in { event: ... }
      return response.data || null;
    } catch (error) {
      console.error('Error fetching active event:', error);
      return null;
    }
  }

  /**
   * Start a new event
   * @param {Object} eventData - Event data including venue_name
   * @returns {Promise<Object>} - The created event
   */
  async startEvent(eventData) {
    try {
      const response = await axiosInstance.post(ENDPOINTS.EVENTS.START_EVENT, eventData);
      // API returns { message, event }
      return response.data?.event || response.data;
    } catch (error) {
      console.error('Error starting event:', error);
      throw error;
    }
  }

  /**
   * Stop an active event
   * @param {string} eventId - The event ID to stop
   * @returns {Promise<Object>} - The response data
   */
  async stopEvent(eventId) {
    try {
      const endpoint = ENDPOINTS.EVENTS.STOP_EVENT.replace(':eventId', eventId);
      const response = await axiosInstance.post(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error stopping event:', error);
      throw error;
    }
  }

  /**
   * Get DJ's active event by slug (public endpoint)
   * @param {string} djSlug - The DJ's slug
   * @returns {Promise<Object>} - The DJ and active event data
   */
  async getDjActiveEvent(djSlug) {
    try {
      const endpoint = ENDPOINTS.PUBLIC.GET_DJ_ACTIVE_EVENT.replace(':djSlug', djSlug);
      const response = await axiosInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error checking DJ active event:', error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();

