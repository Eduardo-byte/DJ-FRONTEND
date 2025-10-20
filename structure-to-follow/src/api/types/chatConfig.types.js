/**
 * @typedef {Object} ChatConfig
 * @property {string} id - Unique identifier for the chat configuration (UUID).
 * @property {string} created_at - Timestamp when the config was created.
 * @property {string} client_id - ID of the client this config belongs to (UUID).
 * @property {string} chat_id - ID of the related chat (UUID).
 * @property {Object} [form] - JSON object for form configuration.
 * @property {Object} [avatar] - JSON object for avatar configuration.
 * @property {Object} [global_] - JSON object for global settings (e.g. branding, business details).
 * @property {Object} [chatWindow] - JSON object for chat window configuration.
 */

/**
 * @typedef {Object} CreateChatConfigPayload
 * @property {string} client_id - ID of the client this config belongs to (UUID).
 * @property {string} chat_id - ID of the related chat (UUID).
 * @property {Object} [form] - Optional form configuration.
 * @property {Object} [avatar] - Optional avatar configuration.
 * @property {Object} [global_] - Optional global settings.
 * @property {Object} [chatWindow] - Optional chat window configuration.
 */

/**
 * @typedef {Object} UpdateChatConfigPayload
 * @property {string} [client_id] - Updated client ID (UUID).
 * @property {string} [chat_id] - Updated chat ID (UUID).
 * @property {Object} [form] - Updated form configuration.
 * @property {Object} [avatar] - Updated avatar configuration.
 * @property {Object} [global_] - Updated global settings.
 * @property {Object} [chatWindow] - Updated chat window configuration.
 */
