/**
 * @typedef {Object} MetaAppIdResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} appId - The Meta app ID for frontend authentication
 */

/**
 * @typedef {Object} TokenExchangeRequest
 * @property {string} pageId - The ID of the Facebook page
 * @property {string} pageName - The name of the Facebook page
 * @property {string} accessToken - The short-lived access token to exchange
 */

/**
 * @typedef {Object} TokenExchangeResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} pageId - The ID of the Facebook page
 * @property {string} pageName - The name of the Facebook page
 * @property {string} longLivedToken - The long-lived access token
 */

/**
 * @typedef {Object} MetaErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} message - The error message
 * @property {string} [details] - Optional error details
 */

export {};
