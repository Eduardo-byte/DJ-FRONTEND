/**
 * @typedef {Object} Message
 * @property {string} message_id - Unique identifier for the message (UUID).
 * @property {string} [chat_id] - Identifier of the chat (UUID, optional).
 * @property {string} [user_id] - Identifier of the user (UUID, optional).
 * @property {string} [created_at] - Timestamp when the message was created (timestamp with time zone, optional).
 * @property {Object} content - JSON object containing the message content (jsonb).
 * @property {Object} [lead_details] - Additional details regarding the lead (jsonb, optional).
 * @property {string} message_type - The type of message (text).
 * @property {string} [client_id] - Identifier of the client (UUID, optional).
 * @property {string} [company_name] - Name of the company (text, optional).
 * @property {string} [bot_name] - Name of the bot (text, optional).
 * @property {boolean} [isLiveAgent] - Flag indicating if the message is from a live agent (optional).
 * @property {string} [updated_at] - Timestamp when the message was updated (timestamp with time zone, optional).
 */

/**
 * @typedef {Object} CreateMessagePayload
 * @property {string} [chat_id] - Identifier of the chat (UUID, optional).
 * @property {string} [user_id] - Identifier of the user (UUID, optional).
 * @property {Object} content - JSON object containing the message content (jsonb).
 * @property {Object} [lead_details] - Additional details regarding the lead (jsonb, optional).
 * @property {string} message_type - The type of message (text).
 * @property {string} [client_id] - Identifier of the client (UUID, optional).
 * @property {string} [company_name] - Name of the company (text, optional).
 * @property {string} [bot_name] - Name of the bot (text, optional).
 * @property {boolean} [isLiveAgent] - Flag indicating if the message is from a live agent (optional).
 */

/**
 * @typedef {Object} UpdateMessagePayload
 * @property {string} [chat_id] - Updated identifier of the chat (UUID, optional).
 * @property {string} [user_id] - Updated identifier of the user (UUID, optional).
 * @property {Object} [content] - Updated JSON object containing the message content (jsonb).
 * @property {Object} [lead_details] - Updated additional details regarding the lead (jsonb, optional).
 * @property {string} [message_type] - Updated type of message (text).
 * @property {string} [client_id] - Updated identifier of the client (UUID, optional).
 * @property {string} [company_name] - Updated name of the company (text, optional).
 * @property {string} [bot_name] - Updated name of the bot (text, optional).
 * @property {boolean} [isLiveAgent] - Updated flag indicating if the message is from a live agent (optional).
 */
