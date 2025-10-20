/**
 * @typedef {Object} Chat
 * @property {string} chat_id - Unique identifier for the chat (UUID).
 * @property {string} [client_id] - ID of the client associated with the chat (UUID, optional).
 * @property {string} [created_at] - Timestamp when the chat was created (date).
 * @property {string} [updated_at] - Timestamp when the chat was last updated.
 * @property {Object} [chat_config] - JSON object containing chat configuration.
 * @property {Object} [ai_config] - JSON object containing AI configuration.
 * @property {string} [training_data_location] - Location where training data is stored.
 * @property {string} [last_trained] - Date when the chat was last trained.
 * @property {Object} [extra_info] - Additional JSON object with extra information.
 * @property {Object} [training_data] - JSON object containing training data.
 * @property {boolean} [is_form_deactivated] - Flag indicating if the chat form is deactivated.
 * @property {string} [booking_link] - URL for the booking link.
 * @property {string} [model_name] - AI model name used.
 * @property {number} [response_delay] - Response delay (real number).
 * @property {string} [chat_type] - Chat type (enum: public.chat_type).
 * @property {string} [form_fields] - Form fields configuration (enum: public.form_fields).
 * @property {string} country_code - Country code.
 */

/**
 * @typedef {Object} CreateChatPayload
 * @property {string} [client_id] - ID of the client associated with the chat (UUID, optional).
 * @property {Object} [chat_config] - JSON object containing chat configuration.
 * @property {Object} [ai_config] - JSON object containing AI configuration.
 * @property {string} [training_data_location] - Location where training data is stored.
 * @property {Object} [extra_info] - Additional JSON object with extra information.
 * @property {Object} [training_data] - JSON object containing training data.
 * @property {boolean} [is_form_deactivated] - Flag indicating if the chat form is deactivated.
 * @property {string} [booking_link] - URL for the booking link.
 * @property {string} [model_name] - AI model name used.
 * @property {number} [response_delay] - Response delay (real number).
 * @property {string} [chat_type] - Chat type (enum: public.chat_type).
 * @property {string} [form_fields] - Form fields configuration (enum: public.form_fields).
 * @property {string} country_code - Country code.
 */

/**
 * @typedef {Object} UpdateChatPayload
 * @property {string} [client_id] - Updated client ID (UUID, optional).
 * @property {Object} [chat_config] - Updated chat configuration.
 * @property {Object} [ai_config] - Updated AI configuration.
 * @property {string} [training_data_location] - Updated location of training data.
 * @property {string} [last_trained] - Updated last trained date.
 * @property {Object} [extra_info] - Updated extra information.
 * @property {Object} [training_data] - Updated training data.
 * @property {boolean} [is_form_deactivated] - Updated form deactivation flag.
 * @property {string} [booking_link] - Updated booking link.
 * @property {string} [model_name] - Updated AI model name.
 * @property {number} [response_delay] - Updated response delay.
 * @property {string} [chat_type] - Updated chat type.
 * @property {string} [form_fields] - Updated form fields configuration.
 * @property {string} [country_code] - Updated country code.
 */
