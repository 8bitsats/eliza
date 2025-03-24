import axios from 'axios';
import { BitcoinInscriptionMetadata } from './types';

export class BitcoinInscriber {
  private apiEndpoint: string;
  private apiKey: string;

  constructor(apiEndpoint: string, apiKey: string) {
    this.apiEndpoint = apiEndpoint;
    this.apiKey = apiKey;
  }

  /**
   * Inscribe DNA data on Bitcoin
   */
  async inscribeDNA(
    dnaSequence: string,
    nftMint: string,
    network: 'mainnet' | 'testnet' = 'mainnet'
  ): Promise<BitcoinInscriptionMetadata> {
    try {
      // Prepare inscription content
      const content = {
        p: 'dna-1', // Protocol identifier
        op: 'reg', // Operation: register
        dna: dnaSequence,
        nft: nftMint,
        ts: Date.now(),
        net: network
      };

      // Convert to JSON and create inscription
      const inscriptionContent = JSON.stringify(content);
      
      // Make API request to inscription service
      const response = await axios.post(
        `${this.apiEndpoint}/inscribe`,
        {
          content: inscriptionContent,
          contentType: 'application/json',
          network
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Wait for inscription to be confirmed
      const inscriptionId = response.data.inscriptionId;
      await this.waitForInscriptionConfirmation(inscriptionId);

      // Return inscription metadata
      return {
        dnaSequence,
        nftMint,
        timestamp: Date.now(),
        network,
        inscriptionId,
        contentType: 'application/json',
        contentHash: response.data.contentHash
      };
    } catch (error) {
      console.error('Error inscribing DNA on Bitcoin:', error);
      throw new Error('DNA inscription failed');
    }
  }

  /**
   * Verify DNA inscription on Bitcoin
   */
  async verifyInscription(inscriptionId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.apiEndpoint}/inscription/${inscriptionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.confirmed === true;
    } catch (error) {
      console.error('Error verifying inscription:', error);
      return false;
    }
  }

  /**
   * Get DNA data from inscription
   */
  async getDNAFromInscription(inscriptionId: string): Promise<{
    dnaSequence: string;
    nftMint: string;
    timestamp: number;
  } | null> {
    try {
      const response = await axios.get(
        `${this.apiEndpoint}/inscription/${inscriptionId}/content`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const content = JSON.parse(response.data);
      if (content.p !== 'dna-1' || content.op !== 'reg') {
        throw new Error('Invalid DNA inscription format');
      }

      return {
        dnaSequence: content.dna,
        nftMint: content.nft,
        timestamp: content.ts
      };
    } catch (error) {
      console.error('Error retrieving DNA from inscription:', error);
      return null;
    }
  }

  private async waitForInscriptionConfirmation(
    inscriptionId: string,
    maxAttempts: number = 30,
    delayMs: number = 10000
  ): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (await this.verifyInscription(inscriptionId)) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    throw new Error('Inscription confirmation timeout');
  }
}
