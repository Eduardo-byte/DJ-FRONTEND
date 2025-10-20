/**
 * @typedef {Object} AIRequestPayload
 * @property {string} chatId - The unique identifier for the chat session
 * @property {string} userInput - The user's message
 * @property {string} chatHistory - The history of the conversation
 */

/**
 * @typedef {Object} AIResponseData
 * @property {boolean} success - Whether the AI operation was successful
 * @property {string} data - The AI response text
 */

/**
 * @typedef {Object} AIResponse
 * @property {boolean} success - Whether the request was successful
 * @property {number} statusCode - The HTTP status code
 * @property {string} message - A message describing the result
 * @property {number} elapsedTime - The time taken to process the request in milliseconds
 * @property {AIResponseData} data - The response data
 */

export {};
