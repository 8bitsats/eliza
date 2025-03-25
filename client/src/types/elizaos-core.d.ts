declare module '@elizaos/core' {
  export type UUID = string;
  
  export interface Character {
    id: UUID;
    name: string;
    description?: string;
    avatarUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    // Add other character properties as needed
  }

  export interface Content {
    type: string;
    text?: string;
    url?: string;
    mime?: string;
    [key: string]: any;
  }
}
