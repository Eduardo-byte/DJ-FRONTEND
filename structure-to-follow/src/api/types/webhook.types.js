/**
 * @typedef {Object} Webhook
 * @property {string} webhook_id - Unique identifier for the webhook (UUID).
 * @property {string} [chat_id] - ID of the chat associated with the webhook (UUID, optional).
 * @property {string} name - The name of the webhook.
 * @property {string} endpoint_url - The URL to which the webhook sends data.
 * @property {string} [trigger_event] - The event that triggers the webhook (optional).
 * @property {boolean} [is_active] - Flag indicating if the webhook is active (optional).
 * @property {string} [last_triggered] - Timestamp of when the webhook was last triggered (optional).
 * @property {string} [secret_key] - A secret key for verifying webhook requests (optional).
 * @property {number} [retries_count] - Number of retries if the webhook fails (optional).
 * @property {string} [client_id] - ID of the client associated with the webhook (UUID, optional).
 */

/**
 * @typedef {Object} CreateWebhookPayload
 * @property {string} name - The name of the webhook.
 * @property {string} endpoint_url - The URL to which the webhook sends data.
 * @property {string} [chat_id] - ID of the associated chat (UUID, optional).
 * @property {string} [trigger_event] - The event that triggers the webhook (optional).
 * @property {boolean} [is_active] - Whether the webhook should be active on creation (optional).
 * @property {string} [last_triggered] - Timestamp for last triggered, if any (optional).
 * @property {string} [secret_key] - Secret key used for webhook validation (optional).
 * @property {number} [retries_count] - Number of allowed retries (optional).
 * @property {string} [client_id] - ID of the client (UUID, optional).
 */

/**
 * @typedef {Object} UpdateWebhookPayload
 * @property {string} [name] - Updated name of the webhook (optional).
 * @property {string} [endpoint_url] - Updated endpoint URL (optional).
 * @property {string} [chat_id] - Updated chat ID associated with the webhook (optional).
 * @property {string} [trigger_event] - Updated triggering event (optional).
 * @property {boolean} [is_active] - Updated active status (optional).
 * @property {string} [last_triggered] - Updated last triggered timestamp (optional).
 * @property {string} [secret_key] - Updated secret key for verification (optional).
 * @property {number} [retries_count] - Updated number of retry attempts (optional).
 * @property {string} [client_id] - Updated client ID (optional).
 */
