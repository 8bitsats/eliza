import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@project-serum/anchor';
import { DNAGenerator } from './dna-generator';
import { NFTMinter } from './nft-minter';
import { BitcoinInscriber } from './bitcoin-inscriber';
import { AgentDNAMetadata } from './types';

export class AgentDNAClient {
  private connection: Connection;
  private wallet: Wallet;
  private program: Program;
  private dnaGenerator: DNAGenerator;
  private nftMinter: NFTMinter;
  private bitcoinInscriber: BitcoinInscriber;

  constructor(
    connection: Connection,
    wallet: Wallet,
    programId: PublicKey,
    dnaGenerator: DNAGenerator,
    nftMinter: NFTMinter,
    bitcoinInscriber: BitcoinInscriber
  ) {
    this.connection = connection;
    this.wallet = wallet;
    const provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(AgentRegistryIDL, programId, provider);
    this.dnaGenerator = dnaGenerator;
    this.nftMinter = nftMinter;
    this.bitcoinInscriber = bitcoinInscriber;
  }

  /**
   * Create a new agent with DNA NFT
   */
  async createAgent(params: {
    prompt: string;
    name: string;
    description: string;
  }): Promise<{
    agentAddress: PublicKey;
    nftMint: PublicKey;
    inscriptionId: string;
  }> {
    try {
      // 1. Generate DNA sequence
      const dnaSequence = await this.dnaGenerator.generateDNA(params.prompt);
      
      // 2. Create metadata
      const metadata = await this.dnaGenerator.createMetadata(
        dnaSequence,
        params.name,
        params.description
      );

      // 3. Mint NFT
      const { mint: nftMint, metadata: nftMetadata } = await this.nftMinter.mintDNANFT(
        metadata
      );

      // 4. Inscribe on Bitcoin
      const inscription = await this.bitcoinInscriber.inscribeDNA(
        dnaSequence,
        nftMint.toString()
      );

      // 5. Register agent on-chain
      const [agentAddress] = await this.findAgentAddress(nftMint);
      
      await this.program.methods
        .registerAgent(
          dnaSequence,
          nftMint,
          inscription.inscriptionId,
          nftMetadata.uri
        )
        .accounts({
          registry: await this.findRegistryAddress(),
          agent: agentAddress,
          owner: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        agentAddress,
        nftMint,
        inscriptionId: inscription.inscriptionId
      };
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Agent creation failed');
    }
  }

  /**
   * Evolve an existing agent
   */
  async evolveAgent(
    parentAgent: PublicKey,
    params: {
      prompt: string;
      name: string;
      description: string;
    }
  ): Promise<{
    childAddress: PublicKey;
    nftMint: PublicKey;
    inscriptionId: string;
  }> {
    try {
      // Get parent agent data
      const parentData = await this.program.account.agentRecord.fetch(parentAgent);

      // Generate evolved DNA
      const newDnaSequence = await this.dnaGenerator.generateDNA(
        params.prompt,
        parentData.dnaHash.toString()
      );

      // Create metadata for evolved agent
      const metadata = await this.dnaGenerator.createMetadata(
        newDnaSequence,
        params.name,
        params.description,
        parentData.generation + 1,
        parentData.dnaHash.toString()
      );

      // Mint new NFT
      const { mint: newNftMint, metadata: nftMetadata } = await this.nftMinter.mintDNANFT(
        metadata
      );

      // Inscribe new DNA
      const inscription = await this.bitcoinInscriber.inscribeDNA(
        newDnaSequence,
        newNftMint.toString()
      );

      // Register evolved agent
      const [childAddress] = await this.findAgentAddress(newNftMint);

      await this.program.methods
        .evolveAgent(
          newDnaSequence,
          newNftMint,
          inscription.inscriptionId,
          nftMetadata.uri
        )
        .accounts({
          registry: await this.findRegistryAddress(),
          parentAgent,
          childAgent: childAddress,
          owner: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return {
        childAddress,
        nftMint: newNftMint,
        inscriptionId: inscription.inscriptionId
      };
    } catch (error) {
      console.error('Error evolving agent:', error);
      throw new Error('Agent evolution failed');
    }
  }

  /**
   * Get agent data by NFT mint
   */
  async getAgentByNFT(nftMint: PublicKey): Promise<{
    agent: any;
    dna?: string;
    inscription?: any;
  }> {
    try {
      const [agentAddress] = await this.findAgentAddress(nftMint);
      const agent = await this.program.account.agentRecord.fetch(agentAddress);

      let dna, inscription;
      if (agent.ordinalsId) {
        inscription = await this.bitcoinInscriber.getDNAFromInscription(
          agent.ordinalsId
        );
        dna = inscription?.dnaSequence;
      }

      return { agent, dna, inscription };
    } catch (error) {
      console.error('Error fetching agent:', error);
      throw new Error('Failed to fetch agent data');
    }
  }

  private async findRegistryAddress(): Promise<PublicKey> {
    const [address] = PublicKey.findProgramAddressSync(
      [Buffer.from('registry')],
      this.program.programId
    );
    return address;
  }

  private async findAgentAddress(nftMint: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('agent'), nftMint.toBuffer()],
      this.program.programId
    );
  }
}

// Anchor IDL for the Agent Registry program
const AgentRegistryIDL = {
  "version": "0.1.0",
  "name": "agent_registry",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "registry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "registerAgent",
      "accounts": [
        {
          "name": "registry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "agent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dnaSequence",
          "type": "string"
        },
        {
          "name": "nftMint",
          "type": "publicKey"
        },
        {
          "name": "ordinalsId",
          "type": { "option": "string" }
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "evolveAgent",
      "accounts": [
        {
          "name": "registry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "parentAgent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "childAgent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newDnaSequence",
          "type": "string"
        },
        {
          "name": "newNftMint",
          "type": "publicKey"
        },
        {
          "name": "newOrdinalsId",
          "type": { "option": "string" }
        },
        {
          "name": "newMetadataUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Registry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "agentCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "AgentRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "dnaHash",
            "type": "[u8;32]"
          },
          {
            "name": "nftMint",
            "type": "publicKey"
          },
          {
            "name": "ordinalsId",
            "type": { "option": "string" }
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "generation",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "parent",
            "type": { "option": "publicKey" }
          },
          {
            "name": "children",
            "type": { "vec": "publicKey" }
          },
          {
            "name": "evolutionCount",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "AgentRegistered",
      "fields": [
        {
          "name": "agent",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "dnaHash",
          "type": "[u8;32]",
          "index": false
        },
        {
          "name": "nftMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ordinalsId",
          "type": { "option": "string" },
          "index": false
        },
        {
          "name": "generation",
          "type": "u32",
          "index": false
        }
      ]
    },
    {
      "name": "AgentEvolved",
      "fields": [
        {
          "name": "parent",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "child",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newDnaHash",
          "type": "[u8;32]",
          "index": false
        },
        {
          "name": "newNftMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "newOrdinalsId",
          "type": { "option": "string" },
          "index": false
        },
        {
          "name": "generation",
          "type": "u32",
          "index": false
        }
      ]
    }
  ]
};
