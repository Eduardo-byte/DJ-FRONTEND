/**
 * @typedef {Object} InstagramBusinessAccount
 * @property {string} id - The Instagram Business Account ID
 * @property {string} name - The account name
 * @property {string} username - The Instagram username
 * @property {string} [profile_picture_url] - The profile picture URL
 */

/**
 * @typedef {Object} InstagramProfile
 * @property {string} id - The Instagram Business Account ID
 * @property {string} username - The Instagram username
 * @property {string} name - The account name
 * @property {string} [profile_picture_url] - The profile picture URL
 * @property {string} [biography] - The account biography
 * @property {string} [website] - The account website
 * @property {number} [followers_count] - The number of followers
 * @property {number} [follows_count] - The number of accounts followed
 * @property {number} [media_count] - The number of media items
 */

/**
 * @typedef {Object} InstagramMedia
 * @property {string} id - The media ID
 * @property {string} [caption] - The media caption
 * @property {string} media_type - The media type (IMAGE, VIDEO, CAROUSEL_ALBUM)
 * @property {string} media_url - The media URL
 * @property {string} permalink - The permanent link to the media
 * @property {string} [thumbnail_url] - The thumbnail URL (for videos)
 * @property {string} timestamp - The media creation timestamp
 * @property {string} username - The Instagram username
 */

/**
 * @typedef {Object} InstagramMessage
 * @property {string} id - The message ID
 * @property {string} message - The message text
 * @property {string} created_time - The message creation timestamp
 * @property {Object} from - The sender
 * @property {string} from.id - The sender ID
 * @property {string} from.username - The sender username
 * @property {Object} to - The recipient
 * @property {Array} to.data - Array of recipients
 */

/**
 * @typedef {Object} InstagramUser
 * @property {string} id - The user ID
 * @property {string} username - The user username
 * @property {string} [profile_picture_url] - The user profile picture URL
 * @property {string} [name] - The user name
 */

/**
 * @typedef {Object} InstagramAttachment
 * @property {string} type - The attachment type (image, video, audio, file)
 * @property {string} url - The attachment URL
 */

/**
 * @typedef {Object} InstagramAccountsResponse
 * @property {boolean} success - Whether the request was successful
 * @property {InstagramBusinessAccount[]} instagramAccounts - Array of Instagram Business Accounts
 */

/**
 * @typedef {Object} InstagramProfileResponse
 * @property {boolean} success - Whether the request was successful
 * @property {InstagramProfile} profile - The Instagram profile
 */

/**
 * @typedef {Object} InstagramMediaResponse
 * @property {boolean} success - Whether the request was successful
 * @property {InstagramMedia[]} media - Array of Instagram media items
 */

/**
 * @typedef {Object} InstagramMessagesResponse
 * @property {boolean} success - Whether the request was successful
 * @property {InstagramMessage[]} messages - Array of Instagram messages
 */

/**
 * @typedef {Object} InstagramUserResponse
 * @property {boolean} success - Whether the request was successful
 * @property {InstagramUser} user - The Instagram user
 */

/**
 * @typedef {Object} InstagramMessageResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} messageId - The ID of the sent message
 */

/**
 * @typedef {Object} InstagramThreadControlResponse
 * @property {boolean} success - Whether the request was successful
 * @property {Object} result - The result of the thread control operation
 * @property {boolean} result.success - Whether the thread control operation was successful
 */

/**
 * @typedef {Object} InstagramErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} message - The error message
 * @property {string} [details] - Optional error details
 */

export {};
