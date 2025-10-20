import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';

/**
 * Content Scraper API service for handling scraped content operations.
 * This service provides methods to interact with the scraped content endpoints.
 */
class ContentScraperService {
    /**
     * Create a new scraped content record.
     * 
     * @param {Object} data - The data for the new scraped content record
     * @param {string} data.source_url - The source URL of the content
     * @param {string} data.agent_id - The agent ID associated with the content
     * @param {string} data.content - The scraped content
     * @param {Object} [data.metadata] - Additional metadata for the content
     * @param {string} [data.status='pending'] - The status of the scraped content (e.g., 'pending', 'processed')
     * @param {string} [data.type='webpage'] - The type of content (e.g., 'webpage', 'pdf', 'faq')
     * @param {number} [data.word_count=0] - The word count of the content
     * @param {boolean} [data.scraping_status=false] - Whether the content is still being scraped
     * @returns {Promise<Object|null>} - Created scraped content data or null if an error occurs
     */
    async createScrapedContent(data) {
        try {
            if (!data) {
                throw new Error("Data is required");
            }

            if (!data.source_url) {
                throw new Error("Source URL is required");
            }

            if (!data.agent_id) {
                throw new Error("Agent ID is required");
            }

            if (!data.content) {
                throw new Error("Content is required");
            }

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.CREATE_SCRAPED_CONTENT,
                data
            );
            return response.data;
        } catch (error) {
            console.error("Error creating scraped content:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }
    /**
     * Get scraped content by agent ID.
     * 
     * @param {string} agentId - The agent ID to search for
     * @returns {Promise<Object|null>} - Scraped content data or null if an error occurs
     */
    async getScrapedContentByAgentId(agentId) {
        try {
            if (!agentId) {
                throw new Error("Agent ID is required");
            }

            // Replace the :agentId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.GET_SCRAPED_CONTENT_BY_AGENT_ID.replace(':agentId', agentId);

            const response = await apiGatewayAxiosInstance.get(url);
            return response.data;
        } catch (error) {
            console.error("Error getting scraped content by agent ID:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    /**
     * Update a scraped content record by ID.
     * 
     * @param {string} scrapeId - The scrape ID of the record to update
     * @param {Object} data - The data to update the record with
     * @param {string} [data.source_url] - The source URL of the content
     * @param {string} [data.agent_id] - The agent ID associated with the content
     * @param {string} [data.content] - The scraped content
     * @param {Object} [data.metadata] - Additional metadata for the content
     * @param {string} [data.status] - The status of the scraped content (e.g., 'pending', 'processed')
     * @returns {Promise<Object|null>} - Updated scraped content data or null if an error occurs
     */
    async updateScrapedContentById(scrapeId, data) {
        try {
            if (!scrapeId) {
                throw new Error("Scrape ID is required");
            }

            if (!data) {
                throw new Error("Update data is required");
            }

            // Replace the :scrapeId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.UPDATE_SCRAPED_CONTENT_BY_ID.replace(':scrapeId', scrapeId);

            const response = await apiGatewayAxiosInstance.put(url, data);
            return response.data;
        } catch (error) {
            console.error("Error updating scraped content by ID:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }
    /**
     * Get a scraped content record by ID.
     * 
     * @param {string} scrapeId - The scrape ID of the record to update
     * @returns {Promise<Object|null>} - Updated scraped content data or null if an error occurs
     */
    async getScrapedContentById(scrapeId) {
        try {
            if (!scrapeId) {
                throw new Error("Scrape ID is required");
            }

            // Replace the :scrapeId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.GET_SCRAPED_CONTENT_BY_SCRAPE_ID.replace(':scrapeId', scrapeId);

            const response = await apiGatewayAxiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            console.error("Error updating scraped content by ID:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    async getScrapedContentByScrapeId(scrapeId) {
        try {
            if (!scrapeId) {
                throw new Error("Scrape ID is required");
            }

            // Replace the :scrapeId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.GET_SCRAPED_CONTENT_BY_SCRAPE_ID_V2.replace(':scrapeId', scrapeId);

            const response = await apiGatewayAxiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            console.error("Error updating scraped content by ID:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    /**
     * Delete a scraped content record by ID.
     * 
     * @param {string} scrapeId - The scrape ID of the record to delete
     * @returns {Promise<Object|null>} - Deletion result or null if an error occurs
     */
    async deleteScrapedContentById(scrapeId) {
        try {
            if (!scrapeId) {
                throw new Error("Scrape ID is required");
            }

            // Replace the :scrapeId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.DELETE_SCRAPED_CONTENT_BY_ID.replace(':scrapeId', scrapeId);

            const response = await apiGatewayAxiosInstance.delete(url);
            return response.data;
        } catch (error) {
            console.error("Error deleting scraped content by ID:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    async getScrapedContentBySourceUrl(agentId, sourceUrl) {
        try {
            if (!agentId) {
                throw new Error("Agent ID is required");
            }
            if (!sourceUrl) {
                throw new Error("Source URL is required");
            }
            const url = ENDPOINTS.WEBSCRAPER.CONTENT_SCRAPER.GET_SCRAPED_CONTENT_BY_SOURCE_URL;

            // pass query params here
            const response = await apiGatewayAxiosInstance.get(url, {
                params: {
                    source_url: sourceUrl,
                    agent_id: agentId
                }
            });
            return response.data.data;
        } catch (error) {
            console.error("Error getting scraped content by source URL:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

}

export const contentScraperService = new ContentScraperService();
