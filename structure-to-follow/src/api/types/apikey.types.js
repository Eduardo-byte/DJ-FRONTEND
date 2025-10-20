/**
 * @typedef {Object} ApiKey
 * @property {string} id - The unique identifier of the API key
 * @property {string} client_id - The client identifier
 * @property {string} name - The name/label of the API key
 * @property {string} key_value - The actual API key value
 * @property {string} key_prefix - The prefix of the API key for display
 * @property {string} key_hash - The hashed version of the API key
 * @property {boolean} is_active - Whether the API key is active
 * @property {(string|Object)[]} scopes - Array of scopes granted to this API key (can include wildcard objects like {"messages": "*"})
 * @property {string} description - Optional description for the API key
 * @property {string} created_at - The creation timestamp
 * @property {string} updated_at - The last update timestamp
 * @property {string|null} last_used_at - The last usage timestamp
 * @property {string|null} expires_at - The expiration timestamp (null for no expiration)
 * @property {string} created_by - The user who created the API key
 */

/**
 * @typedef {Object} CreateApiKeyPayload
 * @property {string} email - Client email address
 * @property {string} name - The name/label for the API key
 * @property {string} [description] - Optional description for the API key
 * @property {(string|Object)[]} scopes - Array of scopes to grant (can include wildcard objects like {"messages": "*"})
 * @property {string|null} [expires_at] - Optional expiration date
 */

/**
 * @typedef {Object} UpdateApiKeyPayload
 * @property {string} [name] - The updated name/label for the API key
 * @property {string} [description] - Updated description for the API key
 * @property {boolean} [is_active] - Whether the API key should be active
 * @property {(string|Object)[]} [scopes] - Updated array of scopes (resource:action format or wildcard objects like {"messages": "*"})
 * @property {string|null} [expires_at] - Updated expiration date
 */

/**
 * Available API key scopes (resource:action format)
 */
export const API_KEY_SCOPES = {
    // Global wildcard
    
    // Opportunities scopes
    OPPORTUNITIES_READ: 'opportunities:read',
    OPPORTUNITIES_WRITE: 'opportunities:write',
    OPPORTUNITIES_UPDATE: 'opportunities:update',
    OPPORTUNITIES_DELETE: 'opportunities:delete',
    
    // Messages scopes
    MESSAGES_READ: 'messages:read',
    MESSAGES_WRITE: 'messages:write',
    MESSAGES_UPDATE: 'messages:update',
    MESSAGES_DELETE: 'messages:delete',
    
    // AI Agent scopes
    AI_AGENT_READ: 'ai-agent:read',
    AI_AGENT_WRITE: 'ai-agent:write',
    AI_AGENT_UPDATE: 'ai-agent:update',
    AI_AGENT_DELETE: 'ai-agent:delete',
    
    // Metrics scopes (read-only)
    METRICS_READ: 'metrics:read',
    
    // AI Response scopes
    AI_READ: 'ai:read',
    AI_WRITE: 'ai:write',
    
    // Scraper scopes
    SCRAPER_READ: 'scraper:read',
    SCRAPER_WRITE: 'scraper:write',
    
    // Scraped Content scopes
    SCRAPED_CONTENT_READ: 'scraped-content:read',
    SCRAPED_CONTENT_UPDATE: 'scraped-content:update',
    SCRAPED_CONTENT_DELETE: 'scraped-content:delete',
    
    // Webhook scopes
    WEBHOOKS_READ: 'webhooks:read',
    WEBHOOKS_WRITE: 'webhooks:write'
};

/**
 * Scope groups for easier management
 */
export const SCOPE_GROUPS = {
    OPPORTUNITIES: {
        label: 'Opportunities',
        description: 'Lead and opportunity management',
        scopes: [
            API_KEY_SCOPES.OPPORTUNITIES_READ,
            API_KEY_SCOPES.OPPORTUNITIES_WRITE,
            API_KEY_SCOPES.OPPORTUNITIES_UPDATE,
            API_KEY_SCOPES.OPPORTUNITIES_DELETE
        ]
    },
    MESSAGES: {
        label: 'Messages',
        description: 'Multi-channel messaging platform',
        scopes: [
            API_KEY_SCOPES.MESSAGES_READ,
            API_KEY_SCOPES.MESSAGES_WRITE,
            API_KEY_SCOPES.MESSAGES_UPDATE,
            API_KEY_SCOPES.MESSAGES_DELETE
        ]
    },
    AI_AGENT: {
        label: 'AI Agent',
        description: 'Create, Read, Update and Delete your AI-Agents',
        scopes: [
            API_KEY_SCOPES.AI_AGENT_READ,
            API_KEY_SCOPES.AI_AGENT_WRITE,
            API_KEY_SCOPES.AI_AGENT_UPDATE,
            API_KEY_SCOPES.AI_AGENT_DELETE
        ]
    },
    METRICS: {
        label: 'Metrics',
        description: 'Performance analytics (read-only)',
        scopes: [
            API_KEY_SCOPES.METRICS_READ
        ]
    },
    AI: {
        label: 'AI Response',
        description: 'AI response generation',
        scopes: [
            API_KEY_SCOPES.AI_WRITE
        ]
    },
    SCRAPER: {
        label: 'Scraper',
        description: 'Web scraping tools - Train your AI-Agent with your own data',
        scopes: [
            API_KEY_SCOPES.SCRAPER_READ,
            API_KEY_SCOPES.SCRAPER_WRITE
        ]
    },
    SCRAPED_CONTENT: {
        label: 'Scraped Content',
        description: 'Scraped content repository',
        scopes: [
            API_KEY_SCOPES.SCRAPED_CONTENT_READ,
            API_KEY_SCOPES.SCRAPED_CONTENT_UPDATE,
            API_KEY_SCOPES.SCRAPED_CONTENT_DELETE
        ]
    },
    WEBHOOKS: {
        label: 'Webhooks',
        description: 'Event-driven webhooks',
        scopes: [
            API_KEY_SCOPES.WEBHOOKS_READ,
            API_KEY_SCOPES.WEBHOOKS_WRITE
        ]
    }
};
