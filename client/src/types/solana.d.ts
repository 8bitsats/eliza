interface SolanaWindow extends Window {
  solana: {
    publicKey: any;
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
    sendTransaction(transaction: any, connection?: any): Promise<string>;
    connect(): Promise<{ publicKey: any }>;
    disconnect(): Promise<void>;
    isPhantom?: boolean;
  }
}

declare const window: SolanaWindow;
