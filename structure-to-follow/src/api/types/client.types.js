/**
 * @typedef {Object} Client
 * @property {string} client_id - Unique identifier for the client (UUID)
 * @property {string} company_name - Name of the company
 * @property {string} contact_name - Name of the primary contact
 * @property {string} contact_email - Email address of the contact
 * @property {string} [contact_phone] - Phone number of the contact (optional)
 * @property {string} [address] - Physical address of the client (optional)
 * @property {string} [website] - URL for the client's website (optional)
 * @property {string} [registration_date] - Timestamp when the client registered (optional)
 * @property {string} [last_logged_in] - Timestamp when the client last logged in (optional)
 * @property {string} account_status - Status of the account (enum: public.account_status_enum)
 * @property {string} [subscription_id] - Subscription identifier (UUID, optional)
 * @property {string} role - Role of the client (enum: public.account_role)
 * @property {string} [trial_start] - Timestamp when the trial period started (optional)
 * @property {string} [trial_end] - Timestamp when the trial period ended (optional)
 * @property {number} [trial_message_count] - Total allowed messages during trial (optional)
 * @property {number} [trial_current_message_count] - Number of messages used during trial (optional)
 * @property {string} [account_type] - Type of account (enum: public.account_type, optional)
 * @property {boolean} isFirstTimeUser - Flag indicating if this is the user's first time
 * @property {string} [first_name] - First name of the contact (optional)
 * @property {string} [last_name] - Last name of the contact (optional)
 * @property {string} [authenticated_id] - Authenticated user ID (UUID, optional)
 * @property {string} [preferable_contact] - Preferred contact method (enum: public.prefered_contact, optional)
 * @property {boolean} [is_notifications_on] - Flag to indicate if notifications are enabled (optional)
 * @property {Object} preferable_emails - JSON object containing email preferences
 * @property {Object} preferable_phone - JSON object containing phone preferences
 * @property {Object} [products] - JSON object representing products associated with the client (optional)
 */

/**
 * @typedef {Object} CreateClientPayload
 * @property {string} company_name - Name of the company
 * @property {string} contact_name - Name of the primary contact
 * @property {string} contact_email - Email address of the contact
 * @property {string} [contact_phone] - Phone number of the contact (optional)
 * @property {string} [address] - Physical address of the client (optional)
 * @property {string} [website] - URL for the client's website (optional)
 * @property {string} account_status - Status of the account (enum: public.account_status_enum)
 * @property {string} role - Role of the client (enum: public.account_role)
 * @property {boolean} isFirstTimeUser - Flag indicating if this is the user's first time
 * @property {Object} preferable_emails - JSON object containing email preferences
 * @property {Object} preferable_phone - JSON object containing phone preferences
 * @property {Object} [products] - JSON object representing products associated with the client (optional)
 */

/**
 * @typedef {Object} UpdateClientPayload
 * @property {string} [company_name] - Updated company name
 * @property {string} [contact_name] - Updated contact name
 * @property {string} [contact_email] - Updated contact email
 * @property {string} [contact_phone] - Updated contact phone (optional)
 * @property {string} [address] - Updated physical address (optional)
 * @property {string} [website] - Updated website URL (optional)
 * @property {string} [account_status] - Updated account status (enum: public.account_status_enum)
 * @property {string} [role] - Updated role (enum: public.account_role)
 * @property {boolean} [isFirstTimeUser] - Updated flag for first time user
 * @property {Object} [preferable_emails] - Updated JSON object for email preferences
 * @property {Object} [preferable_phone] - Updated JSON object for phone preferences
 * @property {Object} [products] - Updated products information (optional)
 * @property {string} [registration_date] - Updated registration timestamp (optional)
 * @property {string} [last_logged_in] - Updated last login timestamp (optional)
 * @property {string} [trial_start] - Updated trial start timestamp (optional)
 * @property {string} [trial_end] - Updated trial end timestamp (optional)
 * @property {number} [trial_message_count] - Updated trial message count (optional)
 * @property {number} [trial_current_message_count] - Updated current trial message count (optional)
 * @property {string} [account_type] - Updated account type (enum: public.account_type, optional)
 * @property {string} [first_name] - Updated first name (optional)
 * @property {string} [last_name] - Updated last name (optional)
 * @property {string} [authenticated_id] - Updated authenticated user ID (UUID, optional)
 * @property {string} [preferable_contact] - Updated preferred contact method (enum: public.prefered_contact, optional)
 * @property {boolean} [is_notifications_on] - Updated notifications flag (optional)
 */

/**
 * @typedef {Object} ClientByEmailData
 * @property {string} client_id - Unique identifier for the client (UUID)
 * @property {string} email - Email address of the client
 * @property {string} company_name - Name of the company
 * @property {string} first_name - First name of the client
 * @property {string} last_name - Last name of the client
 */

/**
 * @typedef {Object} ClientByEmailResponse
 * @property {boolean} success - Indicates if the request was successful
 * @property {number} statusCode - HTTP status code
 * @property {string} message - Response message
 * @property {number} elapsedTime - Time taken to process the request in milliseconds
 * @property {ClientByEmailData} data - The client data
 */
