import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = '/api';

/**
 * Service for interacting with art generation APIs
 */
export const ArtStudioService = {
  /**
   * Generate character art using FAL AI
   * @param prompt The text prompt for generating the image
   * @param imageSize The size format for the generated image
   * @returns Promise with the image URL
   */
  generateCharacterArt: async (prompt: string, imageSize: string = 'square_hd') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/custom-actions/generateCharacterArt`, {
        prompt,
        imageSize,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating character art:', error);
      throw error;
    }
  },
  
  /**
   * Generate image using Grok
   * @param prompt The text prompt for generating the image
   * @param imageSize The size format for the generated image
   * @returns Promise with the image URL
   */
  generateGrokImage: async (prompt: string, imageSize: string = '1024x1024') => {
    try {
      const response = await axios.post(`${API_BASE_URL}/custom-actions/generateGrokImage`, {
        prompt,
        imageSize,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating Grok image:', error);
      throw error;
    }
  },
};

export default ArtStudioService;
