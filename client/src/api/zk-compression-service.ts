import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { 
  createCompressedToken,
  CompressedTokenConfig,
  CompressedTokenResponse 
} from '@solana/spl-token';

export interface ZkTokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  maxSupply: bigint;
  initialSupply: bigint;
  merkleTree: PublicKey;
  owner: Keypair;
}

export class ZkCompressionService {
  private connection: Connection;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint);
  }

  async createCompressedToken(config: ZkTokenConfig): Promise<CompressedTokenResponse> {
    try {
      const tokenConfig: CompressedTokenConfig = {
        name: config.name,
        symbol: config.symbol,
        decimals: config.decimals,
        maxSupply: config.maxSupply,
        initialSupply: config.initialSupply,
        merkleTree: config.merkleTree,
        owner: config.owner,
      };

      const token = await createCompressedToken(
        this.connection,
        tokenConfig,
        config.owner
      );

      return token;
    } catch (error) {
      console.error('Error creating compressed token:', error);
      throw error;
    }
  }

  async getTokenMetadata(tokenAddress: PublicKey): Promise<any> {
    try {
      const metadata = await this.connection.getAccountInfo(tokenAddress);
      return metadata;
    } catch (error) {
      console.error('Error fetching token metadata:', error);
      throw error;
    }
  }
}
