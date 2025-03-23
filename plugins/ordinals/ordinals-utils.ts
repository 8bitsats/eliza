import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Utility functions for Bitcoin Ordinals operations
 */
export class OrdinalsUtils {
  private ordPath: string;
  private bitcoinConfPath: string;

  /**
   * Constructor for OrdinalsUtils
   * @param ordPath - Path to the ord binary
   * @param bitcoinConfPath - Path to bitcoin.conf
   */
  constructor(ordPath: string, bitcoinConfPath: string) {
    this.ordPath = ordPath;
    this.bitcoinConfPath = bitcoinConfPath;
  }

  /**
   * Run an ord command with proper configuration
   * @param args - Arguments to pass to the ord command
   * @returns Promise with command output
   */
  async runOrdCommand(args: string): Promise<string> {
    try {
      const command = `${this.ordPath} --bitcoin-conf ${this.bitcoinConfPath} ${args}`;
      console.info(`Running ord command: ${command}`);
      const { stdout } = await execAsync(command);
      return stdout;
    } catch (error: unknown) {
      console.error(`Error running ord command: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Find satoshis by rarity
   * @param rarity - Rarity level (common, uncommon, rare, epic, legendary, mythic)
   * @returns Promise with list of satoshis
   */
  async findSatoshisByRarity(rarity: string): Promise<string> {
    return this.runOrdCommand(`find --rarity ${rarity}`);
  }

  /**
   * Inscribe content onto a satoshi
   * @param content - Content to inscribe
   * @param contentType - MIME type of the content
   * @returns Promise with inscription result
   */
  async inscribeContent(content: string | Buffer, contentType = 'text/plain'): Promise<string> {
    try {
      // Create a temporary file for the content
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const timestamp = Date.now();
      const tempFile = path.join(tempDir, `inscription-${timestamp}`);
      await writeFileAsync(tempFile, content);

      // Run the inscription command
      const result = await this.runOrdCommand(`wallet inscribe --fee-rate 10 --content-type "${contentType}" ${tempFile}`);

      // Clean up the temporary file
      fs.unlinkSync(tempFile);

      return result;
    } catch (error: unknown) {
      console.error(`Error inscribing content: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @returns Promise with wallet balance
   */
  async getWalletBalance(): Promise<string> {
    return this.runOrdCommand('wallet balance');
  }

  /**
   * List inscriptions in the wallet
   * @returns Promise with list of inscriptions
   */
  async listWalletInscriptions(): Promise<string> {
    return this.runOrdCommand('wallet inscriptions');
  }

  /**
   * Send an inscription to a recipient address
   * @param inscriptionId - ID of the inscription to send
   * @param address - Recipient Bitcoin address
   * @returns Promise with transaction result
   */
  async sendInscription(inscriptionId: string, address: string): Promise<string> {
    return this.runOrdCommand(`wallet send --fee-rate 10 ${inscriptionId} ${address}`);
  }

  /**
   * Parse the output of ord wallet inscriptions command
   * @param output - Command output to parse
   * @returns Array of inscription objects
   */
  parseInscriptions(output: string): Array<{ id: string, contentType: string, contentLength: number }> {
    const inscriptions: Array<{ id: string, contentType: string, contentLength: number }> = [];
    const lines = output.split('\n');
    
    let currentInscription: { id: string, contentType: string, contentLength: number } | null = null;
    
    for (const line of lines) {
      if (line.includes('inscription')) {
        // Start of a new inscription
        if (currentInscription) {
          inscriptions.push(currentInscription);
        }
        
        const idMatch = line.match(/inscription ([a-f0-9]+i\d+)/);
        if (idMatch) {
          currentInscription = {
            id: idMatch[1],
            contentType: '',
            contentLength: 0
          };
        }
      } else if (currentInscription) {
        // Parse inscription details
        if (line.includes('content type:')) {
          const contentTypeMatch = line.match(/content type: (.+)/);
          if (contentTypeMatch) {
            currentInscription.contentType = contentTypeMatch[1];
          }
        } else if (line.includes('content length:')) {
          const contentLengthMatch = line.match(/content length: (\d+)/);
          if (contentLengthMatch) {
            currentInscription.contentLength = parseInt(contentLengthMatch[1], 10);
          }
        }
      }
    }
    
    // Add the last inscription if there is one
    if (currentInscription) {
      inscriptions.push(currentInscription);
    }
    
    return inscriptions;
  }

  /**
   * Parse the output of ord find command
   * @param output - Command output to parse
   * @returns Array of satoshi objects
   */
  parseSatoshis(output: string): Array<{ ordinal: string, rarity: string, name?: string }> {
    const satoshis: Array<{ ordinal: string, rarity: string, name?: string }> = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      const match = line.match(/sat (\d+) \((.+?)\)(?: named "(.+?)")?/);
      if (match) {
        satoshis.push({
          ordinal: match[1],
          rarity: match[2],
          name: match[3]
        });
      }
    }
    
    return satoshis;
  }

  /**
   * Get information about a specific satoshi by its ordinal number
   * @param ordinal - Ordinal number of the satoshi
   * @returns Promise with satoshi information
   */
  async getSatoshiInfo(ordinal: string): Promise<string> {
    return this.runOrdCommand(`info ${ordinal}`);
  }
}
