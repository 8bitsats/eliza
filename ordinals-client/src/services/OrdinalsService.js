import axios from 'axios';

class OrdinalsService {
  constructor(baseUrl = 'https://api.hiro.so') {
    this.baseUrl = baseUrl;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get API status
   * @returns {Promise} API status object
   */
  async getApiStatus() {
    try {
      const response = await this.api.get('/ordinals/v1/');
      return response.data;
    } catch (error) {
      console.error('Error fetching API status:', error);
      throw error;
    }
  }

  /**
   * Get a list of inscriptions with optional filtering
   * @param {object} options - Filter options
   * @returns {Promise} List of inscriptions
   */
  async getInscriptions(options = {}) {
    try {
      const response = await this.api.get('/ordinals/v1/inscriptions', {
        params: {
          limit: options.limit || 20,
          offset: options.offset || 0,
          order_by: options.order_by || 'genesis_timestamp',
          order: options.order || 'desc',
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
      throw error;
    }
  }

  /**
   * Get a single inscription by ID or number
   * @param {string} id - Inscription ID or number
   * @returns {Promise} Inscription details
   */
  async getInscription(id) {
    try {
      const response = await this.api.get(`/ordinals/v1/inscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching inscription ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the content of an inscription
   * @param {string} id - Inscription ID or number
   * @returns {Promise} Blob with inscription content
   */
  async getInscriptionContent(id) {
    try {
      const response = await this.api.get(`/ordinals/v1/inscriptions/${id}/content`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching inscription content ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all transfers for an inscription
   * @param {string} id - Inscription ID or number
   * @param {object} options - Pagination options
   * @returns {Promise} Inscription transfer history
   */
  async getInscriptionTransfers(id, options = {}) {
    try {
      const response = await this.api.get(`/ordinals/v1/inscriptions/${id}/transfers`, {
        params: {
          limit: options.limit || 20,
          offset: options.offset || 0
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching inscription transfers ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get information about a satoshi by its ordinal number
   * @param {number} ordinal - Ordinal number
   * @returns {Promise} Satoshi information
   */
  async getSatoshi(ordinal) {
    try {
      const response = await this.api.get(`/ordinals/v1/sats/${ordinal}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching satoshi ${ordinal}:`, error);
      throw error;
    }
  }

  /**
   * Find rare satoshis by rarity
   * @param {string} rarity - Rarity level (common, uncommon, rare, epic, legendary, mythic)
   * @param {number} limit - Number of results to return
   * @returns {Promise} List of satoshis with the specified rarity
   */
  async findRareSatoshis(rarity, limit = 10) {
    try {
      // This is a custom implementation that filters inscriptions by sat_rarity
      const inscriptions = await this.getInscriptions({
        limit: 100, // Get more than we need since we'll filter
        rarity: [rarity]
      });
      
      return {
        limit,
        offset: 0,
        total: inscriptions.total,
        results: inscriptions.results.slice(0, limit)
      };
    } catch (error) {
      console.error(`Error finding rare satoshis with rarity ${rarity}:`, error);
      throw error;
    }
  }

  /**
   * Helper method to format bytes to human-readable format
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted string (e.g., "1.5 KB")
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Create and export a singleton instance
const ordinalsService = new OrdinalsService();
export default ordinalsService;
