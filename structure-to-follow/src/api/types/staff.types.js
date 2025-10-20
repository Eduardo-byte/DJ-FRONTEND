/**
 * @typedef {Object} Staff
 * @property {string} created_at - Timestamp when the staff record was created (timestamp with time zone).
 * @property {string} staff_id - Unique identifier for the staff (UUID).
 * @property {string} [name] - Name of the staff member.
 * @property {string} [email] - Email address of the staff member.
 * @property {string} [client_id] - Client identifier associated with the staff (if applicable).
 * @property {string} [authenticated_id] - Authenticated user ID (UUID, optional).
 * @property {string} [account_status] - Account status (enum: public.account_status_enum, optional).
 * @property {string} [trial_start] - Timestamp when the trial period started (optional).
 * @property {string} [trial_end] - Timestamp when the trial period ended (optional).
 * @property {string} [trial_message_count] - Number of messages allowed during trial (optional).
 * @property {string} [trial_current_message_count] - Number of messages used during trial (optional).
 * @property {string} [account_type] - Type of account (enum: public.account_type, optional).
 * @property {string} [contact_name] - Contact name for the staff member (optional).
 * @property {string} [role] - Role of the staff member (enum: public.account_role, optional).
 * @property {string} [company_name] - Name of the company (optional).
 * @property {string} [contact_email] - Contact email for the staff member (optional).
 * @property {boolean} [isFirstTimeUser] - Flag indicating if this is the staff's first time (optional).
 */

/**
 * @typedef {Object} CreateStaffPayload
 * @property {string} [name] - Name of the staff member.
 * @property {string} [email] - Email address of the staff member.
 * @property {string} [client_id] - Client identifier associated with the staff (if applicable).
 * @property {string} [authenticated_id] - Authenticated user ID (UUID, optional).
 * @property {string} [account_status] - Account status (enum: public.account_status_enum, optional).
 * @property {string} [trial_start] - Timestamp when the trial period started (optional).
 * @property {string} [trial_end] - Timestamp when the trial period ended (optional).
 * @property {string} [trial_message_count] - Number of messages allowed during trial (optional).
 * @property {string} [trial_current_message_count] - Number of messages used during trial (optional).
 * @property {string} [account_type] - Type of account (enum: public.account_type, optional).
 * @property {string} [contact_name] - Contact name for the staff member (optional).
 * @property {string} [role] - Role of the staff member (enum: public.account_role, optional).
 * @property {string} [company_name] - Name of the company (optional).
 * @property {string} [contact_email] - Contact email for the staff member (optional).
 * @property {boolean} [isFirstTimeUser] - Flag indicating if this is the staff's first time (optional).
 */

/**
 * @typedef {Object} UpdateStaffPayload
 * @property {string} [name] - Updated name of the staff member.
 * @property {string} [email] - Updated email address.
 * @property {string} [client_id] - Updated client identifier.
 * @property {string} [authenticated_id] - Updated authenticated user ID.
 * @property {string} [account_status] - Updated account status (enum: public.account_status_enum).
 * @property {string} [trial_start] - Updated trial start timestamp.
 * @property {string} [trial_end] - Updated trial end timestamp.
 * @property {string} [trial_message_count] - Updated trial message count.
 * @property {string} [trial_current_message_count] - Updated current trial message count.
 * @property {string} [account_type] - Updated account type (enum: public.account_type).
 * @property {string} [contact_name] - Updated contact name.
 * @property {string} [role] - Updated role (enum: public.account_role).
 * @property {string} [company_name] - Updated company name.
 * @property {string} [contact_email] - Updated contact email.
 * @property {boolean} [isFirstTimeUser] - Updated flag for first time user.
 */
