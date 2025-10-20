/**
 * @typedef {Object} FacebookProfile
 * @property {string} id - The Facebook user ID
 * @property {string} name - The user's name
 * @property {string} [email] - The user's email (if available)
 * @property {Object} [picture] - The user's profile picture
 * @property {Object} picture.data - Picture data
 * @property {number} picture.data.height - Picture height
 * @property {boolean} picture.data.is_silhouette - Whether the picture is a silhouette
 * @property {string} picture.data.url - Picture URL
 * @property {number} picture.data.width - Picture width
 */

/**
 * @typedef {Object} FacebookPage
 * @property {string} id - The Facebook page ID
 * @property {string} name - The page name
 * @property {string} access_token - The page access token
 */

/**
 * @typedef {Object} FacebookMessage
 * @property {string} id - The message ID
 * @property {string} message - The message text
 * @property {string} created_time - The message creation timestamp
 * @property {Object} from - The sender
 * @property {string} from.id - The sender ID
 * @property {string} from.name - The sender name
 * @property {Object} to - The recipient
 * @property {Array} to.data - Array of recipients
 */

/**
 * @typedef {Object} FacebookUser
 * @property {string} id - The user ID
 * @property {string} name - The user name
 * @property {string} [email] - The user email
 * @property {string} [profile_pic] - The user profile picture URL
 */

/**
 * @typedef {Object} FacebookAttachment
 * @property {string} type - The attachment type (image, video, audio, file)
 * @property {string} url - The attachment URL
 */

/**
 * @typedef {Object} FacebookProfileResponse
 * @property {boolean} success - Whether the request was successful
 * @property {FacebookProfile} profile - The Facebook profile
 */

/**
 * @typedef {Object} FacebookPagesResponse
 * @property {boolean} success - Whether the request was successful
 * @property {FacebookPage[]} pages - Array of Facebook pages
 */

/**
 * @typedef {Object} FacebookMessagesResponse
 * @property {boolean} success - Whether the request was successful
 * @property {FacebookMessage[]} messages - Array of Facebook messages
 */

/**
 * @typedef {Object} FacebookUserResponse
 * @property {boolean} success - Whether the request was successful
 * @property {FacebookUser} user - The Facebook user
 */

/**
 * @typedef {Object} FacebookMessageResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} messageId - The ID of the sent message
 */

/**
 * @typedef {Object} FacebookThreadControlResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} result - The result of the thread control operation
 * @property {boolean} result.success - Whether the thread control operation was successful
 */

/**
 * @typedef {Object} FacebookErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} message - The error message
 * @property {string} [details] - Optional error details
 */

export {};
