/**
 * @typedef {Object} User
 * @property {string} user_id - Unique identifier for the user (UUID).
 * @property {string} email - Email address of the user.
 * @property {string} [first_name] - First name of the user.
 * @property {string} [last_name] - Last name of the user.
 * @property {string} [phone_number] - Phone number of the user.
 * @property {string} [registration_date] - Registration date (timestamp with time zone).
 * @property {string} [client_id] - Client identifier (UUID).
 * @property {string} [updated_at] - Last updated timestamp (timestamp with time zone).
 * @property {string} status - Current status of the user (enum: public.status).
 * @property {string} channel - Communication channel (enum: public.channel).
 * @property {string} [avatar_img] - URL or reference to the user's avatar image.
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} email - Email address of the user.
 * @property {string} status - User status (enum: public.status).
 * @property {string} channel - Communication channel (enum: public.channel).
 * @property {string} [first_name] - First name of the user.
 * @property {string} [last_name] - Last name of the user.
 * @property {string} [phone_number] - Phone number of the user.
 * @property {string} [client_id] - Client identifier (UUID).
 * @property {string} [avatar_img] - URL or reference to the user's avatar image.
 */

/**
 * @typedef {Object} UpdateUserPayload
 * @property {string} [email] - Updated email address.
 * @property {string} [first_name] - Updated first name.
 * @property {string} [last_name] - Updated last name.
 * @property {string} [phone_number] - Updated phone number.
 * @property {string} [client_id] - Updated client identifier (UUID).
 * @property {string} [status] - Updated user status (enum: public.status).
 * @property {string} [channel] - Updated communication channel (enum: public.channel).
 * @property {string} [avatar_img] - Updated avatar image.
 */
