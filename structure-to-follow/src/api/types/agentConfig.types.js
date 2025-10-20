/**
 * @typedef {Object} AgentConfig
 * @property {string} id - Unique identifier for the agent config (UUID).
 * @property {string} created_at - Timestamp when the config was created.
 * @property {string} client_id - ID of the client this config belongs to (UUID).
 * @property {string} chat_id - ID of the related chat (UUID).
 * @property {Object} [chat_info] - JSON object for chat logic/config.
 * @property {Object} [bot_config] - JSON object for bot settings.
 * @property {Object} [lead_details] - JSON object containing lead capture rules.
 * @property {Object} [company_details] - JSON object describing company info/services.
 */

/**
 * @typedef {Object} CreateAgentConfigPayload
 * @property {string} client_id - ID of the client this config belongs to (UUID).
 * @property {string} chat_id - ID of the related chat (UUID).
 * @property {Object} [chat_info] - Optional chat logic.
 * @property {Object} [bot_config] - Optional bot settings.
 * @property {Object} [lead_details] - Optional lead capture config.
 * @property {Object} [company_details] - Optional company info.
 */

/**
 * @typedef {Object} UpdateAgentConfigPayload
 * @property {string} [client_id] - Updated client ID (UUID).
 * @property {string} [chat_id] - Updated chat ID (UUID).
 * @property {Object} [chat_info] - Updated chat logic config.
 * @property {Object} [bot_config] - Updated bot settings.
 * @property {Object} [lead_details] - Updated lead capture config.
 * @property {Object} [company_details] - Updated company info.
 */
