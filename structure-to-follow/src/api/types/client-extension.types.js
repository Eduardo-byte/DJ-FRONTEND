/**
 * @typedef {Object} ClientExtension
 * @property {string} client_extension_id - Unique identifier for the client extension
 * @property {string} client_id - The client ID associated with the extension
 * @property {string} [long_lived_token] - Long-lived token for authentication
 * @property {boolean} is_connected - Whether the extension is connected
 * @property {string} [connected_at] - When the extension was connected
 * @property {string} [token_expires_at] - When the token expires
 * @property {string} [access_token] - The access token for the extension
 * @property {Array} [page_ids] - Array of page objects associated with the extension
 * @property {string} created_at - The creation timestamp
 * @property {string} updated_at - The last update timestamp
 */

/**
 * @typedef {Object} CreateClientExtensionPayload
 * @property {string} [client_id] - The client ID associated with the extension (optional for some extension types like widgets)
 * @property {string} extension_name - The name of the extension (e.g., "facebook", "instagram", "widget")
 * @property {string} [long_lived_token] - Long-lived token for authentication (optional for some extension types like widgets)
 * @property {boolean} [is_connected] - Whether the extension is connected
 * @property {string} [connected_at] - When the extension was connected
 * @property {string} [token_expires_at] - When the token expires
 * @property {string} [access_token] - The access token for the extension
 * @property {Array} [page_ids] - Array of page objects associated with the extension
 */

/**
 * @typedef {Object} UpdateClientExtensionPayload
 * @property {string} [long_lived_token] - Long-lived token for authentication
 * @property {boolean} [is_connected] - Whether the extension is connected
 * @property {string} [connected_at] - When the extension was connected
 * @property {string} [token_expires_at] - When the token expires
 * @property {string} [access_token] - The access token for the extension
 * @property {Array} [page_ids] - Array of page objects associated with the extension
 */

/**
 * @typedef {Object} ClientExtensionResponse
 * @property {ClientExtension} clientExtension - The client extension object
 */

/**
 * @typedef {Object} ClientExtensionsResponse
 * @property {ClientExtension[]} clientExtensions - Array of client extension objects
 */

/**
 * @typedef {Object} ClientExtensionSuccessResponse
 * @property {string} status - Always "success" for success responses
 * @property {string} message - The success message
 */

/**
 * @typedef {Object} ClientExtensionErrorResponse
 * @property {string} status - Always "error" for error responses
 * @property {number} code - The HTTP status code
 * @property {string} message - The error message
 * @property {string} [details] - Optional error details
 */

export {};
