const API_URL = import.meta.env.VITE_API_URL;
const WEBSCRAPER_URL = import.meta.env.VITE_WEBSCRAPER_URL;
const SOCIAL_URL = import.meta.env.VITE_SOCIAL_URL;
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

export const API_URL_KEY = import.meta.env.VITE_API_URL_KEY;
export const WEBSCRAPER_API_KEY = import.meta.env.VITE_WEBSCRAPER_API_KEY;
export const SOCIAL_API_KEY = import.meta.env.VITE_SOCAIL_API_KEY;
export const API_GATEWAY_JWT = import.meta.env.VITE_API_GATEWAY_JWT;


export const ENDPOINTS = {
    CLIENTS: {
        READ_BY_AUD_ID: `${API_GATEWAY_URL}/api/v2/client/read_aud_id/:audId`,
        READ_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/client/read/:clientId`,
        READ_BY_CLIENT_EMAIL: `${API_GATEWAY_URL}/api/v2/client/read-user/:email`,
        READ_ALL_CLIENTS: `${API_GATEWAY_URL}/api/v2/client/read_all/`,
        UPDATE_CLIENT: `${API_GATEWAY_URL}/api/v2/client/update/:clientId`,
        CREATE_CLIENT_BY_EMAIL_PASSWORD: `${API_GATEWAY_URL}/api/v2/client/create`,
        INSERT_CLIENT: `${API_GATEWAY_URL}/api/v2/client/insert`,
    },
    CHATS: {
        READ_ALL_CHATS_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/chat/read_all/:clientId`,
        READ_CHATS_BY_CHAT_ID: `${API_GATEWAY_URL}/api/v2/chat/read/:chatId`,
        CREATE_AGENT: `${API_GATEWAY_URL}/api/v2/chat/create`,
        CREATE_AI_CONFIG: `${API_GATEWAY_URL}/api/v2/ai/chatbot/generate-json/:chatId`,
        DELETE_AGENT: `${API_GATEWAY_URL}/api/v2/chat/delete/:chatId`,
        UPDATE_AGENT: `${API_GATEWAY_URL}/api/v2/chat/update/:chatId`
    },
    CHATCONFIG: {
        READ_BY_CHAT_ID: `${API_GATEWAY_URL}/api/v2/chatConfig/chat/:chatId`,
        READ_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/chatConfig/client/:clientId`,
        UPDATE_CHAT_CONFIG: `${API_GATEWAY_URL}/api/v2/chatConfig/:Id`
    },
    AGENTCONFIG: {
        READ_BY_CHAT_ID: `${API_GATEWAY_URL}//api/v2/agentConfig/chat/:chatId`,
        READ_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/agentConfig/client/:clientId`,
        UPDATE_AGENT_CONFIG: `${API_GATEWAY_URL}/api/v2/agentConfig/:id`
    },
    CONVERSATIONS: {
        READ_AGENT_STATUS_BY_MESSAGE_ID: `${API_GATEWAY_URL}/api/v2/messages/:messageId`,
        UPDATE_CONVERSATION: `${API_GATEWAY_URL}/api/v2/messages/:messageId`,
        UPDATE_IS_LIVE_AGENT: `${API_GATEWAY_URL}/api/v2/messages/:messageId`,
        GET_ALL_MESSAGES_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/messages/client/:clientId`,
        GET_ALL_MESSAGES_BY_USER_ID: `${API_GATEWAY_URL}/api/v2/messages/user/:userId`,
        // New optimized conversations endpoints
        GET_CONVERSATIONS_PAGINATED: `${API_GATEWAY_URL}/api/v2/messages/paginated`,
        GET_FULL_CONVERSATION: `${API_GATEWAY_URL}/api/v2/messages/:messageId/full`,
    },
    STAFF: {
        CREATE_STAFF: `${API_GATEWAY_URL}/api/v2/staff/insert/`,
        UPDATE_STAFF: `${API_GATEWAY_URL}/api/v2/staff/update/:staffId`,
        FETCH_ALL_STAFF: `${API_GATEWAY_URL}/api/v2/staff/read_all/`,
        FETCH_STAFF_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/staff/read_by_client_id/:clientId`,
        FETCH_STAFF_BY_EMAIL: `${API_GATEWAY_URL}/api/v2/staff/read_by_email/:email`,
        FETCH_STAFF_BY_AUD_ID: `${API_GATEWAY_URL}/api/v2/staff/read_auth_id/:audId`,
        DELETE_STAFF: `${API_GATEWAY_URL}/api/v2/staff/delete/:staffId/:authenticatedId`,
    },
    USERS: {
        READ_ALL_USERS: `${API_GATEWAY_URL}/api/v2/users/client/:clientId`,
        UPDATE_USER: `${API_GATEWAY_URL}/api/v2/users/:userId`,
        DELETE_USERS: `${API_GATEWAY_URL}/api/v2/users/delete`,
    },
    METRICS: {
        READ_MESSAGES_METRICS_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/metrics/messages/:clientId`,
        READ_COMPREHENSIVE_METRICS_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/metrics/comprehensive/:clientId`,
        READ_CHAT_METRICS_BY_CHAT_ID: `${API_GATEWAY_URL}/api/v2/metrics/chat/:chatId`,
    },
    WEBSCRAPER: {
        AGENT: {
            GENERATE_QUALIFICATION_QUESTION: `${API_GATEWAY_URL}/api/v2/agent/qualification-questions`,
            GENERATE_AGENT_INFO: `${API_GATEWAY_URL}/api/v2/agent/agent-info`,
            GENERATE_ANSWERS: `${API_GATEWAY_URL}/api/v2/agent/answers`,
            GENERATE_FULL_FLOW: `${API_GATEWAY_URL}/api/v2/agent/combined-workflow`,
            REGENERATE_QUALIFICATION_QUESTIONS: `${API_GATEWAY_URL}/api/v2/agent/regenerate-questions`,
            REGENERATE_QA: `${API_GATEWAY_URL}/api/v2/agent/regenerate-qa`
        },
        PINECONE: {
            UPDATE_RECORD_BY_ID: `${API_GATEWAY_URL}/api/v2/pinecone/update`,
            // DELETE_RECORD_BY_ID: `${WEBSCRAPER_URL}/api/v2/pinecone/delete`,
            DELETE_RECORD_BY_ID: `${API_GATEWAY_URL}/api/v2/pinecone/delete`,
            GET_ALL_RECORDS_BY_ID: `${API_GATEWAY_URL}/api/v2/pinecone/list-namespace`,
            SCRAPE_AND_INSERT_IN_PINECONE: `${API_GATEWAY_URL}/api/v2/pinecone/scrape-and-insert`,
            INSERT_DOCUMENTS_IN_PINECONE: `${API_GATEWAY_URL}/api/v2/pinecone/insert-documents`,
            INSERT_QA_DOCUMENT: `${API_GATEWAY_URL}/api/v2/pinecone/insert-qa-document`,
            INSERT_QA_DOCUMENT_V2: `${API_GATEWAY_URL}/api/v2/pinecone/insert-qa-document-with-complete-flow`,
            INSERT_PDF_DOCUMENT: `${API_GATEWAY_URL}/api/v2/pinecone/process-pdf-and-insert`,
            INSERT_PDF_DOCUMENT_V2: `${API_GATEWAY_URL}/api/v2/pinecone/process-documents-and-insert`,
        },
        SCRAPER: {
            PROCESS_SINGLE_URL: `${API_GATEWAY_URL}/api/v2/scraper/process-url`,
            PROCESS_SINGLE_URL_V2: `${API_GATEWAY_URL}/api/v2/scraper/url-process`,
            PROCESS_MULTIPLE_URLS: `${API_GATEWAY_URL}/api/v2/scraper/batch-process`,
            CRAWL_WEBSITE_URL: `${API_GATEWAY_URL}/api/v2/scraper/crawl-url`,
            DELETE_AND_CRAWL: `${API_GATEWAY_URL}/api/v2/scraper/delete-and-crawl`,
            GET_CRAWL_JOB_STATUS: `${API_GATEWAY_URL}/api/v2/scraper/crawl-status/:jobId`,
            START_CRAWL_CRON_JOB: `${API_GATEWAY_URL}/api/v2/scraper/crawl-and-process/:agentId`,
        },
        CONTENT_SCRAPER: {
            CREATE_SCRAPED_CONTENT: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content`,
            GET_SCRAPED_CONTENT_BY_AGENT_ID: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content/by-agent-id/:agentId`,
            GET_SCRAPED_CONTENT_BY_SOURCE_URL: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content/by-source-url`,
            GET_SCRAPED_CONTENT_BY_SCRAPE_ID: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content/:scrapeId`,
            GET_SCRAPED_CONTENT_BY_SCRAPE_ID_V2: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content/get-by-id/:scrapeId`,
            UPDATE_SCRAPED_CONTENT_BY_ID: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content/:scrapeId`,
            DELETE_SCRAPED_CONTENT_BY_ID: `${API_GATEWAY_URL}/api/v2/supabase/scraped-content/:scrapeId`,
        }
    },
    SOCIAL: {
        INTEGRATIONS: {
            CREATE_INTEGRATION: `${API_GATEWAY_URL}/api/v2/integrations`,
            GET_INTEGRATIONS_BY_AGENT_ID: `${API_GATEWAY_URL}/api/v2/integrations/chat/:agentId`,
            GET_INTEGRATIONS_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/integrations/client/:clientId`,
            GET_INTEGRATION_BY_ID: `${API_GATEWAY_URL}/api/v2/integrations/:id`,
            GET_INTEGRATION_BY_REF_CODE: `${API_GATEWAY_URL}/api/v2/integrations/refCode/:refCode`,
            UPDATE_INTEGRATION_BY_ID: `${API_GATEWAY_URL}/api/v2/integrations/:id`,
            DELETE_INTEGRATION_BY_ID: `${API_GATEWAY_URL}/api/v2/integrations/:id`,
            DELETE_INTEGRATIONS_BY_AGENT_ID: `${API_GATEWAY_URL}/api/v2/integrations/chat/:agentId`,
        },
        META: {
            AUTH: {
                GET_APP_ID: `${API_GATEWAY_URL}/api/v2/meta/app-id`,
                EXCHANGE_TOKEN: `${API_GATEWAY_URL}/api/v2/meta/exchange-token`,
                SUBSCRIBE_PAGE: `${API_GATEWAY_URL}/api/v2/meta/subscribe-page`,
                SUBSCRIBE_INSTAGRAM_PAGE: `${API_GATEWAY_URL}/api/v2/meta/subscribe-instagram-page`,
                UNSUBSCRIBE_PAGE: `${API_GATEWAY_URL}/api/v2/meta/unsubscribe-page`
            },
            FACEBOOK: {
                GET_PROFILE: `${API_GATEWAY_URL}/api/v2/facebook/profile`,
                GET_FB_PAGES: `${API_GATEWAY_URL}/api/v2/facebook/pages`,
                GET_FB_BUSINESS: `${API_GATEWAY_URL}/api/v2/facebook/business`,
                GET_FB_BUSINESS_PAGES: `${API_GATEWAY_URL}/api/v2/facebook/business/pages`,
                GET_MESSAGES_BY_CONVERSATION_ID: `${API_GATEWAY_URL}/api/v2/facebook/messages`,
                GET_MESSAGES_SENDER_PROFILE: `${API_GATEWAY_URL}/api/v2/facebook/message-sender`,
                CREATE_MESSAGE: `${API_GATEWAY_URL}/api/v2/facebook/take-thread-control-and-send-message`,
                TAKE_THREAD_CONTROL: `${API_GATEWAY_URL}/api/v2/facebook/take-thread-control`,
                CREATE_ATTACHMENT_MESSAGE: `${API_GATEWAY_URL}/api/v2/facebook/send-attachment`,
                SEND_MESSAGE: `${API_GATEWAY_URL}/api/v2/facebook/send-message`
            },
            WHATSAPP: {
                GET_APP_ID: `${API_GATEWAY_URL}/api/v2/whatsapp/app-id`,
                EXCHANGE_TOKEN: `${API_GATEWAY_URL}/api/v2/whatsapp/exchange-token`,
                GET_WT_BUSINESS: `${API_GATEWAY_URL}/api/v2/whatsapp/business`,
                GET_WT_TEMPLATES: `${API_GATEWAY_URL}/api/v2/whatsapp/templates`,
                DELETE_WT_TEMPLATE: `${API_GATEWAY_URL}/api/v2/whatsapp/templates`,
                CREATE_WT_TEMPLATE: `${API_GATEWAY_URL}/api/v2/whatsapp/templates`,
                EDIT_WT_TEMPLATE: `${API_GATEWAY_URL}/api/v2/whatsapp/templates/:templateId`,
                SEND_DIRECT_MESSAGE: `${API_GATEWAY_URL}/api/v2/whatsapp/direct-message`,
                SUBSCRIBE_WHATSAPP_PAGE: `${API_GATEWAY_URL}/api/v2/whatsapp/subscribe`,
                VERIFY_PARTNER: `${API_GATEWAY_URL}/api/v2/whatsapp/verify`,
                UNSUBSCRIBE_WHATSAPP_PAGE: `${API_GATEWAY_URL}/api/v2/whatsapp/unsubscribe`
            },
            INSTAGRAM: {
                GET_ACCOUNTS: `${API_GATEWAY_URL}/api/v2/instagram/accounts`,
                GET_PROFILE: `${API_GATEWAY_URL}/api/v2/instagram/profile`,
                GET_IG_MEDIA: `${API_GATEWAY_URL}/api/v2/instagram/media`,
                GET_MESSAGES_BY_CONVERSATION_ID: `${API_GATEWAY_URL}/api/v2/instagram/messages`,
                GET_MESSAGES_SENDER_PROFILE: `${API_GATEWAY_URL}/api/v2/instagram/message-sender`,
                CREATE_MESSAGE: `${API_GATEWAY_URL}/api/v2/instagram/take-thread-control-and-send-message`,
                TAKE_THREAD_CONTROL: `${API_GATEWAY_URL}/api/v2/instagram/take-thread-control`,
                CREATE_ATTACHMENT_MESSAGE: `${API_GATEWAY_URL}/api/v2/instagram/send-attachment`,
                SEND_MESSAGE: `${API_GATEWAY_URL}/api/v2/instagram/send-message`

            },
            CLIENT_EXTENSIONS: {
                CREATE_CLIENT_EXTENSION: `${API_GATEWAY_URL}/api/v2/client-extensions`,
                GET_CLIENT_EXTENSION_BY_ID: `${API_GATEWAY_URL}/api/v2/client-extensions/:id`,
                GET_CLIENT_EXTENSION_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/client-extensions/client/:clientId`,
                UPDATE_CLIENT_EXTENSION_BY_ID: `${API_GATEWAY_URL}/api/v2/client-extensions/:id`,
                DELETE_CLIENT_EXTENSION_BY_ID: `${API_GATEWAY_URL}/api/v2/client-extensions/:id`,
            }
        },
        TELEGRAM: {
            SEND_MESSAGE: `${API_GATEWAY_URL}/api/v2/telegram/send-telegram-message`
        }
    },
    SUBSCRIPTION: {
        // Zoho Endpoints
        PLAN_MANAGEMENT: {
            GET_PAYMENT_LINKS: `${API_GATEWAY_URL}/api/v2/plan-management/payment-links`,
            GET_CLIENT_SUBSCRIPTION_BY_ID: `${API_GATEWAY_URL}/api/v2/plan-management/subscription/:subscriptionId`,
            DOWNGRADE_PLAN: `${API_GATEWAY_URL}/api/v2/plan-management/downgrade`,
            GET_CURRENT_PLAN_FOR_CLIENT_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/plan-management/customer/:clientId/current-plan`,
            SEARCH_CLIENT_BY_EMAIL: `${API_GATEWAY_URL}/api/v2/plan-management/customers/search?email=:email`,
            CANCEL_SUBSCRIPTION_BY_ID: `${API_GATEWAY_URL}/api/v2/plan-management/:subscriptionId/cancel`

        },
        // Supabase Endpoints
        SUBSCRIPTION_PLAN: {
            CREATE_NEW_SUBSCRIPTION: `${API_GATEWAY_URL}/api/v2/subscription_plans`,
            UPDATE_SUBSCRIPTION_BY_ID: `${API_GATEWAY_URL}/api/v2/subscription_plans/:subscriptionId`,
            GET_SUBSCRIPTION_BY_ID: `${API_GATEWAY_URL}/api/v2/subscription_plans/:subscriptionId`,
            GET_SUBSCRIPTION_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/subscription_plans/client/:clientId`,
        }
    },
    WEBHOOK: {
        READ_ALL_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/webhooks/client/:clientId`,
        CREATE_WEBHOOK: `${API_GATEWAY_URL}/api/v2/webhooks`,
        UPDATE_WEBHOOK: `${API_GATEWAY_URL}/api/v2/webhooks/:id`
    },
    API_KEYS: {
        READ_ALL_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/api-key-manager/client/:clientId/api-keys`,
        READ_BY_APIKEY_ID: `${API_GATEWAY_URL}/api/v2/api-key-manager/api-key/:apiKeyId`,
        CREATE_API_KEY: `${API_GATEWAY_URL}/api/v2/api-key-manager/create`,
        UPDATE_API_KEY: `${API_GATEWAY_URL}/api/v2/api-key-manager/update/:apiKeyId`,
        DELETE_API_KEY: `${API_GATEWAY_URL}/api/v2/api-key-manager/api-key/:apiKeyId`,
        REGENERATE_API_KEY: `${API_GATEWAY_URL}/api/v2/api-key-manager/regenerate/:apiKeyId`,
    },
    API_KEYS_USAGE_AND_LOGS: {
        READ_ALL_BY_CLIENT_ID: `${API_GATEWAY_URL}/api/v2/api-key-manager/client/:clientId/api-keys-usage-and-logs`,
        READ_BY_APIKEY_ID: `${API_GATEWAY_URL}/api/v2/api-key-manager/api-key/:apiKeyId/api-keys-usage-and-logs`,
        // Logs endpoints
        LOGS: {
            // GET endpoints
            GET_ALL_LOGS: `${API_GATEWAY_URL}/api/v2/logs`,
            GET_LOG_BY_ID: `${API_GATEWAY_URL}/api/v2/logs/get-by-log-id/:id`,
            GET_LOGS_BY_API_KEY: `${API_GATEWAY_URL}/api/v2/logs/api-key/:apiKeyId`,
            GET_LOGS_BY_CLIENT: `${API_GATEWAY_URL}/api/v2/logs/api-key/client/:clientId`,
            GET_LOGS_BY_CLIENT_SIMPLE: `${API_GATEWAY_URL}/api/v2/logs/api-key/simple-logs/client/:clientId`,
            GET_ANALYTICS_BY_CLIENT: `${API_GATEWAY_URL}/api/v2/logs/api-key/analytics/client/:clientId`,
            GET_LOGS_BY_ENDPOINT: `${API_GATEWAY_URL}/api/v2/logs/endpoint/:endpoint/:clientId`,
            GET_LOGS_BY_STATUS: `${API_GATEWAY_URL}/api/v2/logs/status/:statusCode/:clientId`,
            GET_LOGS_BY_IP: `${API_GATEWAY_URL}/api/v2/logs/ip/:ipAddress`,
            GET_LOGS_BY_DATE_RANGE: `${API_GATEWAY_URL}/api/v2/logs/date-range/:clientId`,
            GET_ERROR_LOGS: `${API_GATEWAY_URL}/api/v2/logs/errors/:clientId`,
            GET_SUCCESSFUL_LOGS: `${API_GATEWAY_URL}/api/v2/logs/successful/:clientId`,
            GET_USAGE_ANALYTICS: `${API_GATEWAY_URL}/api/v2/logs/analytics/:clientId`,
            GET_TOP_API_KEYS: `${API_GATEWAY_URL}/api/v2/logs/top-api-keys/:clientId`,
            GET_ERROR_RATE_ANALYSIS: `${API_GATEWAY_URL}/api/v2/logs/error-rate-analysis/:clientId`,
            GET_USAGE_STATS: `${API_GATEWAY_URL}/api/v2/logs/usage-stats/:apiKeyId`,
            GET_DAILY_USAGE: `${API_GATEWAY_URL}/api/v2/logs/daily-usage/:apiKeyId`,
            // POST endpoints
            CREATE_LOG: `${API_GATEWAY_URL}/api/v2/logs`,
            // PUT endpoints
            UPDATE_LOG: `${API_GATEWAY_URL}/api/v2/logs/:id`,
            // DELETE endpoints
            DELETE_LOG: `${API_GATEWAY_URL}/api/v2/logs/:id`,
            CLEANUP_OLD_LOGS: `${API_GATEWAY_URL}/api/v2/logs/cleanup`,
            CLEANUP_API_KEY_LOGS: `${API_GATEWAY_URL}/api/v2/logs/api-key/:apiKeyId/cleanup`,
        }
    },
    AI: {
        // Old AI Architecture
        API_V1: {
            GET_AI_V1_RESPONSE: `${API_GATEWAY_URL}/api/v1/ai/answer`,
            GET_AI_V2_RESPONSE: `${API_GATEWAY_URL}/api/v1/ai/generate`,
        },
        ASSISTANT: {
            CREATE_AND_UPLOAD: `${API_GATEWAY_URL}/api/v1/pinecone/assistant-with-document`,
            DELETE_DOCUMENT_BY_ID: `${API_GATEWAY_URL}/api/v1/pinecone/assistant/:agentId/file/:docId`,
            UPLOAD_DOCUMENT_TEXT: `${API_GATEWAY_URL}/api/v1/pinecone/upload-content`
        }
    }
};

export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};
