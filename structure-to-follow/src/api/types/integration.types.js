/**
 * @typedef {Object} IntegrationType
 * @property {string} type - The type of integration (e.g., "twitter", "facebook", "instagram", "chat-widget")
 */

/**
 * @typedef {Object} IntegrationTypeArray
 * @property {IntegrationType[]} integration_type - Array of integration types, e.g. [{"type": "twitter"}, {"type": "facebook"}]
 */

/**
 * @typedef {Object} IntegrationDetails
 * @property {string} [account_name] - The name of the social media account
 * @property {string} [account_id] - The ID of the social media account
 * @property {number} [followers_count] - The number of followers
 * @property {string} [page_id] - Facebook page ID
 * @property {string} [page_name] - Facebook page name
 * @property {string} [page_access_token] - Facebook page access token
 * @property {string[]} [scopes] - OAuth scopes granted
 * @property {string} [welcome_message] - Welcome message for new conversations
 * @property {boolean} [auto_response] - Whether auto-response is enabled
 * @property {string} [notification_email] - Email for notifications
 * @property {string} [widget_position] - Position of the chat widget
 * @property {string} [widget_color] - Color of the chat widget
 * @property {string} [widget_title] - Title of the chat widget
 * @property {string} [widget_subtitle] - Subtitle of the chat widget
 * @property {string} [widget_icon] - Icon of the chat widget
 * @property {string} [custom_css] - Custom CSS for the chat widget
 * @property {boolean} [auto_open] - Whether the chat widget auto-opens
 * @property {number} [auto_open_delay] - Delay before auto-opening the chat widget
 * @property {boolean} [show_branding] - Whether to show branding in the chat widget
 */

/**
 * @typedef {Object} Integration
 * @property {string} integration_id - Unique identifier for the integration
 * @property {string} chat_id - The chat ID associated with the integration
 * @property {string} client_id - The client ID associated with the integration
 * @property {IntegrationType[]} integration_type - The types of integration
 * @property {IntegrationDetails} integration_details - Details about the social media account
 * @property {string} last_synced - The last time the integration was synced
 * @property {boolean} status - The status of the integration
 * @property {boolean} is_active - Whether the integration is active
 * @property {number} error_count - The number of errors encountered
 * @property {number} message_count - The number of messages processed
 * @property {string} created_at - The creation timestamp
 * @property {string} updated_at - The last update timestamp
 * @property {string} [auth_token] - Authentication token for the platform
 * @property {string} [refresh_token] - Refresh token for OAuth-based platforms
 * @property {string} [token_expires_at] - When the auth token expires
 * @property {string} [last_error] - Last error message encountered
 * @property {string} [deployment_date] - When the integration was deployed
 * @property {number} [user_count] - Count of unique users interacting through this integration
 */

/**
 * @typedef {Object} CreateIntegrationPayload
 * @property {string} chat_id - The chat ID associated with the integration
 * @property {string} client_id - The client ID associated with the integration
 * @property {IntegrationType[]} integration_type - The types of integration
 * @property {IntegrationDetails} integration_details - Details about the social media account
 * @property {boolean} status - The status of the integration
 * @property {boolean} is_active - Whether the integration is active
 */

/**
 * @typedef {Object} UpdateIntegrationPayload
 * @property {IntegrationType[]} [integration_type] - The types of integration
 * @property {IntegrationDetails} [integration_details] - Details about the social media account
 * @property {boolean} [status] - The status of the integration
 * @property {boolean} [is_active] - Whether the integration is active
 * @property {number} [error_count] - The number of errors encountered
 * @property {number} [message_count] - The number of messages processed
 * @property {string} [auth_token] - Authentication token for the platform
 * @property {string} [refresh_token] - Refresh token for OAuth-based platforms
 * @property {string} [token_expires_at] - When the auth token expires
 * @property {string} [last_error] - Last error message encountered
 * @property {string} [last_synced] - The last time the integration was synced
 */

export {};
