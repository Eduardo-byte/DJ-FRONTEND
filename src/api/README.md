# API Structure

This directory contains the organized API layer following the MVP (Model-View-Presenter) pattern.

## Structure

```text
/src/api/
├── config/
│   ├── axiosInstance.js      # Configured axios instance with auth interceptors
│   └── endpoints.js           # Centralized API endpoint definitions
├── services/
│   ├── auth.service.js        # Authentication operations
│   ├── dj.service.js          # DJ profile operations
│   ├── events.service.js      # Event management operations
│   ├── requests.service.js    # Song request operations
│   └── finances.service.js    # Financial data operations
└── index.js                   # Main export file for all services
```

## Usage

### Importing Services

```javascript
// Import individual services
import { authService, djService, eventsService } from '../api';

// Import axios instance
import { axiosInstance } from '../api';

// Import endpoints
import { ENDPOINTS } from '../api';
```

### Using Services

All services are class-based with async methods that return promises:

```javascript
// Authentication
const user = await authService.getUser();
await authService.signIn(email, password);
await authService.signOut();

// DJ Profile
const profile = await djService.getDjProfile();
const qrLink = await djService.getQrLink();

// Events
const activeEvent = await eventsService.getActiveEvent();
const newEvent = await eventsService.startEvent({ venue_name: 'Club XYZ' });
await eventsService.stopEvent(eventId);

// Requests
const pending = await requestsService.getPendingRequests();
const accepted = await requestsService.getAcceptedRequests();
await requestsService.acceptRequest(requestId, eta);
await requestsService.declineRequest(requestId, reason);
await requestsService.completeRequest(requestId);

// Finances
const todayTotals = await financesService.getTodayTotals();
```

## Service Patterns

### Service Class Structure

Each service follows this pattern:

```javascript
class ServiceName {
  /**
   * Method description
   * @param {type} param - Parameter description
   * @returns {Promise<type>} - Return value description
   */
  async methodName(param) {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CATEGORY.ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error message:', error);
      throw error; // or return null depending on use case
    }
  }
}

export const serviceName = new ServiceName();
```

### Error Handling

- Services throw errors for operations that should halt execution (create, update, delete)
- Services return `null` or empty arrays for read operations that can fail gracefully
- All API errors are logged to console for debugging

## Endpoints Configuration

Endpoints are organized by category in `/config/endpoints.js`:

- `DJ` - DJ profile endpoints
- `EVENTS` - Event management endpoints
- `REQUESTS` - Song request endpoints
- `FINANCES` - Financial data endpoints
- `PUBLIC` - Public-facing endpoints (no auth required)

## Authentication

The axios instance automatically attaches bearer tokens to requests via an interceptor. Session caching is implemented to reduce duplicate Supabase calls.

## Backward Compatibility

For backward compatibility, the old `/lib/api.js` and `/lib/auth.js` files now re-export from this new structure, so existing code continues to work without changes.


