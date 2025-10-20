import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance.js';
import { ENDPOINTS } from '../config/endpoints.js';
import webscrapperAxiosInstance from '../config/webscrapperAxiosInstance.js';

/**
 * WebScraper API service for handling agent-related operations, Pinecone vector database interactions,
 * and web scraping operations.
 */
class WebScraperService {
    /**
     * Generate qualification questions for an agent based on company information.
     * 
     * @param {Object} data - The data needed to generate qualification questions
     * @param {string} data.companyName - The name of the company
     * @param {string} data.companyServices - Description of company services
     * @param {string} data.agentGoal - The goal of the agent (e.g., "Lead Generation", "Appointment Setter")
     * @returns {Promise<Array|null>} - Array of generated qualification questions or null if an error occurs
     */
    async generateQualificationQuestions(data) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.GENERATE_QUALIFICATION_QUESTION,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error generating qualification questions:", error);
            return null;
        }
    }

    /**
     * Generate agent information based on company details.
     * 
     * @param {Object} data - The data needed to generate agent information
     * @param {string} data.companyName - The name of the company
     * @param {string} data.companyServices - Description of company services
     * @param {string} data.agentGoal - The goal of the agent
     * @returns {Promise<Object|null>} - Generated agent information or null if an error occurs
     */
    async generateAgentInfo(data) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.GENERATE_AGENT_INFO,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error generating agent information:", error);
            return null;
        }
    }

    /**
     * Generate answers for specific questions based on company information.
     * 
     * @param {Object} data - The data needed to generate answers
     * @param {string} data.companyName - The name of the company
     * @param {string} data.companyServices - Description of company services
     * @param {Array} data.questions - Array of questions to generate answers for
     * @returns {Promise<Object|null>} - Generated answers or null if an error occurs
     */
    async generateAnswers(data) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.GENERATE_ANSWERS,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error generating answers:", error);
            return null;
        }
    }

    /**
     * Generate a complete agent workflow including qualification questions, agent info, and answers.
     * 
     * @param {Object} data - The data needed to generate the complete workflow
     * @param {string} data.websiteContent - The URL or content of the website
     * @param {Object} [data.options] - Additional options
     * @param {string} [data.options.model='gpt-4o'] - Model to use
     * @param {number} [data.options.temperature=0] - Temperature for generation
     * @param {boolean} [data.options.batchQuestions=true] - Whether to batch questions
     * @param {number} [data.options.batchSize=1500] - Size of each batch if batching
     * @returns {Promise<Object|null>} - Complete agent workflow or null if an error occurs
     */
    async generateFullFlow(data) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.GENERATE_FULL_FLOW,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error generating full agent workflow:", error);
            return null;
        }
    }/**
     * Generate a complete agent workflow including qualification questions, agent info, and answers.
     * 
     * @param {string} websiteContent - The URL or content of the website
     * @param {Object} options - Additional options for generation
     * @param {string} [options.model='gpt-4o'] - Model to use
     * @param {number} [options.temperature=0] - Temperature for generation
     * @param {boolean} [options.batchQuestions=true] - Whether to batch questions
     * @param {number} [options.batchSize=1500] - Size of each batch if batching
     * @param {Array<string>} [options.trainUrls] - Array of URLs to train the AI with
     * @returns {Promise<Object|null>} - Complete agent workflow or null if an error occurs
     */
    async generateFullFlowV2(websiteContent, options = {}) {
        // Validate input data
        if (!websiteContent) {
            console.error("Missing required parameter: websiteContent");
            return null;
        }

        try {
            const data = {
                websiteContent,
                options: {
                    model: options.model || 'gpt-4o',
                    temperature: options.temperature !== undefined ? options.temperature : 0,
                    batchQuestions: options.batchQuestions !== undefined ? options.batchQuestions : true,
                    batchSize: options.batchSize || 1500
                }
            };

            // Add trainUrls if provided
            if (options.trainUrls && options.trainUrls.length > 0) {
                data.options.trainUrls = options.trainUrls;
                //console.log('WebScraperService: Adding trainUrls to request:', options.trainUrls);
            }

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.GENERATE_FULL_FLOW,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error generating full agent workflow:", error);
            return null;
        }
    }


    /**
     * Regenerate qualification questions based on user feedback.
     * 
     * @param {Object} data - The data needed to regenerate qualification questions
     * @param {string} data.userInstructions - User feedback and instructions
     * @param {string} data.url - The URL of the website
     * @param {Array<string>|string} data.qualificationQuestions - Previously generated questions
     * @param {Object} [data.options] - Additional options
     * @param {number} [data.options.temperature=0.7] - Temperature for generation
     * @returns {Promise<Array|null>} - Array of regenerated qualification questions or null if an error occurs
     */
    async regenerateQualificationQuestions(data) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.REGENERATE_QUALIFICATION_QUESTIONS,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error regenerating qualification questions:", error);
            return null;
        }
    }

    /**
     * Regenerate questions and answers based on user feedback.
     * 
     * @param {Object} data - The data needed to regenerate Q&A pairs
     * @param {string} data.userInstructions - User feedback and instructions
     * @param {string} data.url - The URL of the website
     * @param {Object|Array|string} data.questionsAndAnswers - Previously generated Q&A pairs
     * @param {Object} [data.options] - Additional options
     * @param {number} [data.options.temperature=0.7] - Temperature for generation
     * @returns {Promise<Object|null>} - Regenerated Q&A pairs or null if an error occurs
     */
    async regenerateQA(data) {
        try {
            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.AGENT.REGENERATE_QA,
                data
            );
            return response.data.data;
        } catch (error) {
            console.error("Error regenerating Q&A pairs:", error);
            return null;
        }
    }
    /**
     * Update a vector in Pinecone by its training ID.
     * 
     * @param {string} trainingId - The training ID of the vector to update
     * @param {string} newContent - The new content to replace the old content
     * @param {Object} [options] - Options for the update
     * @param {string} [options.clientId] - Client ID (required if not in the original vector)
     * @param {string} [options.namespace='test-space'] - Namespace to use
     * @param {string} [options.vectorId] - Direct vector ID to update (optional)
     * @returns {Promise<Object|null>} - Update results or null if an error occurs
     */
    async updateByTrainingId(trainingId, newContent, options = {}) {
        try {
            const updateData = {
                trainingId,
                newContent,
                clientId: options.clientId,
                namespace: options.namespace || 'test-space',
                vectorId: options.vectorId
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.UPDATE_RECORD_BY_ID,
                updateData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error updating vector by training ID:", error);
            return null;
        }
    }

    /**
     * Delete vectors in Pinecone by training ID.
     * 
     * @param {string} trainingId - The training ID of the vectors to delete
     * @param {Object} [options] - Options for the deletion
     * @param {string} [options.namespace='test-space'] - Namespace to use
     * @returns {Promise<Object|null>} - Deletion results or null if an error occurs
     */
    async deleteByTrainingId(trainingId, options = {}) {
        try {
            if (!trainingId) {
                throw new Error("Training ID is required");
            }

            // Ensure trainingId is a string
            trainingId = String(trainingId);

            // Format the request body according to the API requirements
            const deleteData = {
                trainingId: trainingId
            };

            // If namespace is provided, include it in the options
            if (options.namespace) {
                deleteData.options = {
                    namespace: options.namespace
                };
            }

            //console.log("Deleting with data:", deleteData);

            // Try a different approach - use POST with _method=DELETE
            // This is a common workaround for DELETE requests with bodies
            // const response = await webscrapperAxiosInstance.post(
            const response = await apiGatewayAxiosInstance.delete(
                ENDPOINTS.WEBSCRAPER.PINECONE.DELETE_RECORD_BY_ID,
                {
                    data: deleteData,
                    headers: {
                        'X-HTTP-Method-Override': 'DELETE'
                    }
                }
            );

            return response.data.data;
        } catch (error) {
            console.error("Full error deleting vectors:", error);

            // Try to extract the error message
            let errorMessage = "Unknown error";
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    try {
                        // Try to parse the error message if it's a string
                        const parsedError = JSON.parse(error.response.data);
                        errorMessage = parsedError.error || parsedError.message || error.response.data;
                    } catch (parseError) {
                        // If parsing fails, use the string directly
                        errorMessage = error.response.data;
                    }
                } else {
                    // If it's already an object, use the error or message property
                    errorMessage = error.response.data.error || error.response.data.message || JSON.stringify(error.response.data);
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            console.log("Error deleting vectors by training ID:", errorMessage);

            // Return a structured error response
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * List all records in a specific namespace.
     * 
     * @param {string} namespace - The namespace to list records from
     * @param {Object} [options] - Additional options
     * @param {number} [options.topK=1000] - Maximum number of records to return
     * @param {boolean} [options.includeValues=false] - Whether to include vector values in results
     * @param {boolean} [options.includeMetadata=true] - Whether to include metadata in results
     * @returns {Promise<Object|null>} - List of records or null if an error occurs
     */
    async listNamespaceRecords(namespace, options = {}) {
        try {
            const listData = {
                namespace,
                topK: options.topK || 1000,
                includeValues: options.includeValues || false,
                includeMetadata: options.includeMetadata !== false
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.GET_ALL_RECORDS_BY_ID,
                listData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error listing namespace records:", error);
            return null;
        }
    }

    /**
     * Scrape a URL and insert the content into Pinecone.
     * 
     * @param {string} url - URL to scrape
     * @param {string} [clientId] - Optional client ID (generates one if not provided)
     * @param {string} [namespace='test-space'] - Optional namespace
     * @returns {Promise<Object|null>} - Scrape and insert results or null if an error occurs
     */
    async scrapeAndInsert(url, clientId, namespace = 'test-space') {
        try {
            const scrapeData = {
                url,
                clientId,
                namespace
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.SCRAPE_AND_INSERT_IN_PINECONE,
                scrapeData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error scraping and inserting into Pinecone:", error);
            return null;
        }
    }

    /**
     * Insert multiple documents directly into Pinecone without scraping.
     * 
     * @param {Array<Object>} documents - Array of documents to insert
     * @param {string} [clientId] - Optional client ID (generates one if not provided)
     * @param {string} [agentId='test-space'] - Optional agent ID to use for namespace
     * @param {Object} [options] - Additional options
     * @param {string} [options.title] - Default document title (defaults to "Untitled Document")
     * @param {string} [options.source] - Default source of the document (defaults to "manual-entry")
     * @returns {Promise<Object|null>} - Insert results or null if an error occurs
     */
    async insertDocuments(documents, clientId, agentId = 'test-space', options = {}) {
        try {
            // Ensure documents is an array
            if (!Array.isArray(documents)) {
                documents = [documents];
            }

            const insertData = {
                documents,
                clientId,
                agentId,
                options
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.INSERT_DOCUMENTS_IN_PINECONE,
                insertData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error inserting documents into Pinecone:", error);
            return null;
        }
    }

    /**
     * Insert a Q&A document into Pinecone with question and answer in both content and metadata.
     * 
     * @param {string} question - The question text
     * @param {string} answer - The answer text
     * @param {string} [clientId] - Optional client ID for metadata (generates one if not provided)
     * @param {string} [agentId='test-space'] - Optional agent ID to use for namespace
     * @param {Object} [options] - Additional options
     * @param {Array<number>} [options.embeddings] - Pre-generated embeddings to use
     * @param {string} [options.title] - Document title (defaults to "Q&A Document")
     * @param {string} [options.source] - Source of the document (defaults to "qa-entry")
     * @returns {Promise<Object|null>} - Insert results or null if an error occurs
     */
    async insertQADocument(question, answer, clientId, agentId = 'test-space', options = {}) {
        try {
            if (!question) {
                throw new Error('Question is required');
            }

            if (!answer) {
                throw new Error('Answer is required');
            }

            const qaData = {
                question,
                answer,
                clientId,
                agentId,
                options
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.INSERT_QA_DOCUMENT,
                qaData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error inserting Q&A document into Pinecone:", error);
            return null;
        }
    }

    async insertQADocumentV2(question, answer, clientId, agentId) {
        try {
            if (!question) {
                throw new Error('Question is required');
            }

            if (!answer) {
                throw new Error('Answer is required');
            }

            const qaData = {
                question,
                answer,
                clientId,
                agentId,
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.INSERT_QA_DOCUMENT_V2,
                qaData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error inserting Q&A document into Pinecone:", error);
            return null;
        }
    }

    /**
     * Process a PDF document from a URL and insert it into Pinecone.
     * 
     * @param {string} url - The URL of the PDF document to process
     * @param {string} clientId - Client ID for metadata
     * @param {string} agentId - Agent ID to use as namespace
     * @param {Object} [options] - Additional options (optional)
     * @param {boolean} [options.includeImageBase64=false] - Whether to include base64-encoded images
     * @param {Object} [options.chunking] - Options for text chunking
     * @param {number} [options.chunking.chunkSize=1500] - Size of chunks in tokens
     * @param {number} [options.chunking.chunkOverlap=100] - Overlap between chunks in tokens
     * @returns {Promise<Object|null>} - Processing results or null if an error occurs
     */
    async processPdfAndInsert(url, clientId, agentId, options = {}) {
        try {
            if (!url) {
                throw new Error('URL is required');
            }

            if (!clientId) {
                throw new Error('Client ID is required');
            }

            if (!agentId) {
                throw new Error('Agent ID is required');
            }

            // Prepare the request data with only the required fields
            const pdfData = {
                url,
                clientId,
                agentId,
                options: {
                    includeImageBase64: false,
                    chunking: {
                        chunkSize: 1500,
                        chunkOverlap: 100
                    }
                }
            };

            // Only add options if they are explicitly provided
            if (Object.keys(options).length > 0) {
                pdfData.options = options;
            }

            //console.log("Processing PDF with data:", pdfData);

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.INSERT_PDF_DOCUMENT,
                pdfData
            );

            return response.data.data;
        } catch (error) {
            console.error("Full error processing PDF:", error);
            console.error("Error processing PDF and inserting into Pinecone:", error);

            // Return a structured error response
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    async processPdfAndInsertV2(url, clientId, agentId) {
        try {
            if (!url) {
                throw new Error('URL is required');
            }

            if (!clientId) {
                throw new Error('Client ID is required');
            }

            if (!agentId) {
                throw new Error('Agent ID is required');
            }

            // Prepare the request data with only the required fields
            const nowDate = new Date().toISOString().split("T")[0]; // e.g. "2025-08-28"

            const pdfData = {
                url,
                clientId,
                agentId,
                title: `${agentId}_${nowDate}_pdf`
            };


            //console.log("Processing PDF with data:", pdfData);

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.PINECONE.INSERT_PDF_DOCUMENT_V2,
                pdfData
            );

            return response.data.data;
        } catch (error) {
            console.error("Full error processing PDF:", error);
            console.error("Error processing PDF and inserting into Pinecone:", error);

            // Return a structured error response
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    /**
     * Process a URL and return its content with embeddings.
     * 
     * @param {string} url - The URL to scrape and process
     * @param {Object} [options] - Processing options
     * @param {Object} [options.chunking] - Options for text chunking
     * @param {number} [options.chunking.chunkSize=1500] - Size of chunks in tokens
     * @param {number} [options.chunking.chunkOverlap=100] - Overlap between chunks in tokens
     * @param {string} [options.chunking.model='cl100k_base'] - Tokenizer model
     * @param {string} [options.embeddingModel='text-embedding-3-small'] - Model to use for embeddings
     * @param {boolean} [options.includeRawContent=false] - Whether to include the raw content in the response
     * @returns {Promise<Object|null>} - Processed URL content or null if an error occurs
     */
    async processUrl(url, options = {}) {
        try {
            const processData = {
                url,
                options: {
                    chunking: {
                        chunkSize: options.chunking?.chunkSize || 1500,
                        chunkOverlap: options.chunking?.chunkOverlap || 100,
                        model: options.chunking?.model || 'cl100k_base'
                    },
                    embeddingModel: options.embeddingModel || 'text-embedding-3-small',
                    includeRawContent: options.includeRawContent || true
                }
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.SCRAPER.PROCESS_SINGLE_URL,
                processData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error processing URL:", error);
            return null;
        }
    }

    async processUrlV2(agentId, clientId, url) {
        try {

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.SCRAPER.PROCESS_SINGLE_URL_V2,
                { agentId, clientId, url }
            );
            return response.data.data;
        } catch (error) {
            console.error("Error processing URL:", error);
            return null;
        }
    }

    /**
     * Batch process multiple URLs with chunking and embeddings.
     * 
     * @param {Array<string>} urls - Array of URLs to process
     * @param {Object} [options] - Processing options
     * @param {Object} [options.chunking] - Options for text chunking
     * @param {number} [options.chunking.chunkSize=1500] - Size of chunks in tokens
     * @param {number} [options.chunking.chunkOverlap=100] - Overlap between chunks in tokens
     * @param {string} [options.chunking.model='cl100k_base'] - Tokenizer model
     * @param {string} [options.embeddingModel='text-embedding-3-small'] - Model to use for embeddings
     * @param {boolean} [options.includeRawContent=false] - Whether to include the raw content in the response
     * @returns {Promise<Object|null>} - Batch processing results or null if an error occurs
     */
    async batchProcessUrls(urls, options = {}) {
        try {
            const batchData = {
                urls,
                options: {
                    chunking: {
                        chunkSize: options.chunking?.chunkSize || 1500,
                        chunkOverlap: options.chunking?.chunkOverlap || 100,
                        model: options.chunking?.model || 'cl100k_base'
                    },
                    embeddingModel: options.embeddingModel || 'text-embedding-3-small',
                    includeRawContent: options.includeRawContent || false
                }
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.SCRAPER.PROCESS_MULTIPLE_URLS,
                batchData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error batch processing URLs:", error);
            return null;
        }
    }

    /**
     * Start an asynchronous crawl of a website to extract all URLs and content.
     * 
     * @param {string} url - The URL of the website to crawl
     * @param {Object} [options] - Crawl options
     * @param {number} [options.limit=500] - Maximum number of pages to crawl
     * @param {number} [options.maxDepth=10] - Maximum depth of crawl
     * @param {Array<string>} [options.excludePaths] - Regular expressions of paths to exclude
     * @param {Object} [options.scrapeOptions] - Options for content extraction
     * @returns {Promise<Object|null>} - Job information including the jobId or null if an error occurs
     */
    async crawlWebsite(url, options = {}) {
        try {
            const crawlData = {
                url,
                limit: options.limit || 500,
                maxDepth: options.maxDepth || 10,
                excludePaths: options.excludePaths || ["(blog/.+|about/.+|news/.+|articles?/.+|posts?/.+|press/.+|updates/.+|stories/.+)"],
                scrapeOptions: options.scrapeOptions || {
                    formats: ["markdown", "links"]
                }
            };

            const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.WEBSCRAPER.SCRAPER.CRAWL_WEBSITE_URL,
                crawlData
            );
            return response.data.data;
        } catch (error) {
            console.error("Error starting website crawl:", error);
            return null;
        }
    }

    /**
     * Check the status of a crawl job and retrieve results if completed.
     * 
     * @param {string} jobId - The ID of the crawl job to check
     * @returns {Promise<Object|null>} - Crawl status and data or null if an error occurs
     */
    async getCrawlJobStatus(jobId) {
        try {
            // Replace the :jobId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.SCRAPER.GET_CRAWL_JOB_STATUS.replace(':jobId', jobId);

            const response = await apiGatewayAxiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            console.error("Error checking crawl status:", error);
            return null;
        }
    }

    /**
     * Start a crawl cron job for a specific agent.
     * 
     * @param {string} agentId - The agent ID to crawl and process
     * @param {Object} [options] - Additional options for the crawl job
     * @returns {Promise<Object|null>} - Crawl job information or null if an error occurs
     */
    async startCrawlCronJob(agentId, options = {}) {
        try {
            if (!agentId) {
                throw new Error("Agent ID is required");
            }

            // Replace the :agentId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.SCRAPER.START_CRAWL_CRON_JOB.replace(':agentId', agentId);

            const response = await apiGatewayAxiosInstance.post(url, options);
            return response.data.data;
        } catch (error) {
            console.error("Error starting crawl cron job:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    /**
     * Process and insert crawl results into Pinecone.
     * 
     * @param {Object} crawlData - The data returned from a completed crawl job
     * @param {string} clientId - Client ID for metadata
     * @param {string} agentId - Agent ID to use as namespace
     * @param {Object} [options] - Additional options
     * @returns {Promise<Object|null>} - Processing results or null if an error occurs
     */
    async processCrawlResults(crawlData, clientId, agentId, options = {}) {
        try {
            if (!crawlData || !crawlData.data || !Array.isArray(crawlData.data)) {
                throw new Error("Invalid crawl data format");
            }

            const processedUrls = [];
            const documents = [];

            // Process each page in the crawl results
            for (const page of crawlData.data) {
                // Extract markdown content and links
                const markdown = page.markdown;
                const links = page.links || [];
                const url = links[0]; // Usually the first link is the page URL

                if (!url || !markdown) continue;

                // Skip already processed URLs
                if (processedUrls.includes(url)) continue;
                processedUrls.push(url);

                try {
                    // Process the page content to get chunks with embeddings
                    const processed = await this.processUrl(url, {
                        includeRawContent: true
                    });

                    if (processed && processed.success && processed.chunksWithEmbeddings) {
                        // Prepare each chunk as a document for Pinecone
                        processed.chunksWithEmbeddings.forEach(chunk => {
                            documents.push({
                                content: chunk.content,
                                embeddings: chunk.embedding,
                                tokenCount: chunk.token_count,
                                metadata: {
                                    url: url,
                                    source: "web-crawl",
                                    chunksCount: processed.chunksCount,
                                    charCount: chunk.char_count,
                                    charsPerToken: chunk.chars_per_token,
                                    chunkIndex: chunk.index,
                                    totalChunks: chunk.total_chunks,
                                    documentChunkSize: processed.chunksCount
                                },
                                source: url,
                                title: `Content from ${url} (Chunk ${chunk.index + 1} of ${chunk.total_chunks})`
                            });
                        });
                    }
                } catch (processError) {
                    console.error(`Error processing URL ${url}:`, processError);
                    // Continue with other URLs
                    continue;
                }
            }

            // If we have documents, insert them into Pinecone
            if (documents.length > 0) {
                const insertResult = await this.insertDocuments(
                    documents,
                    clientId,
                    agentId,
                    {
                        source: 'web-crawl',
                        title: `Crawl results from ${crawlData.data[0]?.links?.[0] || 'website'}`
                    }
                );

                return {
                    success: true,
                    insertResult,
                    processedUrls,
                    totalDocuments: documents.length
                };
            }

            return {
                success: false,
                error: "No valid documents found to process"
            };
        } catch (error) {
            console.error("Error processing crawl results:", error);
            return null;
        }
    }

    async deleteAndCrawl(options = {}) {
        try {
            // Replace the :agentId placeholder in the URL
            const url = ENDPOINTS.WEBSCRAPER.SCRAPER.DELETE_AND_CRAWL;

            const response = await apiGatewayAxiosInstance.post(url, options);
            return response.data.data;
        } catch (error) {
            console.error("Error starting crawl cron job:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }
    async uploadDocumentToPineconeAssistant(payload = {}) {
        try {
            // Replace the :agentId placeholder in the URL
            const url = ENDPOINTS.AI.ASSISTANT.CREATE_AND_UPLOAD;

            const response = await apiGatewayAxiosInstance.post(url, payload);
            return response.data.data;
        } catch (error) {
            console.error("Error uploading document to pinecone assistant:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }

    async deleteDocumentFromPineconeAssistant(agentId, docId) {
        try {
            // Replace the :agentId and :docId placeholders in the URL
            const url = ENDPOINTS.AI.ASSISTANT.DELETE_DOCUMENT_BY_ID
                .replace(':agentId', agentId)
                .replace(':docId', docId);

            const response = await apiGatewayAxiosInstance.delete(url);
            return response.data.data;
        } catch (error) {
            console.error("Error deleting document from pinecone assistant:", error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || "Unknown error"
            };
        }
    }
}

export const webScraperService = new WebScraperService();
