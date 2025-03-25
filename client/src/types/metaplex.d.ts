// Type declarations for Metaplex libraries

declare module '@metaplex-foundation/js' {
  import { Connection, Keypair, PublicKey } from '@solana/web3.js';
  
  export function keypairIdentity(keypair: Keypair): any;
  export function bundlrStorage(options?: any): any;
  
  export class Metaplex {
    static make(connection: Connection): Metaplex;
    use(plugin: any): Metaplex;
    
    nfts(): {
      create(options: {
        uri: string;
        name: string;
        sellerFeeBasisPoints: number;
        symbol?: string;
        isMutable?: boolean;
      }): Promise<{
        id: string;
        address: PublicKey;
        mint: PublicKey;
        token: PublicKey;
        metadata: any;
        json: any;
      }>;
      
      findByMint(options: { mintAddress: PublicKey }): Promise<any>;
      findAllByOwner(options: { owner: PublicKey }): Promise<any[]>;
      findAllByCreator(options: { creator: PublicKey }): Promise<any[]>;
    };
    
    storage(): {
      upload(data: any): Promise<string>;
      download(uri: string): Promise<any>;
    };
  }
}
