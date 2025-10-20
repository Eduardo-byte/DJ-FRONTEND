import { create } from 'zustand';
import { eventsService, requestsService, financesService } from '../api';

const useEventStore = create((set, get) => ({
  // State
  activeEvent: null,
  tonightTotals: null,
  pendingRequests: [],
  acceptedRequests: [],
  loading: false,
  error: null,

  // Actions
  setActiveEvent: (activeEvent) => set({ activeEvent }),
  setTonightTotals: (tonightTotals) => set({ tonightTotals }),
  setPendingRequests: (pendingRequests) => set({ pendingRequests }),
  setAcceptedRequests: (acceptedRequests) => set({ acceptedRequests }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch active event
  fetchActiveEvent: async () => {
    try {
      set({ loading: true, error: null });
      const event = await eventsService.getActiveEvent();
      set({ activeEvent: event });
      return event;
    } catch (error) {
      console.error('Error fetching active event:', error);
      set({ error: error.message, activeEvent: null });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Start new event
  startEvent: async (eventData) => {
    try {
      set({ loading: true, error: null });
      const event = await eventsService.startEvent(eventData);
      set({ activeEvent: event });
      return event;
    } catch (error) {
      console.error('Error starting event:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Stop active event
  stopEvent: async (eventId) => {
    try {
      set({ loading: true, error: null });
      await eventsService.stopEvent(eventId);
      set({ activeEvent: null });
    } catch (error) {
      console.error('Error stopping event:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Fetch tonight's totals
  fetchTonightTotals: async () => {
    try {
      const data = await financesService.getTodayTotals();
      set({ tonightTotals: data });
      return data;
    } catch (error) {
      console.error('Error fetching tonight totals:', error);
      set({ error: error.message });
      return null;
    }
  },

  // Fetch pending requests
  fetchPendingRequests: async () => {
    try {
      const requests = await requestsService.getPendingRequests();
      set({ pendingRequests: requests });
      return requests;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      set({ error: error.message, pendingRequests: [] });
      return [];
    }
  },

  // Fetch accepted requests
  fetchAcceptedRequests: async () => {
    try {
      const requests = await requestsService.getAcceptedRequests();
      set({ acceptedRequests: requests });
      return requests;
    } catch (error) {
      console.error('Error fetching accepted requests:', error);
      set({ error: error.message, acceptedRequests: [] });
      return [];
    }
  },

  // Accept a request
  acceptRequest: async (requestId, eta) => {
    try {
      const acceptedRequest = await requestsService.acceptRequest(requestId, eta);
      
      // Update local state
      const { pendingRequests, acceptedRequests } = get();
      const requestIndex = pendingRequests.findIndex(r => r.id === requestId);
      if (requestIndex !== -1) {
        const updatedRequest = { ...pendingRequests[requestIndex], ...acceptedRequest };
        set({
          pendingRequests: pendingRequests.filter(r => r.id !== requestId),
          acceptedRequests: [...acceptedRequests, updatedRequest],
        });
      }
      
      return acceptedRequest;
    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  },

  // Decline a request
  declineRequest: async (requestId, reason) => {
    try {
      await requestsService.declineRequest(requestId, reason);
      
      // Update local state
      const { pendingRequests } = get();
      set({
        pendingRequests: pendingRequests.filter(r => r.id !== requestId),
      });
    } catch (error) {
      console.error('Error declining request:', error);
      throw error;
    }
  },

  // Complete a request
  completeRequest: async (requestId) => {
    try {
      await requestsService.completeRequest(requestId);
      
      // Update local state
      const { acceptedRequests } = get();
      set({
        acceptedRequests: acceptedRequests.filter(r => r.id !== requestId),
      });
    } catch (error) {
      console.error('Error completing request:', error);
      throw error;
    }
  },

  // Add new request to pending list (for realtime updates)
  addPendingRequest: (request) => {
    const { pendingRequests } = get();
    set({
      pendingRequests: [request, ...pendingRequests],
    });
  },
}));

export default useEventStore;
