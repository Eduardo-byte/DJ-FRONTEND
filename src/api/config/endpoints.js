const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * API Endpoints Configuration
 * Following the MVP pattern with organized endpoint groups
 */
export const ENDPOINTS = {
  // DJ endpoints - authenticated DJ user actions
  DJ: {
    GET_PROFILE: `${API_URL}/api/djs/me`,
    GET_QR_LINK: `${API_URL}/api/djs/me/qr`,
  },

  // Event endpoints - event management
  EVENTS: {
    GET_ACTIVE: `${API_URL}/api/djs/me/events/active`,
    START_EVENT: `${API_URL}/api/djs/me/events/start`,
    STOP_EVENT: `${API_URL}/api/djs/me/events/:eventId/stop`,
  },

  // Request endpoints - song request management
  REQUESTS: {
    GET_BY_STATUS: `${API_URL}/api/djs/me/requests`, // Query param: ?status=pending|accepted
    ACCEPT_REQUEST: `${API_URL}/api/djs/me/requests/:requestId/accept`,
    DECLINE_REQUEST: `${API_URL}/api/djs/me/requests/:requestId/decline`,
    COMPLETE_REQUEST: `${API_URL}/api/djs/me/requests/:requestId/complete`,
  },

  // Finance endpoints - financial data
  FINANCES: {
    GET_TODAY_TOTALS: `${API_URL}/api/djs/me/finances/today`,
  },

  // Public endpoints - accessible without authentication
  PUBLIC: {
    GET_DJ_ACTIVE_EVENT: `${API_URL}/api/public/djs/:djSlug/active-event`,
    CREATE_REQUEST: `${API_URL}/api/public/events/:eventId/requests`,
  },
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

