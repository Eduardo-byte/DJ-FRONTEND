import axios from 'axios';
import apiGatewayAxiosInstance from '../config/apiGatewayAxiosInstance';
import { ENDPOINTS } from '../config/endpoints';

class PineconeMicroService {
  constructor() {
    
    this.client = apiGatewayAxiosInstance.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      }
    });
  }

  /**
   * Upload text content as a file to a Pinecone assistant
   * @param {string} agentId - The agent ID for the Pinecone assistant
   * @param {string} filename - The filename for the content
   * @param {string} content - The text content to upload
   * @returns {Promise<Object>} Response from the AI micro service
   */
  async uploadContent(agentId, filename, content) {
    // Early validation for required fields
    if (!agentId) {
      return {
        success: false,
        error: 'agentId is required',
        status: 400
      };
    }

    if (!filename) {
      return {
        success: false,
        error: 'filename is required',
        status: 400
      };
    }

    if (!content) {
      return {
        success: false,
        error: 'content is required',
        status: 400
      };
    }

    try {
      const requestBody = {
        agentId,
        filename,
        content
      };

      const response = await apiGatewayAxiosInstance.post(
                ENDPOINTS.AI.ASSISTANT.UPLOAD_DOCUMENT_TEXT, requestBody
            );
      
      return {
        success: true,
        data: response.data.data,
        status: response.status
      };

    } catch (error) {
      console.error('Error uploading content to Pinecone:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }
}

export const pineconeMicroService = new PineconeMicroService();