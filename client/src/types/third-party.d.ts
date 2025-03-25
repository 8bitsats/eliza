// Type declarations for third-party libraries that don't have or need complete typings

// Node.js built-ins
declare var process: {
  env: {
    [key: string]: string | undefined;
  };
  cwd(): string;
};

declare var __dirname: string;

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
}

// File system
declare module 'fs' {
  export function readFileSync(path: string, options?: { encoding?: string }): string | Buffer;
  export function writeFileSync(path: string, data: string | Buffer, options?: { encoding?: string }): void;
  export function existsSync(path: string): boolean;
}

// Environment variables
declare module 'dotenv' {
  export function config(options?: { path?: string }): { parsed?: { [key: string]: string } };
}

// HTTP client
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
  }

  export function get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>>;
  export function post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>>;
}

// Canvas
declare module 'canvas' {
  export function createCanvas(width: number, height: number): any;
}

// Crypto
declare module 'crypto' {
  export function createHash(algorithm: string): {
    update(data: string): any;
    digest(encoding: string): string;
  };
}

// Util
declare module 'util' {
  export function promisify(original: Function): Function;
}

// Child process
declare module 'child_process' {
  export function exec(command: string, options?: any): Promise<{ stdout: string; stderr: string }>;
}

// Solana Web3.js
declare module '@solana/web3.js' {
  export class PublicKey {
    constructor(value: string | Uint8Array | number[] | Buffer);
    equals(publicKey: PublicKey): boolean;
    toBase58(): string;
    toBuffer(): Buffer;
    toString(): string;
    toJSON(): string;
  }

  export class Connection {
    constructor(endpoint: string, commitment?: string);
    getBalance(publicKey: PublicKey): Promise<number>;
    getAccountInfo(publicKey: PublicKey, commitment?: Commitment): Promise<any>;
    getLatestBlockhash(commitment?: Commitment): Promise<{ blockhash: string; lastValidBlockHeight: number }>;
    confirmTransaction(signature: string): Promise<any>;
    sendTransaction(transaction: Transaction): Promise<string>;
    getTokenAccountsByOwner(owner: PublicKey, filter: any): Promise<any>;
  }

  export class Transaction {
    constructor(options?: any);
    add(...instructions: TransactionInstruction[]): Transaction;
    sign(...signers: any[]): void;
    serialize(): Buffer;
    recentBlockhash: string | null;
    feePayer: PublicKey | null;
  }

  export class TransactionInstruction {
    constructor(options: { keys: any[]; programId: PublicKey; data: Buffer });
    keys: any[];
    programId: PublicKey;
    data: Buffer;
  }

  export type Commitment = string;
  export type SignatureResult = any;
  export type Finality = any;
  export type TokenAmount = any;
}

// Metaplex
declare module '@metaplex-foundation/umi-bundle-defaults' {
  export function createUmi(): any;
}

declare module '@metaplex-foundation/mpl-core' {
  export const mplCore: any;
}

declare module '@metaplex-foundation/umi' {
  export const umi: any;
}

declare module '@metaplex-foundation/js' {
  export const Metaplex: any;
  export const keypairIdentity: any;
  export const toMetaplexFile: any;
}

// Token Metadata
declare module '@metaplex-foundation/mpl-token-metadata' {
  export const createCreateMetadataAccountV3Instruction: any;
  export const TokenStandard: any;
}

// Raydium SDK
declare module '@raydium-io/raydium-sdk' {
  export const Market: any;
  export const TokenSwap: any;
  export const Liquidity: any;
  export const Token: any;
  export const Currency: any;
  export const MAINNET_PROGRAM_ID: any;
}

// Three.js OrbitControls
declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, EventDispatcher } from 'three';
  
  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: any;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    autoRotate: boolean;
    update(): boolean;
    addEventListener(type: string, listener: (event: any) => void): void;
    removeEventListener(type: string, listener: (event: any) => void): void;
    dispose(): void;
  }
}
