# Expanded Integration Table Schema

## Current Database Schema
The current database table has the following fields:

| Name | Format | Type | Description |
|------|--------|------|-------------|
| integration_id | uuid | string | Unique identifier for the integration |
| chat_id | uuid | string | Reference to the chat/agent being integrated |
| integration_type | text | string | Type of integration (e.g., facebook, instagram) |
| integration_details | jsonb | json | Platform-specific configuration details |
| last_synced | date | string | When the integration was last synchronized |
| status | boolean | boolean | Whether the integration is active |
| client_id | uuid | string | Reference to the client who owns the integration |

## Expanded Schema
Based on the analysis of the Extensions page and related components, here's an expanded schema that includes additional fields needed for a complete integration system:

| Name | Format | Type | Description |
|------|--------|------|-------------|
| integration_id | uuid | string | Unique identifier for the integration |
| client_id | uuid | string | Reference to the client who owns the integration |
| chat_id | uuid | string | Reference to the chat/agent being integrated |
| integration_type | text | string | Type of integration (e.g., chat-widget, facebook, instagram) |
| status | boolean | boolean | Whether the integration is active/live |
| created_at | timestamp | datetime | When the integration was created |
| updated_at | timestamp | datetime | When the integration was last updated |
| last_synced | timestamp | datetime | When the integration was last synchronized with the platform |
| auth_token | text | string | Authentication token for the platform |
| refresh_token | text | string | Refresh token for OAuth-based platforms |
| token_expires_at | timestamp | datetime | When the auth token expires |
| integration_details | jsonb | json | Platform-specific configuration details |
| last_error | text | string | Last error message encountered |
| error_count | integer | number | Count of errors encountered |
| is_active | boolean | boolean | Whether the integration is currently active |
| deployment_date | timestamp | datetime | When the integration was deployed |
| message_count | integer | number | Count of messages processed through this integration |
| user_count | integer | number | Count of unique users interacting through this integration |

## Integration Types
The system supports the following integration types:

1. **chat-widget** - Website chat widget (Available)
2. **facebook** - Facebook Messenger integration (Available)
3. **instagram** - Instagram DM integration (Available)
4. **x** - X/Twitter integration (Coming Soon)
5. **telegram** - Telegram integration (Coming Soon)
6. **linkedin** - LinkedIn integration (Coming Soon)
7. **email** - Email integration (Coming Soon)
8. **sms** - SMS integration (Coming Soon)
9. **team** - Team collaboration integration (Coming Soon)

## Integration Details Structure
The `integration_details` JSON field structure varies by integration type:

### Chat Widget
```json
{
  "widget_position": "bottom-right",
  "widget_color": "#6366F1",
  "widget_title": "Chat with us",
  "widget_subtitle": "We usually respond in a few minutes",
  "widget_icon": "default",
  "custom_css": "",
  "auto_open": false,
  "auto_open_delay": 5000,
  "show_branding": true
}
```

### Facebook
```json
{
  "page_id": "123456789012345",
  "page_name": "My Business Page",
  "page_access_token": "EAABc...",
  "scopes": [
    "pages_messaging",
    // "pages_read_engagement",
    "pages_manage_metadata",
    "pages_show_list"
  ],
  "welcome_message": "Hi there! How can I help you today?",
  "auto_response": true,
  "notification_email": "user@example.com"
}
```

### Instagram
```json
{
  "account_id": "123456789012345",
  "account_name": "mybusiness",
  "access_token": "EAABc...",
  "scopes": [
    "instagram_basic",
    "instagram_manage_messages",
    // "instagram_manage_comments"
  ],
  "welcome_message": "Thanks for reaching out! How can I assist you?",
  "auto_response": true,
  "notification_email": "user@example.com"
}
```

## Authentication Flow
Most social media integrations use OAuth 2.0 for authentication:

1. User initiates connection from the Extensions page
2. User is redirected to the platform's authorization page
3. User grants permissions to the application
4. Platform redirects back with an authorization code
5. Backend exchanges the code for access and refresh tokens
6. Tokens are stored in the integration record
7. Refresh tokens are used to maintain access when tokens expire

## Deployment Process
When deploying an agent to a channel:

1. User selects one or more channels in the DeployAgentModal
2. User configures each channel's settings
3. System creates or updates integration records for each selected channel
4. Agent status is updated to "Live"
5. Integration becomes active and starts processing messages

## Constraints and Relationships
- Each client can have multiple integrations
- Each chat/agent can be integrated with multiple platforms
- Each combination of client_id, chat_id, and integration_type must be unique
- Integrations reference clients and chats/agents through foreign keys

## Future Expansion Considerations
- Support for additional platforms (X, Telegram, LinkedIn, etc.)
- Enhanced analytics and reporting capabilities
- Webhook support for custom integrations
- Multi-language support for automated responses
- A/B testing for different widget configurations
